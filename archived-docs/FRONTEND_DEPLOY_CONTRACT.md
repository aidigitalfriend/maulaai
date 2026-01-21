# Frontend Deploy Contract

## 1. Purpose

This document defines the non-negotiable rules for deploying the Next.js frontend for `maula.ai`.

Goal: **Prevent broken or partial frontend builds from ever reaching users**, while keeping the last known-good version live until a new build is fully validated.

This is a behavioral contract, not an implementation guide. Shell commands, tools, and CI details are intentionally out of scope.

---

## 2. Invariants (Must Always Hold)

The following must be true for every frontend deploy, regardless of tooling:

1. **Live assets are never modified during build**
   - The assets and files used by the currently running frontend remain untouched while a new build is being created.

2. **Frontend is never restarted on a failed build**
   - If the build or validation fails, the running frontend process continues serving the previous build without interruption.

3. **Failed deploy leaves the system in the exact pre-deploy state**
   - From a user’s perspective, nothing changes when a deploy fails.
   - From a filesystem/process perspective, the live build and running process are identical to the state before the deploy started.

4. **Deploy failures are visible and noisy**
   - Any failure in build or validation must:
     - Cause the deploy to exit with a non-zero status, and
     - Produce a clear, human-readable error message in logs/console.

5. **Live frontend always has a complete, self-consistent build**
   - The version currently being served must always have a full `.next` (or equivalent) and all required static assets on disk.

---

## 3. Phases of a Frontend Deploy

Every frontend deploy is conceptually divided into four phases.

### 3.1 Pre-deploy State

Before a deploy starts:

- A known-good frontend build is live and serving users.
- All assets required by that build exist fully on disk.
- The running frontend process does not depend on any files that will be modified during the upcoming build.

### 3.2 Build (Isolated)

During the build phase:

- A new frontend build is produced **in isolation**, in a designated **staging build directory**.
- The live build directory and its assets are not read from, written to, or deleted.
- It is acceptable and expected for the build to fail here; failures must not affect the live system.

### 3.3 Promotion (Atomic)

Promotion only occurs **after** the build and validation have succeeded.

Promotion must:

- Replace the live build with the newly built one in a way that is effectively atomic (e.g., directory swap, symlink switch, or equivalent).
- Only after the new build is in place may the frontend process be restarted or reloaded to pick up the new assets.

There must be no window where the frontend process is running against a partially-promoted build.

### 3.4 Failure Handling

If any step in the build or validation fails:

- **No promotion occurs.**
- **No frontend restart occurs.**
- The live build directory and process remain exactly as they were before the deploy started.
- The deploy is marked as failed via exit code and logs.

---

## 4. Definition of "Successful Deploy"

A frontend deploy is considered **successful** only if **all** of the following are true:

1. **Build success**
   - The frontend build completes in the staging directory without errors.

2. **Artifacts present**
   - All required runtime artifacts for the new build exist in the staging area (e.g., compiled server output and static assets).

3. **Minimal runtime smoke-check passes**
   - At least one minimal health check against the new build passes (e.g., HTTP request against a key route behind the same reverse proxy used in production).
   - This check must be defined so that a clearly broken app (e.g., missing assets, server errors) causes the check to fail.

4. **Atomic promotion + restart**
   - The staging build is promoted to live in an atomic manner.
   - The frontend process is restarted or reloaded only **after** promotion is complete.

Only when all of the above conditions are true may the deploy be declared successful.

---

## 5. Definition of "Failed Deploy"

A frontend deploy is considered **failed** if **any** of the following occur:

- The build in the staging directory fails.
- Required artifacts are missing or invalid.
- The defined minimal runtime smoke-check fails.
- Promotion cannot be completed safely.

On a failed deploy:

- No changes are made to the live build or running frontend process.
- The deploy process exits with a non-zero status.
- Logs must clearly indicate that the deploy did not affect production.

---

## 6. Non-goals (Explicitly Out of Scope)

This contract does **not** define:

- Specific shell commands, flags, or scripts (e.g., contents of `deploy.sh`).
- CI/CD tooling choices or pipeline structure.
- Rollback design and procedures.
- Performance optimizations or caching strategies.

Those decisions must **respect** this contract but are specified elsewhere.

---

## 7. Compliance

Any future changes to deployment tooling, infrastructure, or hosting must be validated against this contract. If a change cannot satisfy these rules, the contract must be updated explicitly and intentionally, not bypassed implicitly.
