---
name: 🐛 Bug report
about: Something is broken or behaving unexpectedly in the Agones Headlamp plugin
title: '[Bug] '
labels: kind/bug, needs-triage
assignees: ''
---

<!-- Thank you for taking the time to report this! Please fill out the sections below so we can reproduce and fix the issue quickly. -->

### Describe the bug

<!-- A clear, concise description of what went wrong. -->

### Expected behaviour

<!-- What should have happened instead? -->

### Steps to reproduce

1. Navigate to Headlamp → Agones → …
2. Click / select …
3. Observe …

### Screenshots or recordings

<!-- If applicable, paste screenshots or attach a short screen recording showing the issue. -->

### Environment

| Detail | Value |
|--------|-------|
| Plugin version / commit | |
| Headlamp version | |
| Headlamp mode | Desktop / In-cluster |
| Agones version | |
| Kubernetes version | |
| Browser (in-cluster only) | |

### RBAC context

<!-- Does your user/ServiceAccount have the required permissions? The plugin needs at minimum: -->
<!-- - `get`, `list`, `watch` on `agones.dev` resources (Fleets, GameServers, FleetAutoscalers) -->
<!-- - `create` on `gameserverallocations` (only if using the Allocation dialog) -->

- [ ] I have verified my RBAC permissions are sufficient

### Relevant logs

<!-- Paste any browser console errors or Headlamp backend logs. Use a <details> block for long output. -->

<details>
<summary>Console / logs</summary>

```
(paste logs here)
```

</details>

### Additional context

<!-- Anything else? Sample Fleet/GameServer YAML, Agones feature flags, cluster setup details, etc. -->
