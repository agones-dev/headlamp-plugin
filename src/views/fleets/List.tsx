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

import { Link, SectionBox } from '@kinvolk/headlamp-plugin/lib/components/common';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { ReplicaBar } from '../../components/ReplicaBar';
import { ReplicasControl } from '../../components/ReplicasControl';
import { ROW_SX, SELECTED_SX } from '../../components/tableStyles';
import { Fleet } from '../../resources/fleet';
import { GameServersPreview } from './GameServersPreview';

export function FleetList() {
  const [fleets] = Fleet.useList();
  const [selected, setSelected] = useState<Fleet | null>(null);

  const toggle = (fleet: Fleet) =>
    setSelected(prev => (prev?.metadata.uid === fleet.metadata.uid ? null : fleet));

  return (
    <SectionBox title="Fleets">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Namespace</TableCell>
            <TableCell>Scheduling</TableCell>
            <TableCell>Desired</TableCell>
            <TableCell>Replica Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!fleets ? (
            <TableRow>
              <TableCell colSpan={5}>
                <Typography variant="body2" color="text.secondary">
                  Loading…
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            fleets.map(fleet => (
              <TableRow
                key={fleet.metadata.uid}
                sx={selected?.metadata.uid === fleet.metadata.uid ? SELECTED_SX : ROW_SX}
                onClick={() => toggle(fleet)}
              >
                <TableCell>
                  <Link kubeObject={fleet}>{fleet.metadata.name}</Link>
                </TableCell>
                <TableCell>{fleet.metadata.namespace}</TableCell>
                <TableCell>{fleet.scheduling}</TableCell>
                <TableCell onClick={e => e.stopPropagation()}>
                  <ReplicasControl fleet={fleet} />
                </TableCell>
                <TableCell>
                  <ReplicaBar
                    desired={fleet.desiredReplicas}
                    ready={fleet.readyReplicas}
                    allocated={fleet.allocatedReplicas}
                    reserved={fleet.reservedReplicas}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {selected && <GameServersPreview fleet={selected} />}
    </SectionBox>
  );
}
