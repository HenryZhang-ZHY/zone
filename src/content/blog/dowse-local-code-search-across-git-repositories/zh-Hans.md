---
title: "dowse：Sourcegraph 与 GitHub Code Search 的本地化替代方案"
description: "dowse 是一款免费开源的桌面与命令行代码搜索工具，无需部署服务端，即可用 GitHub 语法在本地所有 Git 仓库中即时检索代码。"
translatedAt: 2026-10-17
---

[dowse](https://github.com/HenryZhang-ZHY/dowse) 可以在桌面端或命令行中同时检索多个 Git 仓库的代码。它把你本地磁盘上的所有代码副本连接起来，带来了类似 [GitHub code search](https://github.com/features/code-search) 和 [grep.app](https://grep.app) 的体验：一个搜索框，覆盖所有仓库，毫秒级返回结果。dowse 完全采用 GitHub code search 的查询语法，底层基于微软开源的三元组（trigram）检索工具 [tgrep](https://github.com/microsoft/tgrep)，并借鉴 [Zoekt](https://github.com/sourcegraph/zoekt) 为每个仓库建立独立索引，完全无需运行后台服务端。

![dowse 在键入查询时实时检索 12 个公开仓库：毫秒级返回匹配结果，并通过分面筛选将范围缩小至 Rust，以表格形式展现](./dowse-search.webp)

dowse 支持 Windows、macOS 和 Linux，完全免费且遵循 MIT 协议。

**[下载最新版本](https://github.com/HenryZhang-ZHY/dowse/releases)**

## 你要找的代码往往分散在多个仓库中

当你想确认某个函数到底在哪里被调用、某项配置在何处被读取，或是哪些服务还在引用某个旧版本库时，答案往往散落在几十个代码仓库里：你当前日常开发的各个工作副本、团队其他服务的只读镜像，以及项目依赖的各种第三方库。现有的搜索工具各有所长，但也都有明显的局限：

- **GitHub code search** 速度很快，查询语法也很顺手，但它只索引托管在 GitHub 上的代码，而且只覆盖每个仓库的[默认分支](https://docs.github.com/en/search-github/github-code-search/about-github-code-search#limitations)，每次搜索最多只返回 100 条结果。你本地正在开发的功能分支、还没有 push 的修改，以及存放在其他 Git 平台上的代码，它都无能为力。
- **grep.app** 专为公开 GitHub 仓库设计，公司的私有代码显然不能也不会放在上面。
- **Sourcegraph** 是目前功能最完善的代码搜索平台，还附带代码跳转与批量变更能力。但它本质上是一套重量级服务端系统：需要专人部署、对接代码平台并持续维护。对整个工程组织来说这笔投入很划算；但对只想在笔记本上查查本地代码的个人开发者来说，运维成本未免太高了。
- **Zoekt** 是 Sourcegraph 底层使用的三元组搜索引擎，开源且性能极高。但它同样需要你自己搭建并维护一套索引服务。
- **Entrian Source Search** 能为 Visual Studio 提供本地全文索引，但它绑定在 IDE 内部，且按人头收费。
- **ripgrep** 与 `git grep` 没有任何依赖，随调随用，但每次搜索都要老老实实从头扫描每一个文件，而且一次只能查一个目录树。一旦面对几十个仓库，就很难再保持瞬时响应。

我真正想要的，是在本地磁盘的仓库中重现 github.com 上的搜索体验：既包括常年跟踪 `main` 分支的镜像，也包括当下正在写代码的工作副本，甚至包括尚未提交的临时修改。dowse 就是为此而生的。

## dowse 的核心特性

### 本地代码副本上的 GitHub 搜索语法

输入查询的同时即刻开始解析，语法完全兼容 GitHub code search。搜索词是以“文件”为维度进行逻辑组合的，而不是单行。例如输入 `parse config`，它会找出同时包含这两个词的文件，并在结果中高亮包含任一词的行。

```text
parse config                      同时包含这两个词的文件
parse OR config                   包含其中任一词的文件
parse NOT test                    包含 parse 但不包含 test
"fn main()"                       精确匹配文本
/fn \w+_test/                     匹配正则表达式的代码行
path:src/*.rs  language:rust      路径 glob 与语言筛选
repo:api  branch:main             限定仓库与分支
-path:tests  -lang:md             排除匹配项
```

如果查询全部由修饰符构成（如 `path:*.proto`），dowse 会直接列出符合条件的文件列表，无需读取文件内容。大小写匹配、全词匹配和正则表达式可通过快捷键随时切换（`Alt+C`、`Alt+W`、`Alt+R`）。

![dowse 跨 tgrep、Zoekt、Google codesearch、Hound、Django 和 Go 六个仓库执行查询 trigram index -path:test，配合仓库、分支、所有者和语言分面筛选](./search-across-repositories.webp)

搜索结果以代码片段展示，并由 tree-sitter 语法高亮驱动。点击任意一行可在右侧预览完整文件，按 `F4` 可在匹配项间快速跳转，按住 `Ctrl+Click` 则能直接调用 VS Code、Cursor、Zed 或 Sublime Text 打开对应行。

![dowse 预览面板在结果右侧展示 Google codesearch 的 cindex.go，并高亮查询匹配项](./file-preview.webp)

### 借助标签筛选范围，利用分面精准聚焦

工作区是一组仓库的集合，形式类似于 VS Code 的工作区配置，以 `.dowse-workspace` 文件保存。仓库可以打上各种标签：普通标签如 `mirror` 或 `dev`，或是键值形式的标签如 `owner:alice` 或 `project:billing`。此外，每个仓库都会自动带上当前检出分支的标签 `branch:<name>`，切换分支时自动更新。

作用域栏可以勾选要参与搜索的标签。同组内的标签互为或关系（`owner:alice` 或 `owner:bob`）；不同标签组之间则是且关系（`dev` 且 `owner:alice`）。检索出结果后，界面会像 grep.app 那样提供分面统计，按仓库、分支、标签、语言和顶层目录列出匹配频次，各项统计均已叠加当前已生效的过滤条件。

### 表格视图：将正则捕获组转化为数据列

表格视图（快捷键 `Alt+T`）将每一处匹配行展开为一行结构化数据：包含仓库、分支、文件路径、行号、列号、语言、匹配文本与整行内容。当查询包含正则表达式命名捕获组时，每个捕获组都会提取为独立的具名列。例如下面这条查询，能瞬间整理出所有仓库里引用的各 crate 版本号：

```text
/^version = "(?<version>[^"]+)"/ path:Cargo.toml
```

![dowse 表格视图：展示 ripgrep、regex、tokio、serde 与 tgrep 中各 Cargo.toml 版本行，命名捕获组自动转为 version 列](./table-view-capture-groups.webp)

与 GitHub code search 仅展示前 100 条结果不同，dowse 表格视图支持多达约 20,000 行数据。你可以点击任意列排序，导出为 CSV、TSV、Markdown 或 JSON，或者直接复制粘贴进电子表格软件。像“哪些微服务还在调用这个旧接口”或“各个仓库里的日志级别都是怎么配的”这类排查问题，原本需要翻看大量搜索结果，现在直接变成了一张清晰的数据表。

### 一键克隆整个 GitHub 组织，并自动保持同步

仓库管理页面通过 [GitHub CLI](https://cli.github.com) 读取指定账号或组织下的仓库列表，因此 dowse 完全不需要接管你的 GitHub 凭证：只需在终端执行一次 `gh auth login` 即可。列表分页采用并行请求，即便是包含 2,000 个仓库的大型组织，也能在数秒内加载完毕。勾选部分或全部仓库后，dowse 会在后台将其克隆至 `<folder>/<owner>/<name>` 路径下，打上 `owner:<owner>` 标签并建立索引。

克隆默认采用无 blob 模式（blobless clone）：拉取完整的提交历史，但仅下载当前检出文件的数据内容。这样即使面对超大型仓库也能极快完成克隆，且后续查看 git 历史不受任何影响。

![dowse 仓库管理页：展示 12 个已克隆的 GitHub 仓库及其分支、所有者和 mirror 标签，以及各自索引的文件数量](./repositories-page.webp)

你可以为仓库设置拉取周期（例如 `15m`、`1h`、`3d`），dowse 会按计划自动执行拉取。拉取操作在后台 fetch `origin`，且只在以下条件同时满足时才会自动快进合并（fast-forward）：处于默认分支、跟踪文件无修改、本地无多余未推提交。如果条件不满足，dowse 只做 fetch 操作并在界面提示具体原因（例如 `on feature/x, not main` 或 `uncommitted changes`）。它绝不会擅自进行 merge、rebase 或 stash 操作，因此即使直接将日常编码的工作目录接入 dowse，也非常安全。

## 底层引擎：微软开源的三元组检索工具 tgrep

dowse 的核心引擎是 [tgrep](https://github.com/microsoft/tgrep)。这是微软今年开源的高性能三元组索引 grep 工具，也是 [GitHub Copilot CLI](https://github.com/github/copilot-cli) 代码检索功能的底层技术。三元组索引会记录每个三字符序列出现在哪些文件中；当输入查询时，tgrep 会将关键词拆解为三元组，快速计算倒排索引的交集，只加载可能命中的候选文件，再交给真正的正则引擎精确匹配。Zoekt 以及更早的 [Google Code Search](https://swtch.com/~rsc/regexp/regexp4.html) 均基于这一原理。在微软公布的官方性能测试中，tgrep 在 18 组仓库与平台基准对比中有 17 组击败了 ripgrep，最高领先达 51.9 倍。

为了展示本文中的截图，dowse 索引了从 GitHub 克隆的 12 个公开开源项目：tgrep、ripgrep、Zoekt、Google codesearch、Hound、tokio、serde、regex、VS Code、Django、FastAPI 和 Go，总计 45,629 个文件。执行 `trigram index -path:test` 命中其中 6 个仓库的 72 个文件；为了完成搜索，dowse 实际仅读取了 73 个文件，耗时仅 10 毫秒。生成前文提到的 Cargo.toml 版本表仅用了 3.2 毫秒。在包含 42,000 个文件（1.3 GB Rust crate 源码）的更大代码树上，初次索引约需 6 秒，常规查询仅需 20–60 毫秒。

tgrep 本身定位在单一目录树的命令行搜索或单树服务模式。dowse 则把众多独立代码树汇聚在统一的搜索界面背后，补齐了跨仓库协同所需的各种能力：GitHub 语法解析、多仓库分面与标签、表格数据视图、文件就地预览，以及 GitHub 仓库的批量克隆与同步。索引文件完全兼容 tgrep 规范，保存在各个仓库目录下的 `.tgrep` 文件夹中，与 `tgrep index` 和 `tgrep serve` 使用的路径完全一致，两者可以共享同一份索引。

## 无需全量重建的即时增量索引

索引只有与磁盘文件保持同步才有意义，所以 dowse 从不需要靠耗时的“全量重建”来感知变化：

- 每个仓库配备独立的文件监听器（file watcher），实时捕捉上次构建后发生改动的文件，搜索时会直接读取这些增量变动。无论是在镜像仓库里 `git pull`，还是刚刚在编辑器里 `Ctrl+S` 保存的改动，下一次搜索立即体现。
- 打开仓库时，dowse 会自动扫描它未运行期间发生的任何文件增删与重命名。
- 更新索引时仅读取变动文件，流式写入索引文件的副本。对于一个包含 24.5 万个文件、索引达 1.7 GB 的大型仓库，增量更新大约只要 10 秒，而全量构建需要 9 分钟。更新期间搜索功能保持正常可用。

桌面客户端界面采用 [GPUI](https://github.com/zed-industries/zed) 原生构建——这是 Zed 编辑器背后的 GPU 渲染 UI 框架，全程没有浏览器封装或 Electron 的额外开销。

## 兼顾开发者与 AI Coding Agent 的命令行设计

`dowse search`、`dowse repos` 等命令行子命令直接与正在运行的桌面客户端进程通信，复用已在内存中的暖索引与文件监听状态。如果桌面应用尚未启动，命令行会悄无声息地在后台启动无窗口服务进程。

```bash
dowse search 'parse_config lang:rust'          # 检索 dowse 纳管的所有仓库
dowse search --here 'parse_config'             # 仅检索当前终端所在的仓库
dowse search -t owner:my-org -l 'LegacyClient' # 仅输出匹配路径，限定特定所有者的仓库
dowse repos clone --from my-org --pull-every 1h
```

命令行输出不仅方便人类查阅，更针对 Claude Code、Codex、Cursor 等 AI 编码智能体做了专门优化。当 Agent 在庞大的代码库里直接用 `grep` 逐个遍历时，大部分时间都浪费在磁盘 IO 上，大量无用文本也会迅速塞满上下文窗口。tgrep 在 GitHub Copilot CLI 中解决了单仓库层面的第一重问题；dowse 则让任意 Agent 都能在本地跨所有仓库复用相同的索引，并提供了严格的输出额度控制：

- 匹配结果输出至标准输出（stdout）；统计数据、耗时和辅助提示输出至标准错误（stderr）。有匹配时退出码为 0，无匹配时为 1。
- 默认限制输出最多 100 行匹配结果，单个文件最多 20 行，底栏输出匹配汇总。当结果被截断时，底栏会自动给出能够有效缩窄结果集的修饰符建议，并标明添加后各保留多少文件：

  ```text
  narrow with: repo:api (120)  language:Rust (80)  path:src/** (64)
  ```

- `--json` 以 JSON 形式打印每个匹配文件与汇总；`--table csv` 直接输出表格视图的 CSV 行。
- `dowse guide` 可输出一份针对 Agent 的[简要操作指引](https://github.com/HenryZhang-ZHY/dowse/blob/master/docs/agent-guide.md)。把它写入项目的 `AGENTS.md` 或 `CLAUDE.md` 中，Agent 就能在本地自由检索你的全部仓库，不再局限于启动时的单一当前目录。

## dowse 与 tgrep、Sourcegraph、Zoekt、GitHub code search、Entrian Source Search 对比

| 维度       | dowse                              | tgrep              | GitHub code search      | Sourcegraph          | Zoekt            | Entrian Source Search |
| ---------- | ---------------------------------- | ------------------ | ----------------------- | -------------------- | ---------------- | --------------------- |
| 运行位置   | 本地机器                           | 本地机器           | github.com 云端         | 自建服务端           | 自建服务端       | Visual Studio 内部    |
| 搜索范围   | 多个本地副本、任意分支、未提交修改 | 单个目录树         | GitHub 仓库，仅默认分支 | 已连接的代码托管平台 | 已建立索引的仓库 | 当前解决方案内文件    |
| 查询语法   | GitHub code search 语法            | 正则、类 grep 风格 | GitHub code search 语法 | Sourcegraph 语法     | Zoekt 语法       | Entrian 专属语法      |
| 索引方案   | 三元组（tgrep），监听器实时保鲜    | 三元组             | GitHub 专有索引         | Zoekt                | 三元组           | 全文索引              |
| 交互界面   | 桌面应用与 CLI                     | CLI 与轻量服务     | Web 网页                | Web 网页             | Web 与 API       | IDE 内嵌面板          |
| 授权与价格 | 免费，MIT                          | 免费，MIT          | 包含在 GitHub 中        | 商业软件             | 免费，Apache-2.0 | 按开发者席位收费      |

一句话总结：如果你只想在终端里以最快速度检索单个仓库，直接用 tgrep；如果团队需要在浏览器中共享组织级的全局代码搜索，选择 Sourcegraph 或自建 Zoekt；如果代码全都托管在 GitHub 且只需看默认分支，直接用 GitHub code search。但如果你希望在自己电脑上，随时跨越数十个仓库和不同分支搜索本地代码，不需要部署维护任何服务端，桌面和 AI Agent 命令行都能即开即用，那么 dowse 正是为你准备的。

## 下载并安装 dowse

前往 [Releases 页面](https://github.com/HenryZhang-ZHY/dowse/releases) 可以获取最新编译产物，`SHA256SUMS` 文件附带校验码。安装包命名格式为 `dowse` + 版本号 + 目标平台：

| 平台                               | 安装包                   |
| ---------------------------------- | ------------------------ |
| Windows (x64)                      | `…-windows-x86_64.zip`   |
| macOS 11+ (Apple silicon 与 Intel) | `…-macos-universal.zip`  |
| Linux (x64)                        | `…-linux-x86_64.tar.gz`  |
| Linux (arm64)                      | `…-linux-aarch64.tar.gz` |

下载解压后，添加包含代码仓库的父目录：

```bash
dowse ~/src ~/mirrors
```

若传入的目录包含多个 Git 仓库，dowse 会递归将它们全部接入。在 Windows 下，仓库管理页面还可以为文件资源管理器添加右键菜单“Add to dowse”。

由于个人开源构建没有购买商业签名证书，初次启动时 Windows SmartScreen 或 macOS Gatekeeper 可能会弹出安全拦截提示，项目 [README](https://github.com/HenryZhang-ZHY/dowse#download) 中有详细的信任操作说明。如果你想从源码编译，在较新的 Rust 稳定版环境下执行 `cargo run --release` 即可。

## 常见问题

### dowse 是 Sourcegraph 的替代品吗？

对于希望在本地搜索个人代码副本的单机开发者来说，是的。dowse 满足了 Sourcegraph 最核心的场景：无须服务器即可跨多仓库执行极速正则与字面量搜索。不过它并不提供 Sourcegraph 团队版的代码语义导航（code intelligence）、批量改动（batch changes）或多人共享 Web 界面。

### dowse 是 tgrep 的 GUI 外壳吗？

一部分是。dowse 直接读取并写入 tgrep 规范的 `.tgrep` 索引目录，因此它可以充当 tgrep 的桌面图形前端。在此基础上，dowse 还实现了单次查询检索多仓库、解析 GitHub code search 语法、分面与标签系统、表格视图、文件代码预览，以及 GitHub 仓库批量克隆与同步等能力，这些都不是 tgrep 本身的设计目标。

### dowse 和 Zoekt 有什么区别？

两者都基于三元组倒排索引。Zoekt 适合作为团队后台服务持续运行，需要外部流程持续灌入索引；dowse 则是一款面向个人的本地应用，由它自己直接索引你磁盘上的仓库，依靠文件监听器与增量更新保持索引最新，并提供了现代化的桌面 GUI 与专为 Agent 设计的命令行。

### 可以在本地用 GitHub code search 语法搜索吗？

可以。dowse 完全支持 GitHub code search 的主要语法：`AND`、`OR`、`NOT`、双引号精确短语、`/regex/` 正则表达式，以及 `path:`、`language:`、`repo:`、`branch:` 等修饰符，修饰符前加 `-` 即可取反。

### dowse 能搜到未提交的改动和其他分支的代码吗？

可以。dowse 直接读取本地磁盘上的文件，因此无论当前检出的是什么分支，甚至包含尚未 git commit 的本地修改，都会被纳入搜索。每个仓库都会打上当前分支标签，利用 `branch:main` 可以方便地限定只看主分支。

### 有没有不局限在 Visual Studio 内的 Entrian Source Search 替代品？

dowse 不是 IDE 插件，而是一个独立的桌面应用与 CLI 工具。遇到匹配结果时，它可以一键调起你偏好的编辑器，例如 VS Code、Cursor、Zed 或 Sublime Text。它天然支持跨仓库搜索而非单个项目工程，并且完全免费开源。

### dowse 会上传我的代码吗？

绝不会。索引文件存放在各个仓库自身的 `.tgrep` 目录下，所有搜索与匹配计算完全在本地机器上运行。唯一的网络通信仅发生在你主动请求 Git 与 GitHub CLI 操作时（例如列出组织仓库、克隆或后台拉取代码）。

---

dowse 开源在 [GitHub](https://github.com/HenryZhang-ZHY/dowse)。如果它为你节省了时间，欢迎点一个 Star 让更多开发者发现它；遇到问题或有新想法，也可以随时[提交 Issue](https://github.com/HenryZhang-ZHY/dowse/issues)。
