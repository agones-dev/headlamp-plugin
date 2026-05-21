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
import React, { useMemo } from 'react';
import { GameServerSetPhaseChip } from '../../components/GameServerSetPhaseChip';
import { ReplicaBar } from '../../components/ReplicaBar';
import { Fleet } from '../../resources/fleet';
import { GameServerSet } from '../../resources/gameserverset';
import {
  filterGameServerSetsByFleet,
  getGameServerSetPhase,
} from '../../utils/gameServerSetHelpers';

export function GameServerSetsSection({ fleet }: { fleet: Fleet }) {
  const [allSets] = GameServerSet.useList({ namespace: fleet.metadata.namespace });

  const sets = useMemo(() => {
    if (!allSets) return null;
    return filterGameServerSetsByFleet(allSets, fleet);
  }, [allSets, fleet]);

  if (!sets) return null;
  if (sets.length === 0) {
    return (
      <SectionBox title="Game Server Sets">
        <span style={{ color: 'var(--mui-palette-text-secondary)' }}>No GameServerSets found.</span>
      </SectionBox>
    );
  }

  return (
    <SectionBox title="Game Server Sets">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Phase</TableCell>
            <TableCell>Desired</TableCell>
            <TableCell>Replica Status</TableCell>
            <TableCell>Shutdown</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sets.map(gss => (
            <TableRow key={gss.metadata.uid}>
              <TableCell><Link kubeObject={gss}>{gss.metadata.name}</Link></TableCell>
              <TableCell>
                <GameServerSetPhaseChip
                  phase={getGameServerSetPhase(gss, fleet, sets)}
                />
              </TableCell>
              <TableCell>{gss.desiredReplicas}</TableCell>
              <TableCell>
                <ReplicaBar
                  desired={gss.desiredReplicas}
                  ready={gss.readyReplicas}
                  allocated={gss.allocatedReplicas}
                  reserved={gss.reservedReplicas}
                />
              </TableCell>
              <TableCell>{gss.shutdownReplicas || '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SectionBox>
  );
}
