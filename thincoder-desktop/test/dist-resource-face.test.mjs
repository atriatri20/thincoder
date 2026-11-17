import assert from "node:assert/strict"
import { after, test } from "node:test"
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import {
  RESOURCE_DIRS, RESOURCE_EXPECT, repoMarkdownFace, resourceCount,
} from "../scripts/dist-resource-face.mjs"

const work = mkdtempSync(join(tmpdir(), "desktop-dist-resources-"))
after(() => rmSync(work, { recursive: true, force: true }))

test("资源面递归包含 prompts/knowledge 与 knowledge，摘要以相对路径为键", () => {
  mkdirSync(join(work, "prompts", "knowledge", "nested"), { recursive: true })
  mkdirSync(join(work, "knowledge", "guides"), { recursive: true })
  writeFileSync(join(work, "prompts", "root.md"), "root")
  writeFileSync(join(work, "prompts", "knowledge", "nested", "item.md"), "nested")
  writeFileSync(join(work, "prompts", "knowledge", "ignored.txt"), "not markdown")
  writeFileSync(join(work, "knowledge", "guides", "item.md"), "knowledge")

  const prompts = repoMarkdownFace(work, "prompts")
  assert.deepEqual([...prompts.keys()].sort(), ["knowledge/nested/item.md", "root.md"])
  assert.equal(resourceCount("prompts", prompts), 1, "prompts 固定档数只算根档")
  assert.deepEqual([...repoMarkdownFace(work, "knowledge").keys()], ["guides/item.md"])
  assert.deepEqual(RESOURCE_DIRS, ["prompts", "tool-docs", "knowledge"])
})

test("当前 core 的递归资源集合与固定根档/工具档口径一致", () => {
  const core = fileURLToPath(new URL("../../thincoder-core", import.meta.url))
  const prompts = repoMarkdownFace(core, "prompts")
  assert.equal(resourceCount("prompts", prompts), RESOURCE_EXPECT.prompts)
  assert.equal([...prompts.keys()].some((name) => name.startsWith("knowledge/")), true)
  assert.equal(resourceCount("tool-docs", repoMarkdownFace(core, "tool-docs")), RESOURCE_EXPECT["tool-docs"])
  assert.equal(repoMarkdownFace(core, "knowledge").size > 0, true)
})
