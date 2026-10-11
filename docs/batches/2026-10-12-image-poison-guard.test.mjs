#!/usr/bin/env node
/**
 * 2026-10-12 图像坏字节闸（1210 毒化批）——`thincoder-core/tools/file.mjs` `read_image` 魔数嗅探。
 *
 * 病灶（真机会话 478ee996 实录 + 网关探针双证）：垃圾 ∕ 截断件（扩展名 .png 装非图字节）经 `read_image`
 * 读出 ⇒ `{text, images}` 注入运行态历史 ⇒ 网关对坏图 part 恒 400（`[1210]图片输入格式/解析错误`——
 * 上游经反代折返 502 `translation_failed`）⇒ **该会话后续每个请求连带失败**（历史 part 不随回合失败回滚），
 * 直到端侧重启重建（持久化历史仅存文本 part——图不落盘历史）。修复 = 读取时**内容魔数两判**：
 * 垃圾 ⇒ 工具报错（错误不注入图像 ⇒ 会话保持干净）；错标件（真 GIF 装在 .jpg 名下）⇒ 按**嗅探 mime**
 * 出 dataURL（网关探针：真 gif 明标 image/gif 200 ∕ 垃圾明标 image/png 1210 ∕ 有效 png 200）。
 *
 * 用例：① 嗅探五型命中 ∕ 垃圾 ∕ 短档；② execute 坏字节拒（throw 且零 images）；
 * ③ execute 错标纠偏（.jpg 名下真 GIF ⇒ `data:image/gif`）；④ execute 有效 PNG 原形不变。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const ROOT = fileURLToPath(new URL("../../", import.meta.url))
const { readImageTool, sniffImageMime } = await import(pathToFileURL(resolve(ROOT, "thincoder-core/tools/file.mjs")).href)

// 最小真图字节（结构头即可过嗅探——网关判据同层；非整图渲染判据）。Buffer.concat（`+` 会走 toString 串接——字节面即毁）
const PNG = Buffer.concat([Buffer.from("89504e470d0a1a0a0000000d49484452", "hex"), Buffer.alloc(8)])
const JPEG = Buffer.concat([Buffer.from("ffd8ffe000104a46494600010100000100010000", "hex"), Buffer.alloc(8)])
const GIF = Buffer.concat([Buffer.from("4749463839610100010080000000", "hex"), Buffer.alloc(8)])
const WEBP = Buffer.concat([Buffer.from("52494646140000005745425056503820", "hex"), Buffer.alloc(8)])
const GARBAGE = Buffer.from("this is not an image at all, just garbage bytes 1234567890")

test("嗅探：五型命中 ∕ 垃圾 ∕ 短档判 null", () => {
  assert.equal(sniffImageMime(PNG), "image/png")
  assert.equal(sniffImageMime(JPEG), "image/jpeg")
  assert.equal(sniffImageMime(GIF), "image/gif")
  assert.equal(sniffImageMime(WEBP), "image/webp")
  assert.equal(sniffImageMime(GARBAGE), null)
  assert.equal(sniffImageMime(PNG.slice(0, 8)), null, "短档（<12B）⇒ null（禁半头假阳）")
  assert.equal(sniffImageMime(undefined), null)
})

test("execute：坏字节拒注入（throw 且报文点名毒化后果）", async () => {
  const dir = mkdtempSync(join(tmpdir(), "img-poison-"))
  const file = join(dir, "paste-bad.png")
  writeFileSync(file, GARBAGE)
  const ctx = { agent: { provider: { model: "glm-5.3-flash" } }, cwd: dir }
  await assert.rejects(
    () => readImageTool.execute({ path: file }, ctx),
    (err) => /Corrupt or unsupported image/.test(err.message) && /every subsequent request/.test(err.message),
  )
})

test("execute：错标纠偏——.jpg 名下真 GIF ⇒ dataURL 明标 image/gif", async () => {
  const dir = mkdtempSync(join(tmpdir(), "img-poison-"))
  const file = join(dir, "paste-gif.jpg")
  writeFileSync(file, GIF)
  const ctx = { agent: { provider: { model: "glm-5.3-flash" } }, cwd: dir }
  const out = JSON.parse(await readImageTool.execute({ path: file }, ctx))
  assert.equal(out.images.length, 1)
  assert.match(out.images[0].image_url.url, /^data:image\/gif;base64,/, "真 mime 随嗅探（网关嗅探容忍错标——明标更诚实）")
  assert.match(out.text, /\(image\/gif, \d+ bytes\)/)
})

test("execute：有效 PNG 原形不变（回归面）", async () => {
  const dir = mkdtempSync(join(tmpdir(), "img-poison-"))
  const file = join(dir, "paste-ok.png")
  writeFileSync(file, PNG)
  const ctx = { agent: { provider: { model: "glm-5.3-flash" } }, cwd: dir }
  const out = JSON.parse(await readImageTool.execute({ path: file }, ctx))
  assert.match(out.images[0].image_url.url, /^data:image\/png;base64,/)
  assert.match(out.text, /\(image\/png, \d+ bytes\)/)
})
