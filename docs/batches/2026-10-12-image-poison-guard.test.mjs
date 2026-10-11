#!/usr/bin/env node
/**
 * 2026-10-12 图像坏件闸（1210 毒化批）——`read_image` 完整可解码拒注入 ∕ 发送侧坏图隔离。
 *
 * 病灶（真机会话 478ee996 实录 + wire-dump 抓包 + 网关探针三证）：伪件 ∕ 截断件（头魔数可真——
 * 「真魔数 + 偽内部」117B 手拼件）经 read_image 读出 ⇒ `{text, images}` 注入运行态历史 ⇒
 * **contextHistory 持久化含 base64 图 part** ⇒ 坏图**跨重启重放** ⇒ 上游完整解码恒 400
 * （`[1210]图片输入格式/解析错误`）⇒ 该会话后续每个请求连带失败（连纯文本也死——毒在请求体里），
 * 切渠道无效，直到人工清历史。修复两层：
 *  ① 读侧（tools/file.mjs）：`rasterImageComplete` 完整可解码判（PNG = CRC ∕ zlib 膨胀尺寸全解码
 *     四关——头验拦不住伪件；JPEG/GIF/WebP = 尾标记 ∕ 长度场完整性）⇒ 坏件拒注入（报错不进历史）；
 *  ② 发侧（provider/normalize.mjs `quarantineMalformedImages`）：请求组装时逐 data-URL 图 part 同判
 *     ⇒ 坏 part 占位替换 ⇒ **带毒旧会话下一回合自愈**。
 * 网关判据实测（GLM 中转）：真 gif 明标 image/gif 200 ∕ 垃圾明标 png 1210 ∕ 头真魔数伪 png 1210 ∕
 * 有效 png 200。错标纠偏：读出 dataURL 按**嗅探 mime** 明标（错标件网关亦 200——明标更诚实）。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { crc32, deflateSync } from "node:zlib"

const ROOT = fileURLToPath(new URL("../../", import.meta.url))
const { readImageTool, sniffImageMime } = await import(pathToFileURL(resolve(ROOT, "thincoder-core/tools/file.mjs")).href)
const { quarantineMalformedImages, rasterImageComplete } = await import(pathToFileURL(resolve(ROOT, "thincoder-core/provider/normalize.mjs")).href)

// ─── 真（完整）图夹具：结构合法到「判据可判完整」层 ─────────────────────────────

const PNG = (() => {
  const w = 6, h = 4
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, "latin1"), data])))
    return Buffer.concat([len, Buffer.from(type, "latin1"), data, crc])
  }
  const raw = Buffer.concat(Array.from({ length: h }, () => Buffer.concat([Buffer.from([0]), Buffer.alloc(w * 3, 0x4a)])))
  const ihdr = (() => { const d = Buffer.alloc(13); d.writeUInt32BE(w, 0); d.writeUInt32BE(h, 4); d[8] = 8; d[9] = 2; return d })()
  return Buffer.concat([Buffer.from("89504e470d0a1a0a", "hex"), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))])
})()

const JPEG = Buffer.concat([Buffer.from("ffd8ffe000104a46494600010100000100010000", "hex"), Buffer.alloc(8), Buffer.from("ffd9", "hex")])
const GIF = Buffer.from("47494638396101000100800000000000002c00000000010001000002024401003b", "hex")
const WEBP = Buffer.from("5249464614000000574542505650382000000000", "hex").subarray(0, 20)
const GARBAGE = Buffer.from("this is not an image at all, just garbage bytes 1234567890")

// 真魔数 + 偽内部（真机 1210 毒源同构——117B 手拼件：头 8 字节真 PNG，内部 CRC 错 ∕ IDAT 非法 zlib 流）
const FAKE_PNG = Buffer.concat([
  Buffer.from("89504e470d0a1a0a0000000d49484452000000780000005008020000", "hex"),
  Buffer.from("00914f8c5d0000000c4944415408d763f8ffff3f00040401ff", "hex"),
  Buffer.from("0000000049454e44ae426082", "hex"),
])

test("嗅探：五型命中 ∕ 垃圾 ∕ 短档判 null", () => {
  assert.equal(sniffImageMime(PNG), "image/png")
  assert.equal(sniffImageMime(JPEG), "image/jpeg")
  assert.equal(sniffImageMime(GIF), "image/gif")
  assert.equal(sniffImageMime(WEBP), "image/webp")
  assert.equal(sniffImageMime(GARBAGE), null)
  assert.equal(sniffImageMime(PNG.slice(0, 8)), null, "短档（<12B）⇒ null（禁半头假阳）")
  assert.equal(sniffImageMime(undefined), null)
})

test("完整判据：真件全过 ∕ 截断件 ∕ 伪件（头验盲区回归）判 false", () => {
  assert.equal(rasterImageComplete(PNG), true, "真 PNG：CRC ∕ zlib 膨胀尺寸全解码四关全过")
  assert.equal(rasterImageComplete(JPEG), true, "真 JPEG：EOI 尾标记")
  assert.equal(rasterImageComplete(GIF), true, "真 GIF：图像描述符 + trailer")
  assert.equal(rasterImageComplete(GARBAGE), false, "垃圾字节")
  assert.equal(rasterImageComplete(FAKE_PNG), false, "真魔数伪 PNG（头验照过——盲区所在）：CRC ∕ zlib 关拦下")
  assert.equal(rasterImageComplete(PNG.slice(0, PNG.length - 16)), false, "截断真 PNG（IDAT CRC 被切——CRC 关拦下）")
  assert.equal(rasterImageComplete(JPEG.slice(0, JPEG.length - 2)), false, "截断 JPEG（缺 EOI）")
})

test("execute：伪件拒注入（报文点名毒化后果）", async () => {
  const dir = mkdtempSync(join(tmpdir(), "img-poison-"))
  writeFileSync(join(dir, "paste-fake.png"), FAKE_PNG)
  const ctx = { agent: { provider: { model: "glm-5.3-flash" } }, cwd: dir }
  await assert.rejects(
    () => readImageTool.execute({ path: join(dir, "paste-fake.png") }, ctx),
    (err) => /Corrupt, truncated/.test(err.message) && /every subsequent request/.test(err.message),
  )
})

test("execute：错标纠偏——.jpg 名下真 GIF ⇒ dataURL 明标 image/gif", async () => {
  const dir = mkdtempSync(join(tmpdir(), "img-poison-"))
  writeFileSync(join(dir, "paste-gif.jpg"), GIF)
  const ctx = { agent: { provider: { model: "glm-5.3-flash" } }, cwd: dir }
  const out = JSON.parse(await readImageTool.execute({ path: join(dir, "paste-gif.jpg") }, ctx))
  assert.equal(out.images.length, 1)
  assert.match(out.images[0].image_url.url, /^data:image\/gif;base64,/, "真 mime 随嗅探（网关嗅探容忍错标——明标更诚实）")
  assert.match(out.text, /\(image\/gif, \d+ bytes\)/)
})

test("execute：有效 PNG 原形不变（回归面）", async () => {
  const dir = mkdtempSync(join(tmpdir(), "img-poison-"))
  writeFileSync(join(dir, "paste-ok.png"), PNG)
  const ctx = { agent: { provider: { model: "glm-5.3-flash" } }, cwd: dir }
  const out = JSON.parse(await readImageTool.execute({ path: join(dir, "paste-ok.png") }, ctx))
  assert.match(out.images[0].image_url.url, /^data:image\/png;base64,/)
  assert.match(out.text, /\(image\/png, \d+ bytes\)/)
})

// ─── 装配期隔离（contextHistory 持久化含 base64 图 part ⇒ 坏图跨重启重放——占位替换 ⇒ 旧会话自愈）──

test("隔离：坏图 part ⇒ 占位文本；好图 ∕ http 引用 ∕ 纯文本消息原样", () => {
  const bad = { type: "image_url", image_url: { url: "data:image/png;base64," + Buffer.from("garbage bytes not an image 1234").toString("base64") } }
  const fake = { type: "image_url", image_url: { url: "data:image/png;base64," + FAKE_PNG.toString("base64") } }
  const good = { type: "image_url", image_url: { url: "data:image/png;base64," + PNG.toString("base64") } }
  const httpRef = { type: "image_url", image_url: { url: "https://example.com/pic.png" } }
  const messages = [
    { role: "user", content: "纯文本" },
    { role: "user", content: [{ type: "text", text: "看图" }, bad] },
    { role: "user", content: [{ type: "text", text: "伪图" }, fake] },
    { role: "user", content: [{ type: "text", text: "看图" }, good] },
    { role: "user", content: [{ type: "text", text: "网图" }, httpRef] },
  ]
  const out = quarantineMalformedImages(messages)
  assert.equal(out[0], messages[0], "纯文本消息：原引用（零重建）")
  assert.equal(out[3], messages[3], "好图消息：原引用")
  assert.equal(out[4], messages[4], "http 引用：原样（本地不可验——上游取件）")
  assert.equal(out[1].content[1].type, "text", "垃圾图 part ⇒ 文本占位")
  assert.equal(out[2].content[1].type, "text", "伪图 part（头真魔数）⇒ 文本占位——盲区同拦")
  assert.match(out[1].content[1].text, /malformed or corrupt image content/)
  const empty = []
  assert.equal(quarantineMalformedImages(empty), empty, "空表：原引用")
  assert.equal(quarantineMalformedImages(null), null)
  assert.equal(quarantineMalformedImages(out), out, "隔离后重入：幂等（零重建）")
})
