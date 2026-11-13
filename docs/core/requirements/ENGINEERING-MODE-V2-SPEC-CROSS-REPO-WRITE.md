# Function Spec · 跨仓写入（writableRepos）

> 相关模块 = MANIFEST 声明面、LEDGER 工作项、工程写门。
> 当前设计 = `docs/core/design/CROSS-REPO-WRITE.md`。

## ① 模块目标

一次工作需要修改外部目录时，允许发起方显式声明可写范围，并使用发起方项目的在途工作项完成写入与记账。

## ② 功能点

1. **声明键**：`index.writableRepos` 是目录路径数组，从发起方项目根解析，缺省为空。
2. **读写分离**：`publicRepos` 不派生写权，`writableRepos` 不派生检索或引用权。
3. **显式写方**：只有调用携带有效 `project` 时，才使用该项目作为写方 W。
4. **表内目标**：目标位于 W 的声明目录内时，台账号在 W 的在途行上校验。
5. **表外外部项目**：带 project 的写入若目标属于另一个项目且不在表内，直接拒绝，不回落到目标项目的同号行。
6. **同项目**：目标仍属于 W 时按同项目写入，声明表不改变规则。
7. **无项目根目标**：工作区窄口只有在声明表可读且为空时按原规则处理；表非空时目标必须被表覆盖。
8. **不可读声明**：写方 manifest 不可用不等于空表，外部目标和窄口必须明确拒绝。
9. **不传递**：A 可写 B 不意味着 A 可写 B 声明的 C。
10. **入口一致**：文件写入工具和 `execute` 的 workdir 等带 project 的写型入口使用同一判序。
11. **记账归属**：外部修改记录在写方工作项与过程记录，目标项目不被写入台账。
12. **目标面判定**：设计门仍按目标项目自己的 docRoot 与 faceDetail 判断，写权表不豁免设计门。

## ③ 边界

- 不要求目标项目提供反向许可或 writers 表。
- 不把同 workspace、历史共同修改或 publicRepos 当作写权。
- 不为 writableRepos 建依赖图或环检测。
- 不把目录声明解释为必须是 git 仓。
- 不在目标项目写台账或批档。
- `manifest` 工具不走本写门；其 target 规则由 MANIFEST 自己定义。
- 不因跨仓改变目标项目的文档面和产品面语义。
- 不把本机制当作跨仓批次、回滚或核销结构改造。

## ④ 验收

| # | 判据 |
|---|---|
| AC-1 | 表内目标 + 有效 project + 写方在途号可以写入 |
| AC-2 | 表外另一项目 + project 无条件拒绝，并点名 writableRepos |
| AC-3 | 写方声明 B 后，写 C 不继承授权 |
| AC-4 | 只有 publicRepos 没有 writableRepos 时不能写 |
| AC-5 | 同 workspace 不自动授权 |
| AC-6 | 非数组声明非法；缺键按空表；元素按当前归一规则处理 |
| AC-7 | 目标项目存在同号在途行也不能让表外写入通过 |
| AC-8 | 文件写入与 execute workdir 对表外目标都拒绝，且不执行副作用 |
| AC-9 | 无项目根目标按表可读、表空、表覆盖分别得到当前规定结果 |
| AC-10 | 写方 manifest 不可用时明确拒绝，不宣称“未声明” |
| AC-11 | 目标项目自己的 docRoot 决定设计门面，写方声明不改变它 |

## ⑤ 依赖

- `DEFAULT_MANIFEST` 与 `validateManifest` 提供键和校验。
- `declaredWritableRoots` 提供绝对目录集。
- `resolveProjectRoot` 提供目标项目归属。
- `faceDetail` 提供目标写面。
- 工程写门提供 project、ledger、状态和完整拒绝语义。
