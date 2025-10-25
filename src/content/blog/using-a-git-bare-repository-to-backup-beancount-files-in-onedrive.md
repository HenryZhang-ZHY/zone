---
title: 'Using a Git Bare Repository to backup beancount files in OneDrive'
description: ''
pubDate: 2025-10-25
---

I use beancount for my personal finance tracking, and I put my beancount project in a OneDrive-synced folder. To avoid OneDrive syncing the python virtual environment, I put the venv folder into a non-synced directory, so every time I work on my beancount project, I need to activate the venv from that non-synced directory then back to my beancount project folder, like this:

```powershell
cd ~\path\to\non-synced\venv\Scripts
.\activate

cd ~\path\to\beancount-project
code .
fava main.bean
```

It's a bit cumbersome to start the actual work every time and there are still some temporary files created by fava importer or my editor that get synced to OneDrive, which I don't want.

To streamline this process and avoid unnecessary files being synced, I come up with a new idea: let OneDrive sync the bare git repository only, use git worktree to create a working tree in a non-synced folder. This way, I can keep all the unnecessary files out of OneDrive sync and still have easy access to my beancount project.

I did the following steps to migrate my existing beancount project to this new setup:

###### Make the existing beancount project a bare git repository

```powershell
cd ~\path\to\existing\beancount-project
git clone --bare . ..\beancount-project.git
```

###### Create a git worktree in a non-synced folder

```powershell
cd ~\path\to\non-synced
git --git-dir="~\path\to\beancount-project.git" worktree add beancount-project master
```

This setup ensures that only the committed git history of the project is synced by OneDrive, while temporary files, virtual environments, and editor caches created in the working directory remain local and unsynced.
