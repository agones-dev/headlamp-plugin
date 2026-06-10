# Security Policy

## Scope

This repository contains the **Agones Headlamp plugin** — a UI extension for [Headlamp](https://headlamp.dev) that visualises [Agones](https://agones.dev) custom resources inside the Headlamp Kubernetes dashboard. The plugin runs entirely in the browser and communicates with the Kubernetes API through the Headlamp backend proxy.

This plugin does **not**:
- Run or manage game server processes
- Implement the Agones control plane
- Store credentials or secrets

Security of your deployment also depends on:
- **Kubernetes RBAC** configuration for the Headlamp user or ServiceAccount
- **Agones** installation and configuration ([docs](https://agones.dev/site/docs/))
- **Headlamp** deployment mode (desktop vs in-cluster) and cluster access controls

## Supported versions

| Version | Supported |
|---------|-----------|
| Latest release / `main` | ✅ |
| Older releases | Best-effort |

Security fixes are delivered through new releases. Keep your dependencies updated by running `npm audit` regularly.

## Reporting a vulnerability

> **Do not report security vulnerabilities through public GitHub issues, discussions, or pull requests.**

### For this plugin

If you discover a security issue in this plugin (e.g. unsafe handling of cluster data, XSS in rendered UI, or a dependency vulnerability with exploitable impact):

1. Open a [**private vulnerability report**](https://github.com/agones-dev/headlamp-plugin/security/advisories/new).
2. Include:
   - A clear description of the vulnerability
   - Affected version or commit SHA
   - Steps to reproduce
   - Suspected impact and severity

**Response timeline:** Maintainers will acknowledge receipt within **3 business days** and provide an initial assessment within **10 business days**.

### For Agones or Headlamp core

| Project | Report to |
|---------|-----------|
| Agones | [googleforgames/agones security](https://github.com/googleforgames/agones/security/advisories/new) |
| Headlamp | [kubernetes-sigs/headlamp security](https://github.com/kubernetes-sigs/headlamp/security) |

## Acknowledgements

We appreciate responsible disclosure and will credit reporters in release notes (unless they prefer to remain anonymous).
