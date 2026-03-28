/*
 * Copyright 2025 The Kubernetes Authors
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

import { Link, SectionBox } from '@kinvolk/headlamp-plugin/lib/components/common';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { FleetLink } from '../../components/FleetLink';
import { StateChip } from '../../components/StateChip';
import { ROW_SX, SELECTED_SX } from '../../components/tableStyles';
import { GameServer } from '../../resources/gameserver';
import { PodPreview } from './PodPreview';

export function GameServerList() {
  const [gameServers] = GameServer.useList();
  const [selected, setSelected] = useState<GameServer | null>(null);

  const toggle = (gs: GameServer) =>
    setSelected(prev => prev?.metadata.uid === gs.metadata.uid ? null : gs);

  return (
    <SectionBox title="Game Servers">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Namespace</TableCell>
            <TableCell>Fleet</TableCell>
            <TableCell>State</TableCell>
            <TableCell>Address</TableCell>
            <TableCell>Ports</TableCell>
            <TableCell>Node</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!gameServers ? (
            <TableRow><TableCell colSpan={7}><Typography variant="body2" color="text.secondary">Loading…</Typography></TableCell></TableRow>
          ) : gameServers.map(gs => {
            return (
              <TableRow
                key={gs.metadata.uid}
                sx={selected?.metadata.uid === gs.metadata.uid ? SELECTED_SX : ROW_SX}
                onClick={() => toggle(gs)}
              >
                <TableCell><Link kubeObject={gs}>{gs.metadata.name}</Link></TableCell>
                <TableCell>{gs.metadata.namespace}</TableCell>
                <TableCell>
                  {gs.fleet
                    ? <FleetLink namespace={gs.metadata.namespace} name={gs.fleet} onClick={e => e.stopPropagation()} />
                    : '—'}
                </TableCell>
                <TableCell><StateChip state={gs.state} /></TableCell>
                <TableCell>{gs.address || '—'}</TableCell>
                <TableCell>{gs.ports || '—'}</TableCell>
                <TableCell>{gs.nodeName || '—'}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {selected && <PodPreview gameServer={selected} />}
    </SectionBox>
  );
}