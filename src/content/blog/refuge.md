---
title: 'Refuge：不是另一个 Git Server'
description: '我为什么做 Refuge：让不适合放上公共 Git 平台的仓库，也能方便地备份和恢复。'
pubDate: 2026-09-18
outline: |
  - L1 有些资料需要 Git，却不适合交给公共 Git 托管平台
    - L2 同步工作目录会把临时文件也带进云端
      - L3 Beancount、Obsidian 和工作项目都会产生缓存、虚拟环境等本地文件
    - L2 同步 bare repository 仍然缺少可靠的恢复保证
      - L3 活跃仓库由许多持续变化的小文件组成，同步完成不等于能够恢复
  - L1 Refuge 把 Git 的日常使用与灾难恢复分开
    - L2 本地机器或私人 Server 保存唯一可写的仓库
      - L3 客户端仍然使用普通的 Git push 和 pull
    - L2 同步盘只接收经过校验的不可变快照
      - L3 新机器可以从最新的有效快照重建仓库
  - L1 Refuge 只解决私人仓库的托管、备份与恢复
    - L2 Server 是一种使用方式，而不是产品目的
      - L3 它不提供协作平台功能，也不备份未提交文件
---

我有一些很适合用 Git 管理、却不适合放上 GitHub 的资料：个人财务记录、Obsidian 笔记，以及只能留在公司设备和公司 OneDrive 里的工作项目。它们需要版本历史，也需要在硬盘损坏或电脑更换后能够恢复。

直接把工作目录放进同步盘并不好用。缓存、虚拟环境和临时文件也会被同步，不仅浪费空间，还会制造冲突。于是我曾经把 [bare repository 放进 OneDrive](/blog/using-a-git-bare-repository-to-backup-beancount-files-in-onedrive/)，把工作目录留在本地。这个办法隔离了临时文件，却留下了更重要的问题：同步软件面对的是一个正在变化的 Git 仓库；文件显示“已同步”，并不代表远端一定是一份完整、可恢复的仓库。

这就是我做 [Refuge](https://github.com/HenryZhang-ZHY/refuge) 想解决的问题：**在不依赖公共 Git 托管平台的前提下，让私人仓库既好用，又真的能够恢复。**

Refuge 把两件事分开了：本地机器或自己的 Server 保存正在使用的 bare repository，是唯一可写的数据源；OneDrive 等同步目录只接收经过校验的不可变快照。平时我仍然使用普通的 `git push` 和 `git pull`。每次 push 后，Refuge 会生成包含完整 Git 历史的快照；如果仓库使用 Git LFS，对应对象也会一起保存。

这样，备份不再是“复制了一个目录，希望它还能用”，而是一条明确的恢复路径：原来的机器丢失后，在新机器上保留备份目录，Refuge 会校验快照，并从最新的有效版本重建仓库。备份暂时失败也不会阻止本地 Git 使用，之后可以重试。

Refuge 可以只在一台电脑上运行，也可以作为私人 Server 供多台设备访问。后者只是使用方式，不是它存在的理由。它不打算替代 GitHub，不做 pull request、issue 或 CI，也不备份尚未提交的文件；它只想把一件小事做完整：给不能放到公共平台的 Git 历史，留下一条可信的退路。

目前 Refuge 校验的是本地生成的快照；它不会假装知道 OneDrive 是否已经把文件成功上传。云端同步仍由同步工具负责，这也是它现在清楚保留的一条边界。
