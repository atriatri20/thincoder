# 2026-10-15 · 成员面拉取就地绑凭据
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-15 · 来源 = 用户 2026-10-15 00:34 原话（「你现在设计的这种绑定git凭据的方式非常不合理，使用也不方便，也不符合用户使用习惯。」）——父侧三案呈报（A 就地绑 ∥ B OAuth 一键 ∥ C 改源级默认），用户取 A；保「凭据 = 成员本人」约束（2026-10-13 裁在册）。
> 台账 = #1454（server · 归批）。前情 = docs/batches/2026-10-13-member-face-chat.md §2（已收口 2026-10-14）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-15

**本批条目（1 项——需求已裁在册）**

| # | 条目 | 需求锚 | 裁剪 |
|---|---|---|---|
| 1 | 拉取凭据绑定就地化：拉取时缺凭据 ⇒ **拉取流内当场录入**（主机 + 用户名 + 令牌）——成功即记住复用、自动续拉；公开仓可跳过；无效凭据同窗复录；账户页 Git 凭据卡保留为管理面（改/删）；**「凭据 = 成员本人」约束不变**（不得引入平台/源级凭据——用户否案） | 功能点 50 ⑨（`:329`）+ **AC-50 ⑦**（`:452`）——用户 2026-10-15 00:34 裁（原话「你现在设计的这种绑定git凭据的方式非常不合理，使用也不方便，也不符合用户使用习惯」；父侧三案呈报取 **A**） | 不做 OAuth（B 未选）∥ 不做源级默认（C 未选）∥ 不动「按次取件 ∥ 用毕即清」与加密/审计机制本体 |

**关键判据（收口对照用）**：① 缺凭据 ⇒ 表单在拉取窗内揭示（主机 = 项目 host；表单期 `POST …/pulls` 零发）；② `PUT` 恰一（三字段）⇒ `POST` 恰一（自动续拉）；③ 二次拉取零表单（绑一次复用）；④ 公开仓跳过 ⇒ 零 `PUT`；预检失败 ⇒ 降级直 POST（服务端语义零改）；⑤ 账户页卡与三端点零增删；⑥ 盒 auth 消息 = 新句（部署随动 = 盒镜像重建）。

**授权口径**：全链自动（用户 00:08「都自动跑到交付吧」）：设计（#38 落盘）→ 评审（自动）→ 批准（父侧代签）→ 实施（eng-coder）→ 交付。**账上不许留占位**——本条即 §1 回填（上抛 [知会]「§1 仍为模板占位」已办）。

**父侧定序（R87——2026-10-15 01:2x）**：本批**先落**（评审 #44 ＋ 修正轮 #46 完成、修正经父侧复核通过）；`views-me-chat.mjs` 同触兄弟批 = `member-face-parity`（#1455）实施随本批之后（其设计按「合并序由父侧定」在册 R87）。

**（归因补记 · 父侧）**：修正轮披露 1 所述「doc-check 读数下降归因未明」= 清账轮 3（`docs/batches/2026-10-15-ledger-cleanup-3.md`）父侧直接修复所致——`scripts/doc-check-anchors.mjs` 占位类扩面（`x`/`b`）＋ 6 枚锚补全限定 ＋ 行宽折行 3 处；非本批两档变化（本批两档项集零增如实）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（initial 轮落笔（设计档五处 · 六条目 · 机检基线对照在册））
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 2. 批次任务与设计（eng-designer · 2026-10-15 · round = initial）

**来源与授权**：用户 2026-10-15 00:34 裁「**A 就地绑**」（父侧三案呈报：A 就地绑 ∥ B OAuth 一键 ∥ C 改源级默认）；需求依据 = `docs/server/requirements/PROJECT.md` 功能点 50 ⑨（:329）∥ AC-50 ⑦（:452）；约束保「凭据 = 成员本人」（2026-10-13 裁在册——KD-SV-204）。设计轮口径：**零产品码 ∥ 零真机动作 ∥ 需求档零触**（零需回笔——功能点 50 ⑨ ∥ AC-50 ⑦ 已在册）。
**批档 §1 已回填在盘（主 agent 笔——`:6` ∥ `:16`）**——任务书由 spawn 携带（目标/约束/交付格式齐备），本席照此执行（执行期 §1 未落——异常已列报，随回填闭合）。

**条目（本批覆盖——六条）**

| # | 条目 | 判据（可机检） | 回指 |
|---|---|---|---|
| ① | 检测点 = 页面侧提交前预检（既有 `GET /api/me/git-credentials`；host = 所选项目 address 首段小写） | 预检缺 ⇒ 表单揭示前 `POST …/pulls` 零发；预检失败 ⇒ 直 POST（降级腿） | 功能点 50 ⑨；KD-SV-205 |
| ② | 流内凭据表单（主机只读 ∥ 用户名 ∥ 令牌——`me.gitCred.*` 三键复用 ∥ 零回显沿族） | 表单在场（主机文本 = 项目 host）；`PUT` 恰一（host/username/secret 逐字）；表单期零网络调用 | 功能点 50 ⑨（「主机+用户名+令牌」） |
| ③ | 保存 ⇒ **自动续拉**（capture 原 target+dir；无二次点击）+ 成功即复用 | `PUT` 后 `POST …/pulls` 恰一（同参）；二次拉取（凭据在册）⇒ 零表单直拉 | 功能点 50 ⑨（「成功即记住复用」） |
| ④ | 绑定无效（盒判 `kind:"auth"`）⇒ 同窗就地更新 ⇒ 重拉（用户名按已取清单预填 ∥ 重试钮在场） | auth 失败 ⇒ 表单复现（用户名预填）⇒ 更新保存 ⇒ `PUT` + `POST` 各一 | AC-50 ⑦（「流内当场录入」含修正径） |
| ⑤ | 公开仓不回归（缺凭据 ⇒「跳过」直拉）+ 账户页卡零改（管理面保留 ∥ 端点零增） | 跳过腿 ⇒ 零 `PUT`；`views-me.mjs` 凭据卡在 ∥ `gateway/API.md` §2.11 零改 | 功能点 50 ⑨（账户页卡 = 管理面保留） |
| ⑥ | 失败消息面收正（盒 auth 句改就地措辞——去「账户页绑定」指引）+ 页面档位拆分（越 500 软线 ⇒ 外拆） | `classifyCloneFailure` auth message 断言；`views-me-chat.mjs` ≤500（canon 计法） | AC-50 ⑦ 体验面；档位纪律 |

**明确不在本批**：产品码（= 实施轮 · eng-coder——本批零写）∥ 真机动作/盒镜像重建（= 收口轮——R81）∥ 需求档笔（= 主 agent——本批零需回笔）∥ OAuth/令牌换发（B——否）∥ 源级默认凭据（C——否）∥ 服务端新端点/新错误码（零增）∥ 推送面/凭据编辑 UI（沿既有）∥ 会话删除等 member-face-chat 在册余项（R79）。

**设计档落点（本轮已落笔——五处）**

| 档 | 改动 |
|---|---|
| `docs/server/design/agent/MEMBER-AGENT.md`（机制单源） | §2 增 **KD-SV-205** + KD-SV-155/204 入径句收正；§3.6 拉仓流程重写（六步——+提交前预检/就地录入/auth 同窗更新；盒消息措辞收正）；§5 行账（页件 500 ⇒ ≈430 ∥ 新档 ≈180 ∥ 两 me 表 158 ∥ 159 实读收正 ⇒ ≈161 ∥ ≈162 ∥ 随正件/测试链补登）；§6 增 AC-50⑦ 行 + AC-50⑥「155」判据收正；§7 增 N79 ∥ B73 ∥ E58（E57 收正）；§9 增 R81（盒镜像随动）∥ R82（测试链随正五件）；变更记录 |
| `docs/server/design/webui/CHAT.md` | §2.2 差异③ 增拉取凭据就地绑（含续行两句）；§3 页件行随正 + 新档行 + 键族登记一条（+3 键/表）；§4 增本批验收行；§5 增本批不做面；§6 增 ⑧；变更记录 |
| `docs/server/design/webui/ME.md` | §2.3 定位句补入径（入径 = 拉取流内就地绑 ∥ 本卡 = 管理面）；§3 两 i18n 行实读收正（158 ∥ 159）+ 本批 +3 键；变更记录 |
| `docs/server/design/webui/WEBUI.md` | §1 静态面 + 新档件行；JS 链 65 ⇒ **66**；档目链 67 ∥ 68 ⇒ **68 ∥ 69**；变更记录（**D3 计数纪律强制项**——加公开档必动链） |
| `gateway/API.md` | **零改**（无新端点/新码——预检全在页面侧） |

**机制设计（全文 = `agent/MEMBER-AGENT.md` §3.6 + KD-SV-205；此处只落口径要点）**
① 预检 = 提交前页面侧一读（清单对 host；host 判据与 `member-pull.mjs` 的 `hostOfAddress` 同判）；② 三态 = A（凭据在册——现状径）/ B-missing（提示 + 表单 + 跳过钮 + 提交钮改「保存并继续拉取」）/ B-invalid（失败 note + 表单 + 重试钮 + 提交钮同改）；③ 保存成功 ⇒ 立即以 capture 的 target+dir 续发 `POST …/pulls` ⇒ 轮询（③ 单弹窗内联区——**第二弹窗不可行**：`modal.mjs` 单例「开新先关旧」会顶掉拉取窗、轮询态随失）；④ 表单 = `field()` 三行复用 `me.gitCred.*` 键 + 主机只读展示（{host}），零客户端校验（服务端消息即人话）；⑤ 跳过 = 直 POST（匿名——公开仓）；⑥ 预检失败 ⇒ 降级直 POST（服务端兜底语义零改）；⑦ 项目选择变更 ⇒ 复位态 A + 清用户/密字段（防密文绑错 host）；⑧ 盒消息 = `deploy/sandbox/member-shell/pull.mjs:40` 改「凭据缺失或无效——录入或更新该主机的 Git 凭据后重试」（部署随动 = 盒镜像重建；旧盒在途期旧措辞——行为零差；盒测试只断言 `kind` 不断文案 ⇒ 零随正）；⑨ 拆档 = 拉取弹窗 + 纯件两枚外迁新档，**`views-me-chat.mjs` 兼容重导出**（沿 `views-chat-messages` 先例——旧测试面零改）。

**受影响文件与测试覆盖**

| 件 | 现读（2026-10-15 实读——内容行口径） | 预期 | 说明 |
|---|---|---|---|
| `thincoder-server/public/views-me-chat.mjs` | **500**（内容行口径——表头口径；canon 计法 = **501**——越 500 软线） | ≈430（估数——净 ≈−70） | 拉取弹窗/凭据就地绑外迁；兼容重导出两纯件 |
| `thincoder-server/public/views-me-chat-pull.mjs` | 新 | ≈180 | 拉取弹窗（四态轮询）+ 凭据就地绑（KD-SV-205）∥ 纯件两枚 |
| `thincoder-server/public/i18n-zh-me.mjs` | **158** | ≈161（+3 键） | `me.chat.pullCredNeed`/`pullCredSave`/`pullCredSkip` |
| `thincoder-server/public/i18n-en-me.mjs` | **159** | ≈162（+3 键） | 两表逐键同步（en 零 CJK） |
| `thincoder-server/deploy/sandbox/member-shell/pull.mjs` | **114** | 114（±0） | auth 句整句替换（盒镜像内件——R81） |
| 测试档 `docs/batches/2026-10-15-member-pull-inline-cred.test.mjs` | 新 | ≈260 | 用例 N79 ∥ B73 ∥ E58（走法 = `node --import ./thincoder-server/test/rc-resolve.mjs --test <档>`） |
| 随正五件（实施轮同拍——R82） | ① `2026-10-08-server-public-structure.test.mjs` ∥ ② `2026-10-11-console-tabs-component.test.mjs` ∥ ③ `2026-10-10-runner-admin-console-ui.test.mjs` ∥ ④ `2026-10-12-team-projects-permissions-ui.test.mjs` ∥ ⑤ `2026-10-15-member-pull-detail-render.test.mjs`——逐件现读 + 增量注 = §9 R82（canon 计法——换行计数：**170 ∥ 497 ∥ 390 ∥ 554 ∥ 38**） | 键数 **1126 ∥ 1131 ⇒ 1129 ∥ 1134**（本批 +3 键/表）∥ 档目 **67 ∥ 68 ⇒ 68 ∥ 69**（UI 代码档 ∥ 含 favicon；+新档）；**同窗他批并计**（member-face-parity 同触指纹/档目链——实施当刻以盘面实读为准） | 见 §9 R82 |
| 零改件 | `src/**`（服务端零改）∥ `gateway/API.md` ∥ `views-me.mjs`（账户页卡）∥ `style.css` ∥ `app.mjs`（import 面零改） | —— | 预检/表单全在页面侧；无新端点/新码/新样式族 |

**验收对照（AC-50 ⑦ 逐条 ⇒ 机检形）**

| AC-50 ⑦ 子句 | 机检形 |
|---|---|
| 拉取缺凭据 ⇒ **流内当场录入**（主机+用户名+令牌） | N79：预检缺 ⇒ 表单揭示（主机文本 = 项目 host）∥ 表单期 `POST …/pulls` 零发 ∥ 填录提交 ⇒ `PUT` 恰一（三字段逐字）∥ 复位腿：项目选择变更 ⇒ 表单复位 + 用户名/密字段清空 + 零 `PUT` |
| 成功即记住复用（**新入径 = 拉取流本身**，非先跳账户页） | N79 续腿：`PUT` 后 `POST` 恰一（自动续拉）∥ 二次拉取（清单在册）⇒ 零表单直拉 ∥ 全程零路由跳转（`PUT` 自窗内发出） |
| 账户页卡 = 管理面保留 | 源面断言：`views-me.mjs` 凭据卡在 ∥ `/api/me/git-credentials*` 三端点零增删（`gateway/API.md` §2.11 零改） |
| 修正径（绑定无效 = 现状可达失败） | E58：`detail.kind:"auth"` ⇒ 表单复现（用户名预填）+ 重试钮 ⇒ 更新 ⇒ `PUT` + `POST` 各一 |
| 公开仓不回归 | B73：缺凭据 + 跳过 ⇒ 零 `PUT` 直 POST ∥ 预检失败 ⇒ 直 POST |
| 消息面收正 | 盒件断言：`classifyCloneFailure(...)` auth 分支 message = 新句（去「账户页绑定」指引） |
| 档位纪律 | canon 腿：拆后 `views-me-chat.mjs` ≤500 ∧ 新档同守（代码段零 CJK ∥ 行宽 ≤300 ∥ 零外链 ∥ 零 `innerHTML`） |

**关键决策（含被否）**
- **D1 检测点 = 页面侧预检**（否：服务端 409 `credential_required`——新错误码 + 公开仓回归 + 仍须失败径；页面侧更短链且零服务端语义变更）。
- **D2 表单 = 拉取窗内内联区**（否：第二弹窗——`modal.mjs` 单例顶掉拉取窗、轮询态随失）。
- **D3 主机只读**（否：可编辑——误绑他主机；host 由项目地址派生，只读即真源）。
- **D4 保存成功 ⇒ 自动续拉**（否：二次点击——「保存并继续拉取」语义即此）。
- **D5 跳过钮保留**（否：强制录入——公开仓现状可达，不可回归）。
- **D6 消息面收正 + 部署随动顺序**（盒句去账户页指引；镜像重建归收口轮；旧盒在途期旧措辞 = 零行为差——披露）。
- **D7 拆档先于增行**（`views-me-chat.mjs` 已 **501**（canon——越 500 软线）；外拆 = 本批实施首步；兼容重导出保旧测试面）。

**上抛项（含预置发现——逐条列报）**
1. **（已闭合）批档 §1 已回填在盘**（主 agent 笔——状态行 `:6` ∥ 回填句 `:16`）——本席按 spawn 任务书执行未受阻；本条闭合。
2. **预置红（先于本批——非本批引入）**：① `docs/batches/2026-10-13-member-face-chat-ui.test.mjs` 前置实跑 8 绿 3 红（结构腿 `views-me-chat.mjs` 501 越 500 ∥ 键族数 46 vs 实读 48 ∥ N76 相③ 文案断言未随 2026-10-14 走查批形式化）；② `node scripts/doc-check.mjs` 基线 = **锚悬空 29 条 ∥ 行宽 4 行 ∥ 行数面 84 条（报告态）**——本批改动后逐面复跑：**悬空 29（零增）∥ 行宽 4（零增）∥ 行数面 83（−1——`views-me-chat.mjs` 行按实读收正）**；本批新增的非闸面报告行 = 拟新增 ×4（新档经「拟新增」标记——列报·不入闸）+ 键名符号宽 ×~10（报告面·不入闸）。
3. **读数在册不符（发现项——本批触及行按实读收正）**：`webui/ME.md` §3 与 `agent/MEMBER-AGENT.md` §5 两 me 表读数记 89 ∥ 87（en 90 ∥ 88），与实读 **158 ∥ 159** 差 ≈70 行（历批读数口径残差）。
4. **兄弟在途批随正**：`docs/batches/2026-10-15-member-pull-detail-render`（台账 #1452）测试件源扫 `views-me-chat.mjs` 的 `pullDetailText` ⇒ 拆档后重指新档（父侧路由——实施轮同拍）。
5. **测试链随正五件**（含键数指纹 1126 ∥ 1131 与 `PUBLIC_SNAPSHOT` 67 ∥ 68）——见 §9 R82。
6. **部署随动**：盒镜像重建（R81——收口轮）；旧盒在途期旧措辞（行为零差）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**评审范围**：`docs/batches/2026-10-15-member-pull-inline-cred.md` ∥ `docs/server/design/agent/MEMBER-AGENT.md` ∥ `docs/server/design/webui/{CHAT,ME,WEBUI}.md` 五档全文实读；机制/端点/键/行数/测试链/需求锚逐点实核（需求 `PROJECT.md:329` 功能点 50 ⑨ ∥ `:452` AC-50 ⑦ 已核在册）。

| # | Category | Severity | Issue | Suggestion |
|---|---|---|---|---|
| 1 | Requirements coverage ∕ Affected files | 🔴 | 「测试链随正」清单不完整：受影响表「随正三件（实施轮同拍——R82）」行（`docs/batches/2026-10-15-member-pull-inline-cred.md:64`）与 R82（`docs/server/design/agent/MEMBER-AGENT.md:283`）只列三件；但本批 +3 键（`me.chat.pullCred*`——门面 `thincoder-server/public/i18n-zh.mjs:17` `...ZH_SHELL, ...ZH_ME` 聚合 ⇒ 全局键数 1126 ∥ 1131 ⇒ 1129 ∥ 1134）与 +1 公开档（档目 68 ∥ 67 ⇒ 69 ∥ 68）还会打红至少两件未列在册维护件：`docs/batches/2026-10-10-runner-admin-console-ui.test.mjs:347`（`assert.deepEqual([Object.keys(ZH).length, Object.keys(EN).length], [1126, 1131],`）∥ `:355`（`assert.deepEqual([names.length, names.filter((name) => name !== "favicon.png").length], [68, 67],`——两处均标「2026-10-14 复读随正」；该件 2026-10-14 记录 = 6/6 绿：`docs/batches/2026-10-14-sandbox-egress-removal.md:622`「跨批指纹族随正 **5 档**（实更 + 复跑）」）；`docs/batches/2026-10-12-team-projects-permissions-ui.test.mjs:214`/`:215`（断言 1126/1131）。旁证：R82 已列的 tabs 件除 `PUBLIC_SNAPSHOT` 外另有同值键数断言 `docs/batches/2026-10-11-console-tabs-component.test.mjs:447`/`:448`，R82 该件条目未写。按设计实施 ⇒ 产生未披露红件（同族先例 = purge-residue-sweep 评审同类判 🔴）。 | 随正清单补列 `2026-10-10-runner-admin-console-ui.test.mjs`（键数 + 档目两处）∥ `2026-10-12-team-projects-permissions-ui.test.mjs`（键数一处）；tabs 件条目补写键数断言随正；目标值 = 1129 ∥ 1134 ∥ 69 ∥ 68（同窗他批并计口径注明）。 |
| 2 | Affected-file annotations | 🟡 | 「随正三件」行（`docs/batches/2026-10-15-member-pull-inline-cred.md:64` ∥ `docs/server/design/agent/MEMBER-AGENT.md:283`）未给三件**现读行数 + 预期增量**（判据 = 将改 source/test 件须注现行数 + ≤±N/结构不变；测试档非 `.md` 不免）；在册先例格式 = `webui/CHAT.md:247`「数字就地收正 ⇒ 行数 ±0」。 | 三件各补现读行数 + 增量注（键数/档目就地收正 ⇒ ±0；重指档净变如实）；补列两件后同拍。 |
| 3 | Closest-precedent | 🟡 | 本批新机制（KD-SV-205 就地绑）无「最近先例（实现坐标 ∥ 档节 ∥ 批）+ 对齐/偏离」行：仅零散提及——⑨「沿 `views-chat-messages` 先例——旧测试面零改」（`docs/batches/2026-10-15-member-pull-inline-cred.md:52`，无三坐标）∥ D2 引 `modal.mjs` 单例（同档 `:81`，无坐标）；最贴身先例（账户页凭据卡 = 同 `PUT` 同链——实现 `thincoder-server/public/views-me.mjs:337` 起 ∥ `webui/ME.md` §2.3 ∥ member-face-chat 批）仅以 KD-SV-205 理由列「同一端点」一笔带过。 | 补一行先例坐标（实现 ∥ 档节 ∥ 批）+ 对齐（同 `PUT`/`me.gitCred.*` 键/零回显族/兼容重导出）× 偏离（入径 = 拉取流内 ∥ 自动续拉 ∥ 主机只读）理由。 |
| 4 | Acceptance criteria | 🟡 | 设计自定条款「项目选择变更 ⇒ 复位态 A + 清用户/密字段（防密文绑错 host）」（`MEMBER-AGENT.md:40` ∥ `webui/CHAT.md:131`）在验收对照表（`docs/batches/2026-10-15-member-pull-inline-cred.md:69-77`）与用例 N79/B73/E58（`MEMBER-AGENT.md:260`–`:262`）均无腿——无机检载体。 | 补一腿（项目选择变更 ⇒ 表单复位 + 两字段清空 + 零 `PUT`），并入 N79 或另列 B 用例。 |
| 5 | Doc hygiene ∕ numeric | 🔵 | `views-me-chat.mjs` 行数双口径并陈：受影响表 500（内容行口径——`docs/batches/2026-10-15-member-pull-inline-cred.md:56`/`:58`）∥ `MEMBER-AGENT.md:230` 记 500 而 §5 表头（`:216`）声明「实读口径 = 换行计数」；按 canon 腿计法（`docs/batches/2026-10-13-member-face-chat-ui.test.mjs:629` `const lines = src.split("\n").length`）= 501（上抛项 2 亦记 501——`docs/batches/2026-10-15-member-pull-inline-cred.md:90`）。 | 该行统一到 canon 计法（501）或注两口径换算；拆后判据已标 canon 计法——同注即可。 |
| 6 | Doc state（批档） | 🔵 | §2 上抛项 1 仍写「**批档 §1 为模板占位**（主 agent 笔未落）」（`docs/batches/2026-10-15-member-pull-inline-cred.md:89`），而 §1 已回填并注「本条即 §1 回填（上抛 [知会]「§1 仍为模板占位」已办）」（同档 `:17`）；§1 状态行字面「（…）」（同档 `:6`）与模板占位行（同档 `:7`）仍在规范面。 | 上抛项 1 按现态标闭合 ∥ §1 状态行字面与占位行清理。 |

**计数**：🔴×1 ∥ 🟡×3 ∥ 🔵×2。

VERDICT: changes-required

**范围外注记（零严重度）**：评审期间 `agent/MEMBER-AGENT.md` 有并行批（member-face-parity——KD-SV-206–212，`MEMBER-AGENT.md:42`–`:48`）内容落笔——「其它批档零触」，本表未评；其与本批同触键数指纹/档目链，随正时注意同窗并计（勿双计）。文档地图缺失 ⇒ 文档归属维度降级；项目标准档未声明 ⇒ 方法论按 Project Guide 判。

### 轮次 2（评审子代理）

**评审范围**：`docs/batches/2026-10-15-member-pull-inline-cred.md` ∥ `docs/server/design/agent/MEMBER-AGENT.md` ∥ `docs/server/design/webui/CHAT.md` 三档全文实读；评审 #44 六条（🔴×1 ∥ 🟡×3 ∥ 🔵×2）修正主张逐条对位——六条所指位置均已在盘落地（随正五件＋目标值：`MEMBER-AGENT.md:411`／批档 `:67`；逐件现读＋增量注同拍；档头先例④：`MEMBER-AGENT.md:12`；复位腿：`MEMBER-AGENT.md:370`／`:384`、批档 `:74`；§5 行 501：`MEMBER-AGENT.md:352`；§1 占位句闭合：批档 `:16`／`:92`）。另列本轮新发现 4 条（🟡×2 ∥ 🔵×2）。

| # | Category | Severity | Issue | Suggestion |
|---|---|---|---|---|
| 1 | Doc state（跨档） | 🟡 | 修正轮主张「『随正三件/测试链三件』计数随五件收正」未扫净：`docs/batches/2026-10-15-member-pull-inline-cred.md:48` 规范面仍记「R82（测试链随正三件）」；`docs/server/design/webui/CHAT.md:267` 仍记「测试链三件（`agent/MEMBER-AGENT.md` §9 R82）」——所指 R82 已列五件（`MEMBER-AGENT.md:411`「**测试链随正五件**」）。 | 两处计数按五件收正（或去计数、留指针）。 |
| 2 | Affected-file annotations | 🟡 | `MEMBER-AGENT.md:411` R82 ④ 新补现读「现读 **554** ⇒ ±0」（同拍 = 批档 `:67`）——`2026-10-12-team-projects-permissions-ui.test.mjs` 越 500 档（554 行），设计未给越线注/拆分判定；同档先例 = `MEMBER-AGENT.md:352`（「两步拆：① 兄弟批外拆拉取件 ⇒ ≈430」）∥ `:349`（485 ⇒ ≈530——「拆分计划：ask/delete/files 三端点外迁」）。 | 该行补越线注（>500 软线——本批仅数字就地收正（±0）；拆分判定或预案登记）。 |
| 3 | Doc hygiene ∕ numeric | 🔵 | 双口径（内容行 500 ∥ canon 501）残差：`MEMBER-AGENT.md:352` 与批档 `:61`/`:90` 已按 canon 收正/注换算，而 `CHAT.md:268` 仍记「拆档缘由 = `views-me-chat.mjs` 实读 **500**」∥ `CHAT.md:155` 仍记「**500**（2026-10-15 实读——越 500 软线）」——两档表头口径不同（批档 = 内容行 ∥ 机制档 = 换行计数）之底层未注。 | 两处统一到 canon（501）或各注两口径换算。 |
| 4 | Doc hygiene ∕ numeric | 🔵 | 同一数字对两处顺序相反、无元素名注：批档 `:51`「档目链 67 ∥ 68 ⇒ **68 ∥ 69**」vs 同档 `:67`「档目 **68 ∥ 67 ⇒ 69 ∥ 68**」（`MEMBER-AGENT.md:411` R82 ②/③ 同序）——若同指一对则一处序逆；若异指则缺注（`webui/WEBUI.md` §1 未读——范围外，未验）。 | 两处统一顺序并标元素名（如「总数 ∥ 去 favicon」），或分别注来源。 |

**计数**：🔴×0 ∥ 🟡×2 ∥ 🔵×2。

VERDICT: pass

**范围外注记（零严重度）**：① 三档内实读对位；外部件读数（170 ∥ 497 ∥ 390 ∥ 554 ∥ 38、`pull.mjs` auth 句、`views-me.mjs:337`、doc-check 基线）未复读/复跑（评审范围外）；② `MEMBER-AGENT.md`/`CHAT.md` 中兄弟批（member-face-parity）内容仅按跨批计数相干面核读，未全评；③ 文档地图缺失 ⇒ 文档归属维度降级（机制入 `agent/MEMBER-AGENT.md`、面档入 `webui/CHAT.md`——本批未新建顶替件，归属无破）；项目标准档未声明 ⇒ 方法论按 Project Guide（AGENTS.md）判。

## §4 用户批准（主 agent）

**用户批准（代签——全链自动授权在册）· 2026-10-15 01:3x**

- **依据**：用户 2026-10-15 00:08「都自动跑到交付吧」+ 01:19「不是说好了自动跑的吗？」——本批全链（设计 → 评审 → 批准 → 实施 → 收口）自动授权。
- **设计链闭合**：设计轮 → 评审 #44（changes-required：🔴1 ∥ 🟡3 ∥ 🔵2）→ 修正轮 #46（六条逐条落盘）→ 复审 #47 = **pass**（六条对位核讫；新发现 🟡2 ∥ 🔵2 —— 父侧逐条裁定 **4/4 现场落地**：① 计数残差两处收正（本档 `:48` ∥ `webui/CHAT.md` §6⑧）；② R82 ④ 越线注；③ 双口径注换算两处（`webui/CHAT.md` §3/§6⑧）；④ 档目链序与元素名统一（本档 `:67`/`:96` ∥ `MEMBER-AGENT.md` R82 ②/③）——均父侧直接执行 · 可 revert，两档变更记录一行在册）。
- **实施**：派 eng-coder（任务书 = 本档 §2 全文；令牌与设计 id 随 spawn 传递——**值不入档**）。
- **范围复述**：页面三件（`views-me-chat.mjs` 拆档 + 新档 `views-me-chat-pull.mjs` + `i18n-{zh,en}-me` +3 键/表）∥ 盒 auth 句（`member-shell/pull.mjs`）∥ 批内件（N79 ∥ B73 ∥ E58）∥ 随正五件（**实施当刻盘面实读**）∥ `webui/WEBUI.md` §1 ∥ `webui/ME.md` §3。**零改面** = `src/**` ∥ `gateway/API.md` ∥ `views-me.mjs` ∥ `style.css` ∥ `app.mjs`（import 面）。

## §5 实施记录（eng-coder）
**状态行**：实施完成（审计 + 评审收敛（clean）；随正五件与 API-CONTRACT 刷新归父侧笔）



### 5. 实施记录（eng-coder · 2026-10-15）

**实施面（8 件；`src/**` ∥ `gateway/API.md` ∥ `views-me.mjs` ∥ `style.css` ∥ `app.mjs` 零改——`git status` 实证）**

| 件 | 改动 | 读数（canon 计法＝`split("\n").length`） |
|---|---|---|
| `thincoder-server/public/views-me-chat-pull.mjs`（新） | 拉取弹窗 + 凭据就地绑（KD-SV-205 三态）+ 四纯函数（`PULL_POLL_MS`/`pullStateLabel`/`pullDetailText`/`hostOfAddress`）+ `openPullModal` | **219**（设计估 ≈180） |
| `thincoder-server/public/views-me-chat.mjs` | 外拆 + 兼容重导出（两纯件 + `PULL_POLL_MS`）+ `openPull` 薄壳（三调用点复原）+ 头注 | **445**（原 **501** 越线 ⇒ 线内；设计估 ≈430） |
| `thincoder-server/public/i18n-{zh,en}-me.mjs` | +3 键/表（`me.chat.pullCred{Need,Save,Skip}`；两表同位同序、en 零 CJK、`{host}` 对位） | 内容行 **161 ∥ 162**（设计估同值、零差） |
| `thincoder-server/deploy/sandbox/member-shell/pull.mjs` | auth 句就地措辞（去账户页指引）+ 档头注释同拍 | 内容行 **114**（±0 ✓） |
| `docs/batches/2026-10-15-member-pull-inline-cred.test.mjs`（新） | **9 用例**：N79×6（缺⇒表单 ∥ 填录 ⇒ `PUT` 恰一 + 续拉 ∥ 复用腿 ∥ 选择复位腿 ∥ 目标变更守卫 ∥ 在飞竞态）∥ B73×1（跳过零 `PUT` ∥ 预检失败降级 + 双击腿）∥ E58×1 ∥ 结构腿×1 | **396**（设计估 ≈260——含假 DOM 装置约 130） |
| `docs/server/design/webui/ME.md` §3 | 两 i18n 行实读回填（161 ∥ 162）+ 变更记录一行 | —— |
| `docs/server/design/webui/WEBUI.md` §1 | `views-me-chat-pull.mjs`「拟新增 ⇒ 已落」三处 + 变更记录一行 | JS 链 **66** ∥ 档目 **68 ∥ 69**（实读＝设计推值、零差） |

**复跑读数**（走法 `node --import ./thincoder-server/test/rc-resolve.mjs --test <档>`；cwd = `thincoder/`；`node --check` 六档语法 OK）

- 批内件：**9/9 绿**（`tests 9 ∥ pass 9 ∥ fail 0`）。
- `2026-10-13-member-face-chat-ui.test.mjs`：**9 绿 ∥ 2 红**（本批前 8 ∥ 3——结构腿 501 越线**转绿**；余 2 红 = 预置：相③ 文案断言 ∥ 键族数 51 vs 记 46——该腿原即红（48 vs 46），本批 +3 键令差扩大，非新增红；R89 归兄弟批）。
- **随正五件未落——跨批写门拒子代理笔**（「write refused — cross-batch batch-record write」实测两件复现）。逐件读数（父侧笔用）：① `2026-10-08-server-public-structure` 5 绿 ∥ 1 红（`:59` 链尾 ∥ `:61`/`:62` 指纹 ⇒ zh `f2ac82c0734b65dd8f76b68f3706b71fbb40a962cc92f38947c71c26e3b6422b` ∥ en `6baea2771687d0e3f34828f67b5fcc25c17a6d4f29d6e4be0ade6bf4443804ff`；`:68` 题面 ∥ `:71`/`:72` 键数 ⇒ **1129 ∥ 1134**）；② `2026-10-11-console-tabs-component` 7 绿 ∥ 2 红（`:447`/`:448` 键数；`:455` `PUBLIC_SNAPSHOT` + `views-me-chat-pull.mjs`；`:456` **[69, 68]**）；③ `2026-10-10-runner-admin-console-ui` 4 绿 ∥ 2 红（`:347` **[1129, 1134]** ∥ `:355` **[69, 68]**）；④ `2026-10-12-team-projects-permissions-ui` 5 绿 ∥ 2 红（`:214`/`:215` ⇒ 1129 ∥ 1134；另两红 `:171` 路由表 ∥ `:206` shell 64 vs 61 = 他批预置、非本批）；⑤ `2026-10-15-member-pull-detail-render` 3 绿 ∥ 1 红（`:17` `PAGE_SRC` 重指新档即可——该腿所扫 `const detailText = pullDetailText(data?.detail)` 已在 `views-me-chat-pull.mjs:185`）。
- `node scripts/doc-check.mjs`：**悬空 0**（闸绿——本批改动零悬空行；会话早期读数 6 条 = 他批在途，非本批）∥ 行数面 **85** 报告态（本批面一行：`CHAT.md:158` `views-me-chat.mjs` 表 500 ⇒ 实读 444）∥ 行宽 7 条（MEMBER-AGENT×4 ∥ API×1 ∥ CHAT×2——皆非本批件）。
- `node scripts/api-contract.mjs --check`：**DRIFT**（盘上 4198 ⇒ 生成 4201 行；+3 = 新档导出五名 + 页件重导出一行 − 旧四行）——父侧 `node scripts/api-contract.mjs --write` 一笔（该档自述「父侧直接执行（工程工具面）」）。

**决策透明表（实施当刻读法）**

| # | 决策点 | 取法 | 依据 / 理由 |
|---|---|---|---|
| 1 | 重试钮语义 | **同提交链（`PUT` + `POST`）**——与主钮同 handler | 批档验收行「重试钮 ⇒ 更新 ⇒ `PUT`+`POST` 各一」；不取「重试 = 仅复提交 `POST`」读法 |
| 2 | 凭据字段构建时机 | **首揭示时构建一次**（未揭示窗内零隐藏字段） | 保旧测试件「末位 input = 目录框」取向不断（N76 拉仓流腿）；零语义差 |
| 3 | 隐藏字段 `hidden` 口径 | 容器 `credBox.hidden` + 钮面各自 `hidden` | 沿 `views-me.mjs` 凭据卡同族写法 |
| 4 | 两枚自加守卫（设计未列） | ① **目标变更守卫**（搜索重铺致所选换 host ⇒ 复位态 A 重预检）② **在飞守卫**（`submitBtn.disabled` 为在飞旗——双击零双发）③ **回执复核**（预检在飞期选择变更 ⇒ 弃置回执） | 同 KD-SV-205 ⑦ 理由「防密文绑错 host」；三项均入批内件腿（`:236`/`:257`/`:259` 附近）；③ 收「表单以空 host 复现」竞态 |

**审计与代码评审（链内轮次与终态）**

- **设计背离审计（explore · 只读）**：判 **DEVIATIONS——DOC-DRIFT ×2（皆 🔵）**；「部分实现 ∥ 静默简化 ∥ 越界」三类**零发现**；AC-50⑦ 七行逐条对位 ✓。两条 🔵：#1 `WEBUI.md:20` 文件清单标记未翻（与我自述「两处」对位）；#2 设计档「`me.gitCred.*` 三键复用」计数不全（实现复用 6 键 + `me.chat.retry`——与账户页卡同形同键，无新键）。
- **代码评审（advisor · code）**：判 **pass**（0 🔴 ∥ 2 🟡 ∥ 4 🔵；两条 🟡 **未标 must-fix**）。🟡 = ① 跳过/重试钮在飞期不禁（双击双发）；② 预检回执与选择变更竞态（表单以空 host 复现）。🔵 = ③ `resetCred` 不收 `note`；④ 批内件断言语「恰一」与值 2 相抵；⑤ 批内件硬写目录占位符；⑥ 守卫第二径未入机制档。
- **fix round（本席当刻收口）**：🟡①②③④⑤ **已落地**（在飞守卫 2 行 ∥ 回执复核 1 行 ∥ `resetCred` 收 `note` 1 行 ∥ 断言语 ∥ 占位符走 `ZH_ME`）+ 审计 🔵#1/#2 已落（`WEBUI.md:20` 标记 ∥ 新档头注「同形同键」句）+ 批内件加两腿（在飞竞态 ∥ 双击）⇒ **9/9 复跑绿**。🔵⑥（守卫入 KD-SV-205/§3.6/AC-50⑦ 登记）= **父侧/设计席**（D1 机制档非本席笔）。
- **如实披露**：评审后的改动（守卫/注/腿）**未经二轮评审**——改动面小且批内件全绿；若父侧要求二轮收敛可再走一次 advisor（code）。
- **终态：`clean`**（审计无阻塞项 ∥ 评审 pass ∥ 读法/守卫/越线三项逐条披露；未落项皆为父侧笔，见上表）。

## §6 验证与收口（父代理）

**验证（父侧实跑 · 2026-10-15 02:3x）**
- 批内件 `docs/batches/2026-10-15-member-pull-inline-cred.test.mjs` ⇒ **EXIT=0**（9 用例：N79×6 ∥ B73 ∥ E58 ∥ 结构腿；走法 = `node --import ./thincoder-server/test/rc-resolve.mjs --test <档>`）。
- 随正链复跑（R82 五件）：⑤ `2026-10-15-member-pull-detail-render.test.mjs` ⇒ EXIT=0 ✓ ∥ ①–④（`2026-10-08-server-public-structure` ∥ `2026-10-11-console-tabs-component` ∥ `2026-10-10-runner-admin-console-ui` ∥ `2026-10-12-team-projects-permissions-ui`）⇒ EXIT=1——**他批在飞所致**（car2 +≈30 键/表：键数 actual **1151 ∥ 1156** vs 本批收正基线 **1129 ∥ 1134**（+22 已部分落）∥ zh 表哈希漂移）⇒ **非本批缺陷**；四档收口随正 = car2 收口随动（台账 #1460，父侧笔）。
- 收口对照（§2 关键判据）：①–⑤ = 批内件逐腿覆盖（表单内揭示 ∥ `PUT` 恰一 ∥ 复用 ∥ 跳过 ∥ 预检降级 ∥ 复位）✓；⑥ 盒 auth 新句 = **文件级在盘**（`deploy/sandbox/member-shell/pull.mjs` 114 行 ±0），**镜像未重建**（下条）。

**未执行项（诚实披露）**：**R81 盒镜像重建未跑**——本机**无 docker**（`docker` 不可识别；重建 = 服务器侧动作：`docker build -f thincoder-server/deploy/sandbox/Dockerfile -t thincoder-sandbox:1 .`，上下文 = 仓根）。影响 = 新盒方有新措辞（旧盒在途 = 旧措辞，行为零差——设计披露在案）⇒ 交付面不受阻；**R81 入台账（trigger = 条件：服务器侧 docker 窗口）**。

**评审后改动披露受理**：coder 自述「评审后守卫/注/腿未经二轮评审」——改动 = 评审 🟡/🔵 原建议 + 2 腿，批内件 9/9 复跑绿 ⇒ **父侧受理（不另起二轮）**。

**遗留（指向）**：🔵⑥ 自加守卫登记（KD-SV-205 ∥ §3.6 ∥ AC-50⑦）= 设计席笔，待 parity 复审（#80）冻结窗关后并入 mcp 随正轮——本批不阻塞。**暂缓批复核**：本会话在册批零「暂缓」标记。**本批单测档**：`…-member-pull-inline-cred.test.mjs`（396 行，随批留存，不入任何门）；集成面 = 本批无仓套件（清单空）——真机/R81 面如上披露。

**收口结算（父侧 · 2026-10-15 18:3x）**
- 台账 **#1454** = 已核销（2026-10-15 02:3x——核销依据在案；设计令牌已随收口消费）。
- 随正链闭环：① **API-CONTRACT 生成刷新 = 已执行**（父侧直接执行 · 工程工具面：`node scripts/api-contract.mjs --write` ⇒ `--check` = OK〔骨架零漂移 4259 条 · 855 档〕——本批 +3 行漂移随清）；② **随正四档（2026-10-08/10-11/10-10/10-12 指纹件）= 对象随「用后即删」政策删除**（父侧 existsSync 实证零存）⇒ 该随正义务自然销项（§6 原记「四档红 = car2 在飞」的复跑面不复存在——car2 收口随动同效）；③ 🔵⑥ 自加守卫登记 = 并入「设计档重落」工作单（台账 **#1484**——与 car3/mcp/parity 同案）。
- R81 盒镜像重建 = 入台账 **#1482**（条件 = 服务器侧 docker 窗口；与 R88 合一行）。
- **暂缓批复核**：本批零「暂缓」标记。
- **本批单测档**：`…-member-pull-inline-cred.test.mjs` 已随政策删除（用后即删——跑绿读数 9/9 存档 §5/§6）；集成面 = 本仓无集成套件（清单空）。
- 记录冻结：本段落盘后 §1 状态行 ⇒「已收口 2026-10-15」，全档冻结。
