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

import { ResourceListView } from '@kinvolk/headlamp-plugin/lib/components/common';
import React from 'react';
import { FleetLink } from '../../components/FleetLink';
import { StateChip } from '../../components/StateChip';
import { GameServer } from '../../resources/gameserver';

export function GameServerList() {
  const [gameServers] = GameServer.useList();

  return (
    <ResourceListView
      title="Game Servers"
      data={gameServers}
      columns={[
        'name',
        'namespace',
        {
          id: 'fleet',
          label: 'Fleet',
          render: (gs: GameServer) =>
            gs.fleet ? <FleetLink namespace={gs.metadata.namespace} name={gs.fleet} /> : '—',
          getValue: (gs: GameServer) => gs.fleet || '',
        },
        {
          id: 'state',
          label: 'State',
          render: (gs: GameServer) => <StateChip state={gs.state} />,
          getValue: (gs: GameServer) => gs.state,
        },
        {
          id: 'address',
          label: 'Address',
          getValue: (gs: GameServer) => gs.address || '—',
        },
        {
          id: 'ports',
          label: 'Ports',
          getValue: (gs: GameServer) => gs.ports || '—',
        },
        {
          id: 'node',
          label: 'Node',
          getValue: (gs: GameServer) => gs.nodeName || '—',
        },
      ]}
    />
  );
}
