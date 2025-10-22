---
title: How to fix a bug
description: ''
pubDate: 2025-10-22
---

When I get a bug report, I follow these steps to fix it:

First, Reproduce the bug, this can help me ensure it is a real bug and not a misunderstanding. A minimal reproducible example will save a lot of time on debugging. I always record the reproduction steps so that I can redo it after I make changes to verify the fix.

Then I investigate the following aspects:
- The root cause of the bug.
- How did we get here? In other words, what lead to the root cause being present in the codebase? 
  - Let's say the root cause is a misconfiguration, then why was it misconfigured in the first place? Should we refactor the code to make it less error-prone?
- Is there any other similar code that may have the same issue? I usually use code search tools to find similar code patterns.
- Why the automated tests did not catch this bug? Can we add tests to cover this case?

Fix the bug, this step is usually straightforward if we done the previous steps well.
