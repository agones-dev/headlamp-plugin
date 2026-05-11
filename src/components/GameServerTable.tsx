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

import { Link } from '@kinvolk/headlamp-plugin/lib/components/common';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import React from 'react';
import { GameServer } from '../resources/gameserver';
import { StateChip } from './StateChip';

interface GameServerTableProps {
  gameServers: GameServer[];
}

export function GameServerTable({ gameServers }: GameServerTableProps) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>State</TableCell>
          <TableCell>Address</TableCell>
          <TableCell>Ports</TableCell>
          <TableCell>Node</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {gameServers.map(gs => (
          <TableRow key={gs.metadata.uid}>
            <TableCell><Link kubeObject={gs}>{gs.metadata.name}</Link></TableCell>
            <TableCell><StateChip state={gs.state} /></TableCell>
            <TableCell>{gs.address || '—'}</TableCell>
            <TableCell>{gs.ports  || '—'}</TableCell>
            <TableCell>{gs.nodeName || '—'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}