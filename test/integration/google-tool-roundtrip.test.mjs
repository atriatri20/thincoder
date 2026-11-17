/**
 * CLI 1-4：Google/Gemini 原生通道在一次工具调用后，能从 functionResponse 继续回答。
 * 本地脚本化端点零外网；真 CLI ACP 进程与真实 read 工具保持用户业务入口。
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { createServer } from "node:http"
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { removeTempDirBestEffort } from "../teardown.mjs"
import { openSession, say, startCli } from "./fixtures/acp-cli.mjs"

function sseReply(res, parts) {
  res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" })
  res.write(`data: ${JSON.stringify({
    candidates: [{ content: { role: "model", parts }, finishReason: "STOP" }],
    usageMetadata: { promptTokenCount: 20, candidatesTokenCount: 10, totalTokenCount: 30 },
  })}\n\n`)
  res.end()
}

async function fakeGemini() {
  const requests = []
  const server = createServer((req, res) => {
    let raw = ""
    req.on("data", (chunk) => { raw += chunk })
    req.on("end", () => {
      const body = JSON.parse(raw)
      requests.push({ url: req.url, body })
      if (requests.length === 1) {
        return sseReply(res, [{
          functionCall: { name: "read", args: { path: "note.txt" } },
          thoughtSignature: "sig-google-roundtrip",
        }])
      }
      const results = (body.contents ?? []).flatMap((content) => content.parts ?? [])
        .filter((part) => part.functionResponse)
        .map((part) => String(part.functionResponse.response?.result ?? ""))
      return sseReply(res, [{ text: `Answer: ${results.join(" / ") || "no tool results"}` }])
    })
  })
  const port = await new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server.address().port)))
  return {
    port,
    requests,
    close: () => new Promise((resolve) => {
      server.closeAllConnections?.()
      server.close(() => resolve())
    }),
  }
}

test("CLI 1-4 边界：Gemini 工具调用与结果回传后继续对话，签名随调用回放", { timeout: 120_000 }, async (t) => {
  const home = mkdtempSync(join(tmpdir(), "tc-int-google-home-"))
  const cwd = mkdtempSync(join(tmpdir(), "tc-int-google-proj-"))
  const endpoint = await fakeGemini()
  let cli
  t.after(async () => {
    if (cli) await cli.stop()
    await endpoint.close()
    removeTempDirBestEffort(home)
    removeTempDirBestEffort(cwd)
  })
  writeFileSync(join(cwd, "note.txt"), "PINEAPPLE-GOOGLE-42\n")
  mkdirSync(join(home, ".thincoder"), { recursive: true })
  writeFileSync(join(home, ".thincoder", "config.json"), JSON.stringify({
    defaultModel: "fake-google:gemini-fake-1",
    providers: [{
      name: "fake-google",
      baseURL: `http://127.0.0.1:${endpoint.port}/v1beta`,
      format: "google",
      apiKey: "test-key",
      modelContext: { "gemini-fake-1": 256 },
    }],
  }, null, 2))

  cli = startCli({ home, cwd })
  const sessionId = await openSession(cli, cwd)
  const reply = await say(cli, sessionId, "Read note.txt and tell me what it says.")
  assert.match(reply, /PINEAPPLE-GOOGLE-42/, `回复必须引用真实工具结果：${reply}`)

  assert.ok(endpoint.requests.length >= 2, "工具回合之后确实发起了后续模型请求")
  const next = endpoint.requests.find((entry) => JSON.stringify(entry.body).includes("functionResponse"))?.body
  assert.ok(next, "后续请求必须包含工具结果回放")
  const parts = (next.contents ?? []).flatMap((content) => content.parts ?? [])
  const call = parts.find((part) => part.functionCall?.name === "read")
  assert.ok(call, `后续请求必须包含 assistant 的 functionCall：${JSON.stringify(next.contents)}`)
  assert.equal(call.thoughtSignature, "sig-google-roundtrip", "functionCall 必须回带原签名")
  const response = parts.find((part) => part.functionResponse?.name === "read")
  assert.ok(response, "后续请求必须包含 functionResponse，而不是普通用户文本")
  assert.match(String(response.functionResponse.response?.result ?? ""), /PINEAPPLE-GOOGLE-42/)
})
