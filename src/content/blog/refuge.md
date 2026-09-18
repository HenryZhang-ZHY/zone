---
title: 'Refuge：给 Git 仓库一个可恢复的避难所'
description: '从两个本地文件管理方案出发，记录我为什么做 Refuge，以及它目前如何备份和恢复 Git 仓库。'
pubDate: 2026-09-18
outline: |
  - L1 用 Git 管理文件，关键是划清本地状态与持久数据的边界
    - L2 之前的两次实践分别处理同步目录和共享仓库中的本地文件
      - L3 bare repository 只让 OneDrive 同步提交历史
      - L3 全局 ignore 和 git clean exclude 保留个人开发配置
  - L1 Refuge 把这条思路做成可恢复的 Git 服务
    - L2 活跃仓库留在本地 runtime，可迁移数据写入 Backup
      - L3 支持标准 Git Smart HTTP 和 Git LFS
      - L3 每次 push 生成经过校验的不可变快照
      - L3 空 runtime 能从最新有效快照自动恢复
  - L1 这是一篇随着真实使用持续修订的活文档
    - L2 当前设计来自部署中实际遇到的问题
      - L3 runtime 与 Backup 已分离，避免 bind mount 的 Git 所有者检查
---

我之前写过两篇和 Git 管理文件有关的文章。一篇把 [Beancount 的 bare repository 放进 OneDrive](/blog/using-a-git-bare-repository-to-backup-beancount-files-in-onedrive/)，只同步提交历史，把工作目录、虚拟环境和临时文件留在本地；另一篇记录如何在[共享仓库里保留个人配置文件](/blog/how-to-manage-local-files-in-a-shared-git-repository/)，既不提交，也不让 `git clean` 删除。

这两件事其实在处理同一个问题：哪些状态应该进入 Git，哪些只属于当前机器，以及真正需要恢复时应该保留什么。

## Refuge 是什么

[Refuge](https://github.com/HenryZhang-ZHY/refuge) 是我沿着这条思路做的一个单用户 Git 服务。客户端使用普通的 Git Smart HTTP 和 Git LFS；每次 push 后，Refuge 会把仓库发布成经过校验的不可变快照。

它现在把存储明确分成两部分：

- **Runtime** 保存正在提供服务的 bare repositories 和备份队列，放在 Docker 管理的本地 volume 中。
- **Backup** 只保存可验证、可迁移的快照，可以挂载到 NAS 或定期同步的目录。

迁移 Server 时，我不需要复制正在运行的 Git 仓库。只要保留 Backup 和独立管理的 owner secret，新 Server 就能用空 runtime 启动，并从每个仓库最新的有效快照自动恢复。

## 为什么不直接同步 bare repository

把 bare repository 直接放进同步盘很简单，我也确实这样用过。但活跃 Git 仓库会持续修改很多小文件，同步工具和容器 bind mount 还会引入一致性、文件权限与 Git 所有者检查等问题。

Refuge 选择让运行数据保持本地，把同步边界收窄到不可变快照。它只验证本地 Backup 是否完整；异地副本是否真的上传成功，仍由同步工具负责。

## 这是一篇活文档

Refuge 目前仍在实际使用中迭代。比如 runtime 与 Backup 的分离，就是在部署中遇到 Git 权限问题后重新设计的。

我会随着使用继续更新这篇文章：补充真实的恢复记录、失败案例和运维成本，也会修正现在看起来合理、以后证明并不合理的判断。这里记录的是当前状态，不是最终结论。
