# Contributing to the Agones Headlamp plugin

Thank you for helping improve this plugin. Contributions via issues and pull requests are welcome.

## Before you start

- Read the [README](README.md) for prerequisites (Headlamp + Agones in a cluster).
- For **bugs** and **features**, use the [GitHub issue templates](.github/ISSUE_TEMPLATE/).
- For **security**, see [SECURITY.md](.github/SECURITY.md) — do not file public issues for vulnerabilities.

## Development setup

```bash
git clone <your-fork-url>
cd headlamp-plugin
npm install
npm run start
```

`npm run start` runs the plugin in development mode against your Headlamp instance. See the [Headlamp plugin getting started guide](https://headlamp.dev/docs/latest/development/plugins/getting-started).

## Commands

| Command | Purpose |
|---------|---------|
| `npm run start` | Dev mode |
| `npm run build` | Production build → `dist/` |
| `npm run tsc` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run lint-fix` | ESLint with auto-fix |
| `npm run format` | Prettier write |
| `npm run format -- --check` | Prettier check (CI) |
| `npm run test` | Vitest unit tests |
| `npm run package` | Package for distribution |

Run the same checks as CI before opening a PR:

```bash
npm ci
npm run build && npm run tsc && npm run lint && npm run format -- --check && npm run test
```

## Pull requests

- Use the [pull request template](.github/pull_request_template.md).
- Keep changes focused; link related issues.
- Add or update tests for non-trivial logic (see `src/**/*.test.ts`).
- Include screenshots for UI changes when possible.

## Project layout

```text
src/
  index.tsx           # Routes and sidebar registration
  resources/          # KubeObject classes per Agones CRD
  views/              # List and detail pages
  components/         # Shared UI (chips, tables, dialogs)
  utils/              # Pure helpers (e.g. allocation body builder)
  mapView.tsx         # Map graph sources
```

## Agones context

This plugin surfaces [Agones](https://agones.dev) CRDs in Headlamp. Useful references:

- [Agones CRD API](https://agones.dev/site/docs/reference/agones_crd_api_reference/)
- [GameServer lifecycle](https://agones.dev/site/docs/reference/gameserver/)
- [Official Headlamp plugins](https://github.com/headlamp-k8s/plugins) (KEDA, Flux, etc.) for patterns

## License

By contributing, you agree that your contributions are licensed under the [Apache License 2.0](LICENSE).
