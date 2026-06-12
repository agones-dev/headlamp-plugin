# Contributing to the Agones Headlamp Plugin

Thank you for your interest in improving this plugin! Whether it's a bug fix, feature, docs improvement, or test — every contribution helps. 🙌

## Before you start

1. Read the [README](README.md) for an overview of the plugin and prerequisites.
2. Check [existing issues](https://github.com/agones-dev/headlamp-plugin/issues) to avoid duplicating work.
3. For **bugs** and **features**, use the [GitHub issue templates](.github/ISSUE_TEMPLATE/).
4. For **security vulnerabilities**, see [SECURITY.md](.github/SECURITY.md) — please do **not** file public issues.

## Development setup

```bash
# Clone your fork
git clone <your-fork-url>
cd headlamp-plugin

# Install dependencies
npm install

# Start the plugin in dev mode (hot-reload against a running Headlamp instance)
npm run start
```

> **Tip:** You need [Headlamp](https://headlamp.dev) running and connected to a cluster with [Agones](https://agones.dev/site/docs/installation/) installed to see the plugin in action.

## Available commands

| Command | Purpose |
|---------|---------|
| `npm run start` | Development mode with hot reload |
| `npm run build` | Production build → `dist/` |
| `npm run tsc` | TypeScript type checking |
| `npm run lint` | ESLint static analysis |
| `npm run lint-fix` | ESLint with auto-fix |
| `npm run format` | Prettier — format all files |
| `npm run format -- --check` | Prettier — check only (used in CI) |
| `npm run test` | Run Vitest unit tests |
| `npm run package` | Package plugin for distribution |

## Pre-submit checklist

Run the full CI suite locally before pushing:

```bash
npm run build
npm run tsc
npm run lint
npm run format -- --check
npm run test
```

All five must pass. The CI workflow enforces these on every pull request.

## Commit messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) style:

```
feat: add delete action for GameServer detail page
fix: hide sidebar when Agones CRDs are not installed
ci: add GitHub Actions workflow for PR checks
docs: add RBAC ClusterRole example to README
chore: run prettier format on all source files
```

## Pull requests

- Use the [pull request template](.github/pull_request_template.md).
- Keep changes focused — one logical change per PR.
- Link related issues using `Fixes #123`.
- Add or update tests for non-trivial logic (see `src/**/*.test.ts`).
- Include before/after screenshots for any UI changes.

## Developer Certificate of Origin (DCO)

All contributions to this project must be signed off in accordance with the [Developer Certificate of Origin (DCO)](https://developercertificate.org/). This is enforced via the DCO GitHub App on all pull requests.

Signing off certifies that you have the right to submit the code you are contributing and that you agree to the DCO terms. To sign off a commit, use the `-s` or `--signoff` flag with `git commit`:

```bash
git commit -s -m "Your commit message"
```

This appends a `Signed-off-by` line to your commit message using your configured git name and email:

```
Signed-off-by: Your Name <your.email@example.com>
```

Make sure your `git user.name` and `user.email` are set correctly:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

If you forgot to sign off on previous commits in a pull request, you can amend them:

- For the most recent commit: `git commit --amend --signoff`
- For multiple commits: `git rebase --signoff HEAD~N` (where N is the number of commits to sign)

Then force-push your branch to update the pull request.

## AI Usage Policy

This project follows the [Agones AI Usage Policy](https://github.com/agones-dev/agones/blob/main/CONTRIBUTING.md).

Using AI tools to help write your PR is acceptable, **but as the author, you are responsible for understanding every change**.

- If you used AI tools in preparing your PR, you must disclose this in the PR description.
- Listing AI tooling as a co-author, co-signing commits using an AI tool, or using the `assisted-by`, `co-developed` or similar commit trailer is not allowed.
- Large AI-generated PRs and AI-generated commit messages are not allowed.
- **Do not leave the first review of AI-generated changes to the reviewers**. Verify the changes (code review, testing, etc.) before submitting your PR.
- **When responding to review comments, you must do so without relying on AI tools**. Reviewers want to engage directly with you, not with generated responses.

## Project layout

```text
src/
├── index.tsx                    # Plugin entry — routes, sidebar, registration
├── resources/                   # KubeObject classes for each Agones CRD
│   ├── gameserver.ts
│   ├── fleet.ts
│   ├── fleetautoscaler.ts
│   └── gameserverallocation.ts
├── views/                       # Page components (list + detail per resource)
│   ├── overview/
│   ├── fleets/
│   ├── gameservers/
│   ├── fleetautoscalers/
│   └── map/
├── components/                  # Shared UI (StateChip, ReplicaBar, dialogs)
├── utils/                       # Pure helper functions
└── mapView.tsx                  # Map graph source aggregator
```

## Testing

- **Unit tests** live next to the code they test: `src/utils/buildAllocationBody.test.ts`, `src/components/StateChip.test.ts`.
- We use [Vitest](https://vitest.dev/) as the test runner (provided by `@kinvolk/headlamp-plugin`).
- Aim to test pure logic (utilities, resource model getters) and component rendering. API calls to the cluster are not expected in unit tests.

## Agones context

This plugin surfaces [Agones](https://agones.dev) custom resources in the Headlamp Kubernetes UI. Useful references for contributors:

- [Agones CRD API reference](https://agones.dev/site/docs/reference/agones_crd_api_reference/)
- [GameServer lifecycle states](https://agones.dev/site/docs/reference/gameserver/)
- [Fleet & autoscaler docs](https://agones.dev/site/docs/getting-started/create-fleet/)
- [Official Headlamp plugins](https://github.com/headlamp-k8s/plugins) — KEDA, Flux, Strimzi for patterns

## License

By contributing, you agree that your contributions are licensed under the [Apache License 2.0](LICENSE).
