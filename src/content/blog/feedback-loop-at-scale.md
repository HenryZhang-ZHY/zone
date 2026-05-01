---
title: "Feedback Loop at Scale = Build + Test + CI"
description: "A software engineering perspective on why build, test, and CI jointly determine the feedback loop of large-scale development."
pubDate: 2026-03-29
threeLevelNote: |
  - L1 Iteration speed at scale is constrained by feedback loop quality, not any single practice
    - L2 Large-scale development faces two fundamental tensions
      - L3 Parallel dev vs. serial integration: delaying merges causes exponential cost; frequent merges demand automated verification
      - L3 Thoroughness vs. speed: full build+test can take hours, but developers need fast feedback to stay productive
    - L2 Build, test, and CI are a dependency chain — the system is limited by its weakest link
      - L3 Build produces artifacts, test verifies safety, CI enforces at the integration boundary
      - L3 Fast builds with weak tests just ship regressions faster; strong tests with slow CI just queue developers longer
  - L1 Build system quality sets the upper bound on what testing and CI can achieve
    - L2 A correct dependency graph enables all downstream optimizations
      - L3 Without explicit dependencies, incremental builds produce wrong results and test selection cannot determine affected tests
      - L3 Granularity trade-off: too coarse limits parallelism; too fine adds scheduling overhead
    - L2 Hermeticity — declaring every input — enables reproducibility and cache correctness
      - L3 Undeclared inputs cause "works on my machine" and stale cache hits from unhashed keys
      - L3 Hermeticity gets you most of the way; full bit-for-bit reproducibility requires additional effort (e.g., eliminating parallelism-dependent instruction ordering)
    - L2 Build caching (local + remote) converts repeated work into lookups
      - L3 Remote cache: one engineer's artifacts reused by hundreds of others and by CI
      - L3 Without hermeticity, undeclared inputs go unhashed — the cache key matches but the artifact is stale
    - L2 Build shortcuts cascade — a concrete example shows how debt compounds
      - L3 Decade-old task-based build: no per-target caching → hour-long builds; no affected-test analysis → full suite every CI run
      - L3 Repo-splitting workaround breaks dependency management and blocks automated tooling
  - L1 Testing creates confidence only when coverage is broad and signals are reliable
    - L2 Two failure modes destroy testing value
      - L3 Insufficient coverage: defects escape to production
      - L3 Flakiness: engineers ignore failures, confidence collapses to zero
    - L2 Scope and size are orthogonal dimensions for classifying tests
      - L3 Scope (unit/integration/E2E) determines what behaviors you verify; size (small/medium/large) determines execution cost and reliability
      - L3 A unit test can be medium (file I/O); an integration test can be small (in-process components, no external resources)
    - L2 Test ROI guides investment — the pyramid is the shape of cost-optimized confidence
      - L3 Cost = development + maintenance + execution; unit tests on core logic dominate ROI
      - L3 Anti-pattern: heavy E2E investment → drowning in maintenance and flakiness
  - L1 CI closes the loop by making verification mandatory, but scaling it demands explicit engineering
    - L2 Local verification fails at the integration boundary
      - L3 PR-A deletes a function, PR-B calls it — each passes alone, combination breaks trunk
      - L3 Pre-merge CI on a standardized environment eliminates environment inconsistency
    - L2 Throughput optimizations: merge queues, sharding, and selective test execution
      - L3 Merge queue verifies each change atop trunk + preceding queued changes; speculative execution trades compute for throughput
      - L3 Affected-test selection precision is bounded by build graph completeness
    - L2 Flaky governance and observability sustain trust over time
      - L3 Low per-test flaky rate × thousands of tests ≈ near-certain flaky failure per run
      - L3 Each metric diagnoses a specific failure: slow CI → check p95 and slowest tests; rising flakiness → check categorized root causes; escaping defects → test suite isn't catching what matters
---

In a large-scale software project, iteration speed is ultimately constrained by the quality of the feedback loop.

If build is slow, developers wait to learn whether a change compiles. If tests are weak or flaky, the feedback is untrustworthy. If CI is missing, the feedback is not consistently enforced. At scale, you do not get to do only one or two of these well: **build, test, and CI must all be strong, because all three jointly determine whether the organization can iterate quickly and safely.**

This post focuses on **large-scale, trunk-based development** — where hundreds of engineers commit to a shared codebase daily — and is scoped to build systems, automated testing, and CI. Release engineering (CD, feature flags, canary, rollback) is a separate topic. Many of the practices discussed here are responses to challenges that only emerge at this scale; smaller teams may find them useful as guiding principles rather than prescriptions.

## The Feedback Loop

In a large-scale software organization, the hardest problem is not merely "keeping the codebase healthy." It is preserving a **fast and trustworthy feedback loop** while hundreds or thousands of engineers make changes in parallel.

### Two Fundamental Tensions

Large-scale development is shaped by two tensions that cannot be resolved individually — only managed together.

**Parallel development vs. serial integration.** Every engineer works on changes independently, but those changes must eventually merge into a single trunk. Any change can break existing functionality, often in ways the author doesn't anticipate. If we delay integration, we get integration hell — the cost of merging grows exponentially. If we integrate frequently, we need a mechanism to verify that each integration is safe.

**Thoroughness vs. speed.** A clean build of a large codebase can take hours. A full test suite can take hours more. But developers need fast feedback to stay productive. We need frequent, thorough verification, yet a single round of full verification is extremely expensive.

The fundamental goal is: **enable hundreds of engineers to safely and frequently integrate changes into the trunk while preserving a fast, trustworthy feedback loop and keeping the trunk in a working — ideally releasable — state.**

### The Dependency Chain

Build, test, and CI each determine a different property of that feedback loop:

- **Build** produces verifiable artifacts quickly and deterministically. Without a build, there is nothing to test.
- **Test** determines whether the artifacts are safe. Without tests, speed just helps you ship regressions faster.
- **CI** enforces verification consistently at the integration boundary. Without CI, verification depends on individual discipline, which does not scale.

These three form a dependency chain, not three parallel investments. Fast builds with weak tests just ship regressions faster. Strong tests with slow CI just queue developers longer. The system is limited by its weakest link.

## Build: The Foundation

Build is the first stage of the feedback loop. Before you can ask "is this change safe?", you first need to answer "what changed, what depends on it, and what must be rebuilt?"

For a single-file project, a manual compile command suffices. But when the codebase grows to millions of lines across thousands of modules, the nature of the problem changes. You need a system to declare and resolve dependencies, enforce build correctness, and make the whole process fast enough to support continuous verification. **At scale, the quality of the build system sets the upper bound on what testing and CI can achieve.**

### The Dependency Graph

The core data structure of a build system is a **directed acyclic graph (DAG)**, where nodes are build targets and edges are dependency relationships. This graph is the foundation for everything else.

**Dependencies must be explicit and complete.** If A uses B but does not declare the dependency, the build might happen to succeed (because B is transitively pulled in by another path), but incremental builds will break — B changes but A is not rebuilt. Without explicit dependencies, incremental builds produce wrong results, and test selection cannot determine which tests are affected by a change. The build system should **enforce completeness of dependency declarations**, not rely on implicit transitivity.

**Granularity matters.** If nodes are too coarse (one node = one large module), incremental and parallel builds gain little — changing one file rebuilds the entire module. If nodes are too fine (one node = one source file), the graph management overhead and scheduling cost become prohibitive. The sweet spot is a node representing a library or package with a clear responsibility — typically tens to hundreds of source files.

With a correct dependency graph, two key optimizations become possible:

- **Incremental compilation**: when source file X changes, only rebuild the node containing X and all nodes that directly or transitively depend on it. Everything else can be reused.
- **Parallel compilation**: nodes with no dependency relationship can be built simultaneously. The maximum parallelism is determined by the width of the dependency graph (the size of the largest antichain).

The benefit of both strategies is directly proportional to the **granularity** of the dependency graph — finer granularity means smaller affected subgraphs (better incremental gains) and more nodes at the same level (better parallel gains).

### Hermeticity

A hermetic build is one where **every input that can affect the output is explicitly declared and controlled**. The build does not reach into the host environment for anything — no system-installed libraries, no ambient environment variables, no implicitly inherited toolchain versions.

Achieving hermeticity requires isolating:

- **Toolchains**: compiler versions, linkers, etc. must be part of the build configuration, not whatever happens to be installed on the machine.
- **External dependencies**: third-party library versions must be locked.
- **Non-deterministic sources**: environment variables, timestamps, random seeds must be eliminated or fixed.

Without hermeticity, undeclared inputs cause two classes of failure. First, **environment inconsistency**: different developers and CI produce different results from the same source code — "works on my machine" becomes routine, and debugging becomes a nightmare. Second, **cache corruption**: build caches work by keying artifacts on a hash of their inputs; if the build is not hermetic, inputs that affect the output go undeclared and therefore unhashed — the cache key matches but the artifact is stale.

Hermeticity is closely related to **reproducibility** (identical inputs producing byte-for-byte identical outputs). Hermeticity is a necessary condition: without knowing all inputs, you cannot guarantee identical outputs. But hermeticity alone is not sufficient — compilers and linkers can have their own non-deterministic behaviors (e.g., parallelism-dependent instruction ordering). In practice, hermeticity gets you most of the way; full bit-for-bit reproducibility is a stronger goal that requires additional effort.

### Build Caching

The essence of build caching is trading space for time. For each build node, compute a hash of its inputs (source code + dependency artifacts + build configuration). If the cache already contains an artifact for the same hash, retrieve it and skip the build.

**Two layers of cache**:

- **Local cache**: on the developer's machine. Avoids rebuilding the same thing yourself (e.g., switching branches and switching back).
- **Remote cache**: on a shared server. One engineer's build artifacts can be reused by hundreds of others and by CI. For a large project with hundreds of engineers building the same dependencies, the savings are enormous.

Cache correctness depends directly on hermeticity: without it, undeclared inputs go unhashed — the cache key matches but an invisible dependency has changed. The more hermetic your builds, the fewer undeclared inputs, and the higher your cache hit rate.

### When Build Debt Cascades

These properties — dependency graph, hermeticity, caching — are not parallel features. They have strict prerequisite relationships. A correct dependency graph enables incremental and parallel compilation. Hermeticity enables reliable caching and reproducibility. Invest in the foundations first: without a correct graph, incremental compilation produces wrong results; without hermeticity, caches become unreliable.

To see how this plays out, consider how build system limitations compound over time:

1. A large application, grown over a decade, uses a task-based build system. The build cache can only operate at the granularity of the entire build output — there is no per-target caching. A single build takes over an hour.
2. Because the build system lacks a fine-grained dependency graph, it is impossible to determine which tests are affected by a given change. The team has no choice but to run the full test suite on every CI run.
3. To work around the slow builds, parts of the project are split into separate repositories, solely to reduce the build time of the main project.
4. This repo split further complicates the build process, breaks normal dependency management patterns, and prevents automated tooling (e.g., dependency update bots) from working — because the dependency relationships now span multiple repositories and are no longer tracked by a single build system.

What started as a build system limitation cascades into testing inefficiency, CI bottlenecks, and organizational workarounds that create new problems of their own. **Build shortcuts don't save effort — they shift cost, with interest, onto testing, CI, and organizational complexity.**

## Testing: Creating Confidence

Fast builds alone do not create useful feedback. They only tell you that the code can be assembled. To decide whether a change is actually safe, you need tests.

Software defects are inevitable. No matter how experienced the engineer or how rigorous the code review, changes can and will introduce regressions. The question is not whether defects will occur, but how quickly they are caught. **Automated testing** encodes verification logic as code — once written, it can be executed infinitely at near-zero marginal cost, unaffected by human state (fatigue, deadline pressure), and coverage accumulates over time.

### Two Failure Modes

The primary purpose of automated testing is to **build confidence in the safety of changes**. That confidence is a function of two factors, and each has a corresponding failure mode that can destroy the value of the entire test system.

**Insufficient coverage**: if you only test the happy path, you have no confidence about edge cases. Defects in untested paths escape to production.

**Unreliable signals (flakiness)**: if a test has a 5% chance of randomly failing, its signal is noise. When flaky failures accumulate, engineers start habitually re-running CI or ignoring failures. Once that happens, real failures get buried in flaky noise, and the confidence value of the entire test system collapses to zero.

### Test Classification: Scope vs. Size

To make informed trade-offs between confidence and cost, you need a classification system. There are two **orthogonal dimensions**.

**Test scope** describes what you are verifying:

- **Unit test**: verifies the behavior of a single function or class, with external dependencies isolated.
- **Integration test**: verifies the behavior of multiple components working together.
- **End-to-end test**: verifies the entire system from user input to final output.

**Test size** describes what resources are consumed:

- **Small**: uses only CPU and memory. No file system, network, or database access. Fast (milliseconds), highly deterministic.
- **Medium**: may access local resources (file system, local database), but no external network. Moderate speed (seconds to tens of seconds).
- **Large**: may access external systems and network. Slow (minutes), low determinism.

These dimensions are orthogonal — a unit test can be medium (e.g., testing a file parser that needs to read from disk); an integration test can be small (e.g., multiple in-process components collaborating without touching the file system, network, or database). Scope determines what types of defects you can catch. Size determines execution cost and reliability — and therefore CI speed and flaky rate.

### Test ROI and the Pyramid

Tests have three categories of cost:

- **Development cost**: how long does it take to write a test? Unit tests are typically cheapest — single-purpose logic, simple setup. End-to-end tests are most expensive — full environment setup, complex data preparation, complex assertions.
- **Maintenance cost**: when production code changes, how many tests need to be updated? Tests tightly coupled to implementation details (e.g., heavy mocking of internals) require changes on every refactor. Good tests **test behavior, not implementation** — if the public interface is unchanged, the tests should not need to change.
- **Execution cost**: computational resources and time to run the tests. Small tests are nearly free. Large tests may require spinning up databases, container clusters — expensive. At scale, this translates into significant compute costs: hundreds of engineers submitting daily, each triggering CI, multiplied across a large cluster.

When you optimize confidence per unit of cost, the test pyramid emerges naturally:

- **Large base of unit/small tests**: cheap to write, cheap to maintain, fast to run, reliable. They provide broad, fast baseline confidence.
- **Middle layer of integration tests**: moderate cost, verify component interactions that unit tests cannot catch.
- **Small top of end-to-end tests**: expensive on all three cost dimensions, but verify critical user journeys that nothing else can.

This is not dogma — it is the shape that emerges when you maximize confidence per unit of cost. As a mental heuristic:

> **Test ROI ≈ value of defects caught / (development cost + maintenance cost + execution cost)**

High-ROI tests tend to be unit tests covering core business logic — fast to write, low maintenance, fast to run, catching high-impact defects.

Low-ROI tests tend to be end-to-end tests verifying UI styling details — slow to write, frequently broken by UI changes, slow and flaky to run, catching low-impact issues.

**Under limited resources, invest in high-ROI tests first.** In practice, many teams do the opposite — they invest heavily in end-to-end tests first, then get buried by maintenance costs and flaky rates.

## CI: Closing the Loop

We now have a build system and automated tests. That is still not enough. If build and test are not run automatically, consistently, and at the integration boundary, the feedback loop remains incomplete.

### Why Local Verification Fails

Relying on developers to run build and test locally breaks down in practice:

1. **Environment inconsistency**: developers' machines differ. "Works on my machine" is a classic failure mode.
2. **Not enforceable**: under deadline pressure, skipping tests is human nature.
3. **Not scalable**: full test suites take hours. You cannot ask every developer to run them before every commit.
4. **Integration blind spots**: developer A passes locally, developer B passes locally, but A + B merged together fails.

Consider: PR-A deletes a function; PR-B adds a call to that function. Each passes CI individually based on the same trunk commit, but after both merge, the trunk breaks. Local verification — and even per-branch CI — cannot catch this.

CI is a **trusted, automated quality gate** that runs build and test in a standardized environment before code enters the trunk. It eliminates environment inconsistency, makes verification mandatory, and verifies the candidate state of a change merged with the current trunk. For large-scale projects, **pre-merge CI is essential** — if the trunk breaks, it blocks hundreds of engineers, and everyone loses a correct baseline to work from.

### Throughput at Scale

Hundreds of engineers submit changes daily. The CI system must verify each one, but verification takes time, and changes arrive at a high rate. CI engineering is fundamentally about optimizing the trade-off between **throughput** and **correctness**.

**Merge queues** solve the integration blind spot by verifying each change on top of the trunk plus all preceding queued changes, ensuring that what is verified is what will actually enter the trunk. To keep throughput high:

- **Speculative execution**: assume earlier queued changes will pass and start verifying later changes in parallel. If an earlier change fails, later ones are re-verified. This trades compute for throughput.
- **Batch mode**: merge multiple changes together and verify as a batch. If it fails, use bisection to find the offender.

**Task distribution** addresses the raw size of the test suite. A full suite may contain tens or hundreds of thousands of tests. Running them serially takes hours. Sharding by historical execution time equalizes expected wall time across shards, minimizing total wait. Priority scheduling ensures urgent hotfix PRs jump the queue.

**Intelligent test selection** is the most impactful optimization: do not run the full test suite — only run tests affected by the change. Based on dependency graph analysis, a change to module A triggers only the tests that directly or transitively depend on A. This is the same principle as incremental compilation — using the dependency graph to eliminate unnecessary work.

But here is the critical cross-cutting insight: **the precision of test selection is bounded by the quality of the build system.** Missing edges in the dependency graph mean missed tests — defects escape. Unnecessary edges mean extra tests — wasted resources. Without hermeticity, you cannot trust that unchanged inputs produce unchanged outputs. Without these, test selection must be conservative — running more tests than necessary, or running all tests every time. This is why build, test, and CI cannot be optimized independently.

### Governance and Observability

Flaky tests are the number one enemy of CI at scale. Even if each individual test has a very low flaky rate, a test suite with tens of thousands of tests will encounter flaky failures on nearly every CI run — it is a matter of combinatorics. Once flaky failures become routine, real failures get buried in noise.

**Governance strategies**:

1. **Automated detection**: track the historical pass rate of every test. When it drops below a threshold, flag it as flaky.
2. **Automated quarantine**: remove flaky tests from the critical path (they no longer block merges), but continue running them to collect data.
3. **Ownership tracking**: every test must have a clear owner. Flaky tests automatically notify the owner.
4. **Repair SLA**: set a time limit for fixing flaky tests. If the deadline passes without a fix, automatically disable the test.
5. **Root cause analysis**: common causes include race conditions, external service dependencies, state leakage between tests, and resource contention. Categorized statistics help reduce flakiness at the source.

**Observability** makes the feedback loop itself measurable. A CI system needs metrics across four dimensions:

- **Speed**: CI duration p50/p95 (tail latency matters most), queue wait time, slowest tests top-N.
- **Reliability**: flaky rate (overall and per-test), CI success rate (excluding flaky noise), trunk stability.
- **Efficiency**: build and test cache hit rates, compute utilization.
- **Quality**: test coverage trend, defect escape rate — the number of defects that passed CI but were found in production.

Each metric diagnoses a specific failure: CI is slow? Check p95 duration and slowest tests. Flaky rate is rising? Check categorized root causes. Builds are slow? Check cache hit rate. Is the test suite effective? Check defect escape rate.

## Conclusion

In large-scale software development, build, test, and CI all determine the quality of the feedback loop, and therefore all determine iteration speed.

- If build is slow or non-hermetic, feedback is late and unreliable.
- If tests are weak or flaky, feedback is noisy or false.
- If CI is weak, feedback is optional, uneven, and disconnected from real integration.

They form a chain with a clear dependency structure:

1. The **build system** provides the dependency graph and hermeticity — the foundation that everything else rests on.
2. **Automated testing** uses the build system's artifacts to verify behavior and provide confidence in changes.
3. **CI** orchestrates build and test as a mandatory quality gate, and its efficiency is bounded by the quality of the build system and the reliability of the test suite.

Every engineering practice discussed in this post — incremental compilation, build caching, the test pyramid, test selection, merge queues, flaky test governance, observability — exists for the same reason: to make the feedback loop both **fast** and **trustworthy**.

In a small project, you can sometimes compensate for weakness in one layer with extra effort elsewhere. At scale, that stops working. If you want a large team to iterate efficiently, you need all three done well. Missing any one of them eventually shows up as slower iteration, lower confidence, or a broken trunk.
