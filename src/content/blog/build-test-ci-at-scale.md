---
title: "Build, Test, and CI at Scale"
description: "Deriving build system, automated testing, and CI best practices from first principles for large-scale trunk-based development."
pubDate: 2026-03-29
---

In a large-scale software project with hundreds or thousands of engineers committing changes every day, how do you keep the codebase healthy?

This post focuses on **large-scale, trunk-based development** — where hundreds of engineers commit to a shared codebase daily — and is scoped to build systems, automated testing, and CI. Release engineering (CD, feature flags, canary, rollback) is a separate topic. Many of the practices discussed here are responses to challenges that only emerge at this scale; smaller teams may find them useful as guiding principles rather than prescriptions.

Each topic is examined in two parts: *why* it is necessary, derived from the constraints that scale imposes; and *how* to address it, drawing on engineering solutions that have been widely validated in practice.

## The Fundamental Problem

Large-scale software development has two intertwined tensions:

**Tension 1: Parallel development vs. serial integration.** Every engineer works on changes independently, but those changes must eventually merge into a single trunk. Any change can break existing functionality, often in ways the author doesn't anticipate. If we delay integration, we get integration hell — the cost of merging grows exponentially. If we integrate frequently, we need a mechanism to verify that each integration is safe.

**Tension 2: Thoroughness of verification vs. speed of verification.** A clean build of a large codebase can take hours. A full test suite can take hours more. But developers need fast feedback to stay productive. We need frequent, thorough verification, yet a single round of full verification is extremely expensive.

The fundamental goal is: **enable hundreds of engineers to safely and frequently integrate changes into the trunk, while keeping the trunk in a working — ideally releasable — state.**

Build, test, and CI each address a different layer of this goal:

- **Build** transforms source code into verifiable artifacts. Without a build, there is nothing to test.
- **Test** verifies that the artifacts behave as expected. Without tests, there is no way to judge whether a change is safe.
- **CI** automatically runs build and test on every integration as a quality gate. Without CI, verification depends on individual discipline, which does not scale.

These three are a logical chain, not three independent topics. And as we will see, at scale the quality of your build system is a key constraint on what your testing and CI can achieve.

## Why You Need a Build System

For a single-file project, a manual compile command suffices. But when the codebase grows to millions of lines across thousands of modules, the nature of the problem changes.

**Dependency relationships become complex and implicit.** Module A depends on B, B depends on C, C depends on D — humans cannot track all transitive dependencies in their heads. If dependency relationships are maintained manually, mistakes are inevitable: missing dependencies cause build failures; unnecessary dependencies slow builds down. You need a system to **declare and resolve a dependency graph**.

**Build order must be correct.** Given a dependency graph, the build system can automatically derive the correct topological ordering. Maintaining build order manually at scale is impossible.

**Hermeticity is essential.** A build is hermetic when all of its inputs — source code, toolchains, third-party libraries — are explicitly declared, and nothing is drawn implicitly from the host environment. Hermeticity is the prerequisite for reproducibility: if you cannot enumerate what goes into a build, you cannot guarantee that the same inputs produce the same output. And without reproducibility, you cannot trust the artifacts, and test results become meaningless.

**Efficiency demands it.** With a correct dependency graph and hermetic builds, you unlock the key optimization strategies — incremental compilation, parallel compilation, and build caching. At scale, these are not nice-to-haves — they are what make the difference between a multi-hour clean build and a minutes-long incremental one.

## How to Build a Build System

### The Dependency Graph — Foundation of Everything

The core data structure of a build system is a **directed acyclic graph (DAG)**, where nodes are build targets and edges are dependency relationships.

**Granularity matters.** If nodes are too coarse (one node = one large module), incremental and parallel builds gain little — changing one file rebuilds the entire module. If nodes are too fine (one node = one source file), the graph management overhead and scheduling cost become prohibitive. The sweet spot is a node representing a library or package with a clear responsibility — typically tens to hundreds of source files.

**Dependencies must be explicit and complete.** If A uses B but does not declare the dependency, the build might happen to succeed (because B is transitively pulled in by another path), but incremental builds will break — B changes but A is not rebuilt. The build system should **enforce completeness of dependency declarations**, not rely on implicit transitivity.

### Hermetic Builds — Foundation of Determinism

A hermetic build is one where **every input that can affect the output is explicitly declared and controlled**. The build does not reach into the host environment for anything — no system-installed libraries, no ambient environment variables, no implicitly inherited toolchain versions.

Achieving hermeticity requires isolating:

- **Toolchains**: compiler versions, linkers, etc. must be part of the build configuration, not whatever happens to be installed on the machine.
- **External dependencies**: third-party library versions must be locked.
- **Non-deterministic sources**: environment variables, timestamps, random seeds must be eliminated or fixed.

Hermeticity is distinct from, but closely related to, **reproducibility** (identical inputs producing byte-for-byte identical outputs). Hermeticity is a necessary condition: without knowing all inputs, you cannot guarantee identical outputs. But hermeticity alone is not sufficient — compilers and linkers can have their own non-deterministic behaviors (e.g., parallelism-dependent instruction ordering). In practice, hermeticity gets you most of the way; full bit-for-bit reproducibility is a stronger goal that requires additional effort.

Hermeticity is also a critical precondition for **build cache correctness**. A cache works by keying artifacts on a hash of their inputs. If the build is not hermetic, inputs that affect the output go undeclared and therefore unhashed — the cache may return stale artifacts because the key matched but an invisible dependency changed. That said, cache correctness also depends on the key computation being complete and accurate; hermeticity is the strongest single enabler, but not the only requirement.

Without hermeticity, different developers and CI produce different results from the same source code, and debugging becomes a nightmare.

### Incremental & Parallel Compilation

With a correct dependency graph:

**Incremental compilation**: when source file X changes, only rebuild the node containing X and all nodes that directly or transitively depend on it. Everything else can be reused.

**Parallel compilation**: nodes with no dependency relationship can be built simultaneously. The maximum parallelism is determined by the width of the dependency graph (the size of the largest antichain).

The benefit of both strategies is directly proportional to the **granularity** of the dependency graph — finer granularity means smaller affected subgraphs (better incremental gains) and more nodes at the same level (better parallel gains).

### Build Cache (Local + Remote)

The essence of build caching is trading space for time. For each build node, compute a hash of its inputs (source code + dependency artifacts + build configuration). If the cache already contains an artifact for the same hash, retrieve it and skip the build.

**Two layers of cache**:

- **Local cache**: on the developer's machine. Avoids rebuilding the same thing yourself (e.g., switching branches and switching back).
- **Remote cache**: on a shared server. One person's build artifacts can be reused by everyone else and by CI. For a large project with hundreds of engineers, many of whom are building the same dependencies, the savings are enormous.

Remote cache effectiveness correlates directly with hermeticity: the more hermetic your builds, the fewer undeclared inputs, and the higher your cache hit rate.

### Foundations First

These properties are not four parallel features — they have strict prerequisite relationships:

- A correct dependency graph enables correct build ordering, incremental compilation, and parallel compilation.
- Hermeticity is the strongest single enabler of build cache correctness and reproducibility.

Invest in the foundations first. Without a correct dependency graph, incremental compilation produces wrong results. Without hermeticity, caches become unreliable.

## Why You Need Automated Testing

Software defects are inevitable. No matter how experienced the engineer or how rigorous the code review, changes can and will introduce regressions. The question is not whether defects will occur, but how quickly they are caught — and at what stage of development.

**Manual testing does not scale.** With hundreds of engineers submitting changes every day, manual verification of every change is impossible. Humans are unreliable — they skip steps when rushed, they forget edge cases, they assume "my change won't affect that part." And manual testing is not repeatable — different people execute the same verification differently.

**Automated testing** encodes verification logic as code. Once written, it can be executed infinitely at near-zero marginal cost, unaffected by human state (fatigue, deadline pressure), and coverage accumulates over time.

### The Primary Purpose: Confidence

The primary purpose of automated testing is to **build confidence in the safety of changes**. Cost is a constraint, not the goal.

Confidence is a function of two factors:

- **Coverage**: how many behaviors that could go wrong are covered by tests? If you only test the happy path, you have no confidence about edge cases.
- **Reliability**: if a test has a 5% chance of randomly failing (flaky), its signal is noise. When flaky failures accumulate, engineers start habitually re-running CI or ignoring failures, and the confidence value of the entire test system collapses to zero.

Two ways to destroy the value of testing:

1. Not writing enough tests → insufficient coverage → defects escape.
2. Unreliable tests → signal drowned by noise → equivalent to having no tests.

## How to Test

### Test Classification: Size vs. Scope

To make informed trade-offs between confidence and cost, you first need a classification system. There are two **orthogonal dimensions**:

#### Dimension 1: Test Scope (what you are testing)

- **Unit test**: verifies the behavior of a single function or class, with external dependencies isolated.
- **Integration test**: verifies the behavior of multiple components working together.
- **End-to-end test**: verifies the entire system from user input to final output.

#### Dimension 2: Test Size (what resources are consumed)

- **Small**: uses only CPU and memory. No file system, network, or database access. Fast (milliseconds), highly deterministic.
- **Medium**: may access local resources (file system, local database), but no external network. Moderate speed (seconds to tens of seconds).
- **Large**: may access external systems and network. Slow (minutes), low determinism.

These dimensions are orthogonal — a unit test can be small or medium (e.g., testing a file parser that needs to read from disk makes it medium even though it tests a single function); an integration test can be small (e.g., multiple in-process components collaborating with real code, but without touching the file system, network, or database — the "integration" is between components, and "small" reflects the absence of slow external resources).

**Why this distinction matters**: cost optimization strategies depend on which dimension you are operating in. Test scope determines what level of behavior you are verifying — this affects what types of defects you can catch. Test size determines execution cost and reliability — this affects CI speed and flaky rate.

### The Cost Model

Tests have three categories of cost:

**Development cost**: how long does it take to write a test? Unit tests are typically cheapest — single-purpose logic, simple setup. End-to-end tests are most expensive — full environment setup, complex data preparation, complex assertions.

**Maintenance cost**: when production code changes, how many tests need to be updated? Tests tightly coupled to implementation details (e.g., heavy mocking of internals) require changes on every refactor. Good tests **test behavior, not implementation** — if the public interface is unchanged, the tests should not need to change.

**Execution cost**: computational resources and time to run the tests. Small tests are nearly free. Large tests may require spinning up databases, container clusters — expensive. At scale, this translates into significant compute costs: hundreds of engineers submitting daily, each triggering CI, multiplied across a large cluster.

### The Test Pyramid

The test pyramid is the natural result of optimizing confidence under cost constraints:

- **Large base of unit/small tests**: cheap to write, cheap to maintain, fast to run, reliable. They provide broad, fast baseline confidence.
- **Middle layer of integration tests**: moderate cost, verify component interactions that unit tests cannot catch.
- **Small top of end-to-end tests**: expensive on all three cost dimensions, but verify critical user journeys that nothing else can.

This is not dogma — it is the shape that emerges when you maximize confidence per unit of cost.

### Test ROI

When deciding where to invest testing effort, it helps to think in terms of return on investment. As a mental heuristic (not a precise formula):

> **Test ROI ≈ value of defects caught / (development cost + maintenance cost + execution cost)**

"Value of defects caught" is not a single number you can compute, but you can approximate it with practical proxy signals: how often does this test catch real regressions? How critical is the code path it covers? How many other tests already cover the same behavior?

High-ROI tests tend to be: unit tests covering core business logic — fast to write, low maintenance, fast to run, catch high-impact defects.

Low-ROI tests tend to be: end-to-end tests verifying UI styling details — slow to write, frequently broken by UI changes, slow and flaky to run, catch low-impact issues.

**Under limited resources, invest in high-ROI tests first.** In practice, many teams do the opposite — they invest heavily in end-to-end tests first, then get buried by maintenance costs and flaky rates.

## Why You Need CI

We now have a build system and automated tests. The next question: **who runs them, and when?**

Relying on developers to run them locally breaks down in practice:

1. **Environment inconsistency**: developers' machines differ. "Works on my machine" is a classic failure mode.
2. **Not enforceable**: you cannot guarantee everyone runs the full build and test suite before submitting. Under deadline pressure, skipping tests is human nature.
3. **Not scalable**: full test suites take hours. You cannot ask every developer to run full tests locally before every commit.
4. **Integration blind spots**: developer A passes locally, developer B passes locally, but A + B merged together fails. Local verification cannot cover this.

CI is a **trusted, automated quality gate** that runs build and test in a standardized environment before code enters the trunk. It provides:

- **Standardized environment**: eliminates "works on my machine."
- **Mandatory enforcement**: no merge without passing CI, no exceptions.
- **Merge-candidate verification**: CI does not just verify the branch in isolation — it verifies the candidate state of the change merged with the current trunk. This catches integration conflicts that per-branch testing would miss. (A merge queue, discussed later, takes this further by accounting for other queued changes.)
- **Feedback loop**: developers learn quickly whether their change is safe.

For large-scale projects, **pre-merge CI is essential**. If the trunk breaks, it blocks hundreds of engineers — everyone loses a correct baseline to work from. The cost of fixing a broken trunk far exceeds the cost of waiting for pre-merge verification.

## How to Build CI at Scale

### The Core Tension: Throughput vs. Correctness

Hundreds of engineers submit changes daily. The CI system must verify each one, but verification takes time and resources, and changes arrive at a high rate. If CI cannot keep up, a queue forms. Queuing means waiting. Waiting means blocked developers. CI engineering is fundamentally about optimizing the trade-off between **throughput** and **correctness**.

### Merge Queue

**The problem**: two PRs each pass CI based on the same trunk commit, but after both are merged, the trunk breaks. PR-A deletes a function; PR-B adds a call to that function. Each passes CI individually, but their combination fails.

A merge queue solves this by verifying each change **on top of the trunk plus all preceding queued changes**, ensuring that what is verified is what will actually enter the trunk.

**Scaling strategies**:

- **Speculative execution**: assume that earlier changes in the queue will pass, and start verifying later changes in parallel. If an earlier change fails, later ones are re-verified. This trades compute resources for throughput.
- **Batch mode**: merge multiple changes together and verify them as a batch. If the batch passes, all changes enter the trunk together. If it fails, use bisection to identify the offending change.

### Task Distribution

**The problem**: a full test suite may contain tens or hundreds of thousands of test cases. Running them serially on one machine may take hours.

**Sharding strategies**:

- Shard by test count — simple but unbalanced, because tests vary widely in execution time.
- **Shard by historical execution time** — equalize the expected wall time of each shard, so total time equals the longest shard. This minimizes wait time.
- Shard by dependency — tests requiring the same build artifacts go together, reducing artifact transfer.

**Intelligent test selection**: do not run the full test suite. Only run tests affected by the change. Based on dependency graph analysis: a change to module A triggers only the tests that directly or transitively depend on A. This is the same principle as incremental compilation — using the dependency graph to eliminate unnecessary work.

**Resource management**: CI cluster compute is finite. Smart scheduling maximizes utilization. Priority scheduling ensures urgent hotfix PRs jump the queue.

### Test Selection Depends on Build System Quality

This is a critical cross-cutting insight: **the precision and reliability of test selection is bounded by the quality of your build system.**

Precise test selection requires answering: "which tests are affected by this code change?" To answer accurately:

- You need a **complete and correct dependency graph** from the build system. Missing edges mean missed tests — defects escape. Unnecessary edges mean extra tests — wasted resources.
- You need **hermeticity** to trust that "inputs haven't changed → outputs haven't changed → tests depending on those outputs don't need to rerun."

Without these, test selection must be conservative — running more tests than necessary, or in the worst case, running all tests every time. That is the price you pay for an inadequate build system.

**At scale, the quality of your build system sets the upper bound on how precise your test selection can be and how fast your CI can run.** Shortcuts taken in the build system are repaid with interest in CI speed and testing cost.

#### A Concrete Example: When Build System Debt Cascades

Consider a scenario of how build system limitations compound over time:

1. A large application, grown over a decade, uses a task-based build system. The build cache can only operate at the granularity of the entire build output — there is no per-target caching. A single build takes over an hour.
2. Because the build system lacks a fine-grained dependency graph, it is impossible to determine which tests are affected by a given change. The team has no choice but to run the full test suite on every CI run.
3. To work around the slow builds, parts of the project are split into separate repositories, solely to reduce the build time of the main project.
4. This repo split further complicates the build process, breaks normal dependency management patterns, and prevents automated tooling (e.g., dependency update bots) from working — because the dependency relationships now span multiple repositories and are no longer tracked by a single build system.

What started as a build system limitation cascades into testing inefficiency, CI bottlenecks, and organizational workarounds that create new problems of their own.

### Flaky Test Governance

Flaky tests are the number one enemy of CI at scale.

**Why flakiness is devastating at scale**: even if each individual test has a very low flaky rate, a test suite with tens of thousands of tests will encounter flaky failures on nearly every CI run — it is a matter of combinatorics. Once flaky failures become routine, developers start reflexively re-running CI, wasting resources and time. Worse, **real failures get buried in flaky noise**. When engineers learn to ignore red builds, the confidence value of the entire test system collapses.

**Governance strategies**:

1. **Automated detection**: track the historical pass rate of every test. When it drops below a threshold, automatically flag it as flaky.
2. **Automated quarantine**: remove flagged flaky tests from the critical path (they no longer block merges), but continue running them to collect data.
3. **Ownership tracking**: every test must have a clear owner (team or individual). Flaky tests automatically notify the owner to fix.
4. **Repair SLA**: set a time limit for fixing flaky tests. If the deadline passes without a fix, automatically disable the test.
5. **Root cause analysis**: common flaky causes include race conditions, external service dependencies, state leakage between tests, and resource contention. Categorized statistics help reduce flakiness at the source.

### Observability & Statistics

**You cannot improve what you cannot measure.**

A CI system needs a comprehensive metrics framework to drive continuous improvement.

**Speed metrics**:

- **CI duration p50/p95**: how long does a developer wait from submission to result? p95 matters more than p50 — tail latency destroys developer experience.
- **Queue wait time**: how long does a change sit in the merge queue?
- **Slowest tests top-N**: which tests are dragging down the entire CI?

**Reliability metrics**:

- **Flaky rate**: overall and per-test flaky rate.
- **CI success rate**: the rate of genuine code quality failures, excluding flaky noise.
- **Trunk stability**: percentage of time the trunk is in a green state.

**Efficiency metrics**:

- **Cache hit rate**: for both build cache and test cache.
- **Compute utilization**: CI cluster utilization and cost.

**Quality metrics**:

- **Test coverage trend**: how coverage changes over time.
- **Defect escape rate**: the number of defects that passed CI but were found in production — the ultimate measure of test suite effectiveness.

With these metrics, you can diagnose problems: CI is slow? Check p95 duration and slowest tests. Flaky rate is rising? Check categorized data to locate root causes. Builds are slow? Check whether cache hit rate has dropped. Is the test suite effective? Check defect escape rate.

## Conclusion

Build, test, and CI are not three independent optimization problems. They form a chain with a clear dependency structure:

1. The **build system** provides the dependency graph and hermeticity — the foundation that everything else rests on.
2. **Automated testing** uses the build system's artifacts to verify behavior and provide confidence in changes.
3. **CI** orchestrates build and test as a critical quality gate, and its efficiency is bounded by the quality of the build system and the reliability of the test suite.

Every engineering practice discussed in this post — incremental compilation, build caching, the test pyramid, test selection, merge queues, flaky test governance, observability — is a response to the same fundamental tension: **verification must be thorough, but it must also be fast.** The art is in finding the right trade-offs, and the foundation is getting your build system right.
