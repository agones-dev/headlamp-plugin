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

import { Link, SimpleTable } from '@kinvolk/headlamp-plugin/lib/components/common';
import React from 'react';
import { GameServer } from '../resources/gameserver';
import { StateChip } from './StateChip';

interface GameServerTableProps {
  gameServers: GameServer[];
}

export function GameServerTable({ gameServers }: GameServerTableProps) {
  return (
    <SimpleTable
      columns={[
        {
          label: 'Name',
          getter: (gs: GameServer) => <Link kubeObject={gs}>{gs.metadata.name}</Link>,
        },
        {
          label: 'State',
          getter: (gs: GameServer) => <StateChip state={gs.state} />,
        },
        {
          label: 'Address',
          getter: (gs: GameServer) => gs.address || '—',
        },
        {
          label: 'Ports',
          getter: (gs: GameServer) => gs.ports || '—',
        },
        {
          label: 'Node',
          getter: (gs: GameServer) => gs.nodeName || '—',
        },
      ]}
      data={gameServers}
      emptyMessage="No game servers found."
    />
  );
}
