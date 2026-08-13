# Agones Headlamp Plugin

The **Agones Headlamp Plugin** integrates [Agones](https://agones.dev) game server orchestration directly into [Headlamp](https://headlamp.dev). It gives cluster operators and game backend engineers a visual dashboard to inspect fleets, game servers, and autoscalers — without dropping into `kubectl` to decode custom resource YAML.

Agones is an open-source, batteries-included, multiplayer dedicated game server scaling and orchestration platform built on Kubernetes. This plugin translates the Agones custom resources (`Fleet`, `GameServer`, `FleetAutoscaler`, `GameServerAllocation`) into interactive Headlamp UI views.

**IMPORTANT:** This plugin is in alpha state!

## Key Features

- **Overview Dashboard**: At-a-glance summary of all Agones resources across the cluster — game server state counts, fleet readiness, and autoscaler activity in one place.
- **Fleet Management**: List and detail views for `Fleet` resources, including replica status bars, scheduling strategy, and rollout configuration.
- **Game Server Views**: Per-server detail pages with colour-coded lifecycle state chips (Ready, Allocated, Unhealthy, …), address and port tables, counters and lists, and pod previews.
- **Fleet Autoscalers**: Inspect `FleetAutoscaler` policies (Buffer, Webhook, Counter, List, Schedule, Chain) with a plain-English explainer of the current scaling status.
- **Allocations from the UI**: Create `GameServerAllocation` requests directly from Headlamp via a guided dialog — selectors, scheduling, counters, lists, and priorities included.
- **Map View**: Visual graph showing the relationships between Fleets, GameServers, and their backing Pods.
- **Agones Detection Guard**: On clusters without Agones installed, the plugin shows a friendly install banner instead of empty views.
- **Allocated-Session Protection**: A prominent warning banner on `Allocated` game servers reminds operators that live player sessions may be connected before they edit or delete anything.

---

## Overview Dashboard

The Overview page aggregates the state of your entire Agones installation: total game servers grouped by lifecycle state, fleet replica health, and autoscaler summaries.

### Capabilities:

- Game server counts ordered by lifecycle stage (`PortAllocation` → `Creating` → `Starting` → `Ready` → `Allocated` → …).
- Quick navigation into any Fleet, GameServer, or FleetAutoscaler.

---

## Fleets & Game Servers

Fleets are the heart of Agones — they keep a warm pool of ready game servers available for allocation. The plugin provides full lifecycle visibility for both fleets and the individual game servers they manage.

### Capabilities:

- Fleet detail view with replica status (ready / allocated / reserved), scheduling strategy, and the game servers belonging to the fleet.
- GameServer detail view with state chip, node address and ports, counters and lists, eviction settings, and a preview of the backing pod.
- The `agones.dev/fleet` label links each game server back to its owning fleet.

---

## Fleet Autoscalers

The FleetAutoscaler views decode every Agones autoscaling policy type into readable tables — no more mentally parsing nested YAML.

### Capabilities:

- Buffer, Webhook, Counter, List, Schedule, and Chain policies rendered with their effective parameters.
- Live status: current vs. desired replicas, whether the autoscaler is able to scale, and whether scaling is limited.

---

## Game Server Allocations

Allocating a game server for a match normally requires crafting a `GameServerAllocation` manifest by hand. The plugin builds it for you.

### Capabilities:

- Guided allocation dialog with label selectors, game server state, scheduling strategy, counter/list filters, mutations, and priorities.
- Validation-friendly: empty or malformed entries are dropped instead of producing broken manifests.

---

## Demo

A visual walkthrough of the plugin is available in the repository's pull requests and the [Agones Headlamp Plugin repository](https://github.com/agones-dev/headlamp-plugin).

## Prerequisites & Agones Setup

To use this plugin you need Agones installed in your Kubernetes cluster.

### 1. Verify the Agones controllers

```bash
kubectl get pods -n agones-system
```

### 2. Check the Agones CRDs

```bash
kubectl api-resources --api-group=agones.dev
```

If Agones is not installed, follow the [official installation guide](https://agones.dev/site/docs/installation/install-agones/) — the plugin will point you there too.

---

## Installation & Development

### Installing via Headlamp Catalog (Desktop)

1. Open your Headlamp desktop application.
2. Navigate to the **Plugin Catalog** from the main navigation.
3. Search for **Agones** and click **Install**.
4. Reload the UI to activate the **Agones** section in the sidebar.

### Local Development Setup

To test or contribute to the Agones plugin locally:

```bash
# Clone the plugin repository
git clone https://github.com/agones-dev/headlamp-plugin.git
cd headlamp-plugin

# Install npm dependencies
npm ci

# Run unit tests with Vitest
npm run test

# Start the Headlamp development server with hot-reloading enabled
npm run start
```

See [CONTRIBUTING.md](https://github.com/agones-dev/headlamp-plugin/blob/main/CONTRIBUTING.md) for the full development workflow.

---

## References & Official Links

- [Agones Official Website & Documentation](https://agones.dev)
- [Agones GitHub Repository](https://github.com/agones-dev/agones)
- [Agones Headlamp Plugin Repository](https://github.com/agones-dev/headlamp-plugin)
- [Headlamp Documentation](https://headlamp.dev)
