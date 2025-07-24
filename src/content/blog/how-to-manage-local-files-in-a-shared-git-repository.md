---
title: 'How to manage local files in a shared git repository'
description: 'A guide to keep local files untracked in a shared git repository and prevent them from being deleted by git clean.'
pubDate: 2025-07-24
---

## Problem description

When working on a shared git repository, I found I often need to keep some files locally that I don't want to push to the remote repository. These files are useful for my personal development setup but are not relevant to the rest of the team.

In my case, I use [mise](https://mise.jdx.dev/) to manage my local dev tools, so I have a `mise.local.toml` file that contains configurations for tools I use. This file is not meant to be shared with the team, and I don't want it to be tracked by git.

I also often run `git clean -fxd` to create a pristine working directory to test a clean build, but I don't want this command to delete my local `mise.local.toml` file. However, since it's untracked and not ignored, `git clean -fxd` will remove it.

## Solution

1. Add the file to `~/.config/git/ignore` to prevent it from being tracked by git. This way, it won't show up in `git status` or be included in commits. [^1]
2. Stop using `git clean -fxd` for cleaning up the working directory, as `-x` will also remove all ignored files, use `git clean -fd` instead. This will only remove untracked files that are not ignored, preserving your local configuration files. [^2]

## References

[^1]: [Git - gitignore Documentation](https://git-scm.com/docs/gitignore)

[^2]: [Git - git clean Documentation](https://git-scm.com/docs/git-clean)
