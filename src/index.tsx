/*
 * Copyright Contributors to Agones a Series of LF Projects, LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  registerMapSource,
  registerRoute,
  registerSidebarEntry,
} from '@kinvolk/headlamp-plugin/lib';
import { withInstallCheck } from './components/AgonesInstallCheck';
import { agonesMapSource } from './mapView';
import { FleetAutoscalerDetail } from './views/fleetautoscalers/Detail';
import { FleetAutoscalerList } from './views/fleetautoscalers/List';
import { FleetDetail } from './views/fleets/Detail';
import { FleetList } from './views/fleets/List';
import { GameServerDetail } from './views/gameservers/Detail';
import { GameServerList } from './views/gameservers/List';
import { AgonesOverview } from './views/overview/Overview';

// ─── Map ─────────────────────────────────────────────────────────────────────

registerMapSource(agonesMapSource);

// ─── Sidebar ─────────────────────────────────────────────────────────────────

registerSidebarEntry({
  parent: null,
  name: 'agones',
  label: 'Agones',
  url: '/agones',
  icon: 'mdi:gamepad-square',
});
registerSidebarEntry({
  parent: 'agones',
  name: 'agones-overview',
  label: 'Overview',
  url: '/agones',
});
registerSidebarEntry({
  parent: 'agones',
  name: 'agones-fleets',
  label: 'Fleets',
  url: '/agones/fleets',
});
registerSidebarEntry({
  parent: 'agones',
  name: 'agones-gameservers',
  label: 'Game Servers',
  url: '/agones/gameservers',
});
registerSidebarEntry({
  parent: 'agones',
  name: 'agones-fleetautoscalers',
  label: 'Autoscalers',
  url: '/agones/fleetautoscalers',
});

// ─── Routes ──────────────────────────────────────────────────────────────────

registerRoute({
  path: '/agones',
  sidebar: 'agones-overview',
  name: 'agones-overview',
  exact: true,
  component: withInstallCheck(AgonesOverview),
});

registerRoute({
  path: '/agones/fleets',
  sidebar: 'agones-fleets',
  name: 'agones-fleets',
  exact: true,
  component: withInstallCheck(FleetList),
});
registerRoute({
  path: '/agones/fleets/:namespace/:name',
  sidebar: 'agones-fleets',
  name: 'agones-fleet',
  component: withInstallCheck(FleetDetail),
});

registerRoute({
  path: '/agones/gameservers',
  sidebar: 'agones-gameservers',
  name: 'agones-gameservers',
  exact: true,
  component: withInstallCheck(GameServerList),
});
registerRoute({
  path: '/agones/gameservers/:namespace/:name',
  sidebar: 'agones-gameservers',
  name: 'agones-gameserver',
  component: withInstallCheck(GameServerDetail),
});

registerRoute({
  path: '/agones/fleetautoscalers',
  sidebar: 'agones-fleetautoscalers',
  name: 'agones-fleetautoscalers',
  exact: true,
  component: withInstallCheck(FleetAutoscalerList),
});
registerRoute({
  path: '/agones/fleetautoscalers/:namespace/:name',
  sidebar: 'agones-fleetautoscalers',
  name: 'agones-fleetautoscaler',
  component: withInstallCheck(FleetAutoscalerDetail),
});
