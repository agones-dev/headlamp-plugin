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
import React, { useMemo } from 'react';
import { FleetLink } from '../../components/FleetLink';
import { GameServerSetPhaseChip } from '../../components/GameServerSetPhaseChip';
import { ReplicaBar } from '../../components/ReplicaBar';
import { Fleet } from '../../resources/fleet';
import { GameServerSet } from '../../resources/gameserverset';
import { filterGameServerSetsByFleet, getGameServerSetPhase } from '../../utils/gameServerSetHelpers';

export function GameServerSetList() {
  const [sets] = GameServerSet.useList();
  const [fleets] = Fleet.useList();

  const fleetByKey = useMemo(() => {
    const m = new Map<string, Fleet>();
    for (const f of fleets ?? []) {
      m.set(`${f.metadata.namespace}/${f.metadata.name}`, f);
    }
    return m;
  }, [fleets]);

  const siblingsByFleet = useMemo(() => {
    const m = new Map<string, GameServerSet[]>();
    if (!sets || !fleets) return m;
    for (const fleet of fleets) {
      m.set(
        `${fleet.metadata.namespace}/${fleet.metadata.name}`,
        filterGameServerSetsByFleet(sets, fleet)
      );
    }
    return m;
  }, [sets, fleets]);

  return (
    <SectionBox title="Game Server Sets">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Namespace</TableCell>
            <TableCell>Fleet</TableCell>
            <TableCell>Phase</TableCell>
            <TableCell>Desired</TableCell>
            <TableCell>Replica Status</TableCell>
            <TableCell>Shutdown</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!sets ? (
            <TableRow>
              <TableCell colSpan={7}>
                <Typography variant="body2" color="text.secondary">Loading…</Typography>
              </TableCell>
            </TableRow>
          ) : sets.map(gss => {
            const fleetKey = `${gss.metadata.namespace}/${gss.fleet}`;
            const fleet = fleetByKey.get(fleetKey);
            const siblings = siblingsByFleet.get(fleetKey) ?? [];
            const phase = getGameServerSetPhase(gss, fleet, siblings);

            return (
              <TableRow key={gss.metadata.uid}>
                <TableCell><Link kubeObject={gss}>{gss.metadata.name}</Link></TableCell>
                <TableCell>{gss.metadata.namespace}</TableCell>
                <TableCell>
                  {gss.fleet
                    ? <FleetLink namespace={gss.metadata.namespace} name={gss.fleet} />
                    : '—'}
                </TableCell>
                <TableCell><GameServerSetPhaseChip phase={phase} /></TableCell>
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
            );
          })}
        </TableBody>
      </Table>
    </SectionBox>
  );
}
