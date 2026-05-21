---
name: Bug report
about: Report a problem with the Agones Headlamp plugin
title: ''
labels: kind/bug
assignees: ''
---

<!-- Please fill out as much as you can. Incomplete reports are harder to triage. -->

**Describe the bug**

A clear description of what went wrong in the plugin UI.

**What you expected**

What should have happened instead.

**Steps to reproduce**

1. Open Headlamp → Agones → …
2. …
3. See error / wrong data

**Screenshots or recordings**

If applicable, add screenshots or a short recording.

**Environment**

- Plugin version / commit (if known):
- Headlamp version (desktop or in-cluster):
- Agones version:
- Kubernetes version (`kubectl version`):
- Browser (if using Headlamp in a browser):

**RBAC / permissions**

Does your user/ServiceAccount have `get`, `list`, `watch` on `agones.dev` resources (and `create` on `gameserverallocations` if using allocation)?

**Logs**

Any relevant browser console errors or Headlamp logs.

**Additional context**

Anything else that might help (sample Fleet/GameServer YAML, feature flags enabled in Agones, etc.).
