---
title: 'refuge：让 OneDrive 成为私人 Git 仓库的存储层'
description: '我为什么做 refuge：不部署私有 Git host，也能备份、恢复和跨设备使用自己的私人仓库。'
pubDate: 2026-09-18
outline: |
  - L1 我有一些需要 Git 但不适合放上公共平台的仓库
    - L2 用 Beancount 记账，用 Git 做版本控制，在 OneDrive 放一个 bare repo，用它做备份和跨设备同步
    - L2 不直接同步工作目录，是因为运行时会装 Python virtual environment，还有 PyCache 这类临时文件
      - L3 这些文件完全不需要同步，所以只同步 bare repo，用的时候再从它创建 worktree
    - L2 bare repo 加 worktree 的办法，多设备用起来不方便
      - L3 一个 branch 只能有一个 worktree，两台电脑都想操作时就要频繁切换
    - L2 公司里也有类似需求：自己创建的 repo 不适合放到公司 Git 平台，又希望换设备时能方便迁移
      - L3 公司提供 OneDrive，我就想让它作为 storage backend
  - L1 我不想部署一个私有的 Git host 平台
    - L2 Gitea、GitLab 这类平台太重，在公司电脑上尤其如此
    - L2 我想要的只是能正常操作一个 Git repo，并且它自动把 repo 备份到 OneDrive
  - L1 refuge 把这个 storage layer 做成了一个 CLI 工具
    - L2 它把 OneDrive 变成 remote repo 的 storage layer，实现对私人 Git 仓库的备份与恢复
      - L3 到新机器上，可以从 OneDrive 的备份里很快把 repo 恢复出来
      - L3 操作自己的 repo 就像托管在 GitHub 上一样，正常 pull、push 就好
      - L3 不用再考虑 worktree、bare repo 这些东西
  - L1 典型流程：把已有仓库接进来，push，换机器时恢复
    - L2 refuge init --target ~/OneDrive/refuge，仓库放本地，快照写进 OneDrive
    - L2 refuge repo import notes --connect，在现有工作副本里加上 refuge remote
    - L2 之后是普通 Git 操作，git push refuge main 即可
      - L3 refuge repo status --all 看保护状态，snapshots verify 会真恢复一遍确认可用
    - L2 新机器上 refuge init 之后用 refuge restore notes 恢复
      - L3 快照里是提交过的内容，恢复出来是 Git 历史和已提交的文件
---

我用 Beancount 做个人财务管理，用 Git 做版本控制。同时我在 OneDrive 里放了一个 bare Git repo，用它做备份，也用它跨设备同步。

为什么不直接把整个 beancount 工作目录放进 OneDrive？因为我在用的过程中，它会装一些 Python 的 virtual environment 文件，运行时还有 `__pycache__` 这种临时文件。这些东西其实完全不需要同步。所以我就在 OneDrive 里放一个 bare Git repo[^1]，用的时候再从这个 bare repo 里创建一个 worktree。

但这个办法的问题是没法做多设备同步。一个 branch 只能有一个 worktree，我如果有两台电脑都想操作这个 repo，就要 checkout 出两个 worktree，非常不方便。

还有一个使用场景是在公司。我有一些自己创建的 Git repo，它们首先不适合放到公司的 Git 平台上；其次，我希望每隔几年换新设备的时候，能很方便地把它们迁移到新电脑上。公司提供了 OneDrive，我就想，能不能让 OneDrive 当存储。

我又不想部署一个私有的 Git host 平台，比如 Gitea、GitLab 这些东西。在公司电脑上部署这个东西有点太重。

所以我开发了 [refuge](https://github.com/HenryZhang-ZHY/refuge)。它是一个 CLI 工具，可以帮你把 OneDrive 变成一个 remote repo 的 storage layer。它只是让我能够正常地操作一个 Git repo，然后自动把这个 repo 放到 OneDrive 里去做备份。我到了新机器上，又能从 OneDrive 的备份里把 repo 恢复出来。这样你在操作这种个人 repo 的时候，就像把数据托管在 GitHub 上一样，你只需要正常地 pull、push 就好了，不需要考虑 worktree、bare repo 这些东西。

## 使用案例

典型流程是这样：把已经存在的仓库接进来，push 一次，之后正常用 Git。我这套只用在一台电脑上，换机器是靠备份恢复。

```bash
# 准备本机：仓库放在本地的 repos 目录，快照写进 OneDrive
refuge init --target ~/OneDrive/refuge

# 把自己已有的仓库接进来，并在当前工作副本里加上 refuge 这个 remote
cd ~/code/notes
refuge repo import notes --connect

# 之后就是普通的 Git 操作，提交再 push 就好，refuge 会自动把快照写进 OneDrive
git add -A
git commit -m "update notes"
git push refuge main

# 看保护状态；snapshots verify 会把快照真正恢复一遍来确认它可用
refuge repo status --all
refuge snapshots verify notes
```

换一台机器的时候，仓库从 OneDrive 里恢复：

```bash
refuge init --target ~/OneDrive/refuge
refuge restore notes
```

[^1]: [Using a Git Bare Repository to backup beancount files in OneDrive](/blog/using-a-git-bare-repository-to-backup-beancount-files-in-onedrive)
