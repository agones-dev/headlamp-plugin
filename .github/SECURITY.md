# Security policy

## Scope

This repository contains the **Agones Headlamp plugin** — a UI extension for [Headlamp](https://headlamp.dev) that reads and displays Agones custom resources. It does not run game servers or implement the Agones control plane.

Security of your deployment still depends on:

- Kubernetes RBAC for the Headlamp user or ServiceAccount
- Agones installation and configuration ([Agones docs](https://agones.dev/site/docs/))
- Headlamp deployment mode (desktop vs in-cluster) and cluster access

## Reporting a vulnerability

**Do not report security vulnerabilities through public GitHub issues or pull requests.**

### This plugin

If you believe you have found a security issue **in this plugin repository** (e.g. unsafe handling of cluster data in the UI, dependency vulnerability with exploitable impact in context of the plugin):

1. Open a [private vulnerability report](https://github.com/manumathon/headlamp-plugin/security/advisories/new) for this repository.
2. Include a clear description, affected version or commit, steps to reproduce, and suspected impact.

Maintainers will acknowledge as soon as practical and work on validation and fixes.

### Agones or Headlamp core

Issues in **Agones** itself should be reported via the [Agones security policy](https://github.com/googleforgames/agones/blob/main/.github/SECURITY.md) (or the current upstream Agones repository security page).

Issues in **Headlamp** should be reported to [kubernetes-sigs/headlamp](https://github.com/kubernetes-sigs/headlamp/security).

## Supported versions

Security fixes are delivered through normal releases and tags on this repository. Prefer the latest release and keep npm dependencies updated (`npm audit`).
