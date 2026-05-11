# Agones Headlamp Plugin

> ⚠️ **SUPER ALPHA — Early Stages**
> This plugin is in very early development. Expect breaking changes, missing features, and rough edges. It is currently only available via manual installation.

A [Headlamp](https://github.com/kubernetes-sigs/headlamp) plugin to visualise [Agones](https://agones.dev) resources and workflows directly in your Kubernetes UI.

[Agones](https://agones.dev) is an open-source, batteries-included, multiplayer dedicated game server scaling and orchestration platform built on Kubernetes.

## Features

_We have these things at the moment. I wouldn't say that they are done **well**. They definitely need review and improvement_ 😄

- **Overview** — At-a-glance summary of your Agones resources across the cluster.
- **Fleets** — List and detail views for Agones `Fleet` resources, including replica status and scaling controls.
- **Game Servers** — List and detail views for individual `GameServer` resources, with state chips and pod previews.
- **Fleet Autoscalers** — List and detail views for `FleetAutoscaler` resources, including autoscaler status.
- **Map View** — Visual graph showing relationships between Fleets, Game Servers, and Pods.
- **Allocations** — Allocate game servers directly from the UI via an allocation dialog.

## Prerequisites

- [Headlamp](https://headlamp.dev) installed and running (desktop app or in-cluster).
- [Agones](https://agones.dev/site/docs/installation/) installed in your Kubernetes cluster.

## Installation (Manual)

This plugin is not yet published to any registry. To install it manually:

1. **Build the plugin:**

   ```bash
   npm install
   npm run build
   ```

2. **Copy the built plugin** to your Headlamp plugins directory.

   For the Headlamp desktop app, the plugins directory is typically:
   - **Linux:** `~/.config/Headlamp/plugins/`
   - **macOS:** `~/Library/Application Support/Headlamp/plugins/`
   - **Windows:** `%APPDATA%\Headlamp\plugins\`

   ```bash
   mkdir -p ~/.config/Headlamp/plugins/agones-plugin
   cp -r dist/* ~/.config/Headlamp/plugins/agones-plugin/
   ```

3. **Restart Headlamp.** The **Agones** section will appear in the sidebar.

## Development

This plugin follows the standard Headlamp plugin development workflow. See the [Headlamp Plugin Getting Started guide](https://headlamp.dev/docs/latest/development/plugins/getting-started) for full instructions.

## Contributing

Contributions are welcome! Please open issues or pull requests.
> ⚠️🤣⚠️🤣⚠️🤣  
> NO BUT SERIOUSLY, WE WERE JUST PLAYING WHEN WE INITIALLY MAKING THIS. IT NEEDS SOLID IMPROVEMENT.  
> ⚠️🤣⚠️🤣⚠️🤣

## License

[Apache 2.0](LICENSE)
