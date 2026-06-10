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

import { DetailsGrid, SectionBox } from '@kinvolk/headlamp-plugin/lib/components/common';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AllocationDialog } from '../../components/AllocationDialog';
import { GameServerTable } from '../../components/GameServerTable';
import { ReplicaBar } from '../../components/ReplicaBar';
import { UtilBar } from '../../components/UtilBar';
import { Fleet } from '../../resources/fleet';
import { GameServer } from '../../resources/gameserver';

interface WithGameServers {
  gameServers: GameServer[] | null;
}

function AggregateCapacitySection({ gameServers }: WithGameServers) {
  if (!gameServers) return null;

  const counterTotals = new Map<string, { count: number; capacity: number }>();
  const listTotals = new Map<string, { count: number; capacity: number }>();

  for (const gs of gameServers) {
    for (const [key, c] of Object.entries(gs.counters)) {
      const prev = counterTotals.get(key) ?? { count: 0, capacity: 0 };
      counterTotals.set(key, { count: prev.count + c.count, capacity: prev.capacity + c.capacity });
    }
    for (const [key, l] of Object.entries(gs.lists)) {
      const prev = listTotals.get(key) ?? { count: 0, capacity: 0 };
      listTotals.set(key, {
        count: prev.count + (l.values?.length ?? 0),
        capacity: prev.capacity + l.capacity,
      });
    }
  }

  if (counterTotals.size === 0 && listTotals.size === 0) return null;

  return (
    <SectionBox title="Aggregate Capacity (fleet-wide)">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>Key</TableCell>
            <TableCell>Available</TableCell>
            <TableCell sx={{ minWidth: 200 }}>Used / Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from(counterTotals.entries()).map(([key, t]) => (
            <TableRow key={`c-${key}`}>
              <TableCell>
                <Chip label="Counter" size="small" variant="outlined" />
              </TableCell>
              <TableCell>
                <strong>{key}</strong>
              </TableCell>
              <TableCell>{t.capacity - t.count}</TableCell>
              <TableCell>
                <UtilBar value={t.count} max={t.capacity} />
              </TableCell>
            </TableRow>
          ))}
          {Array.from(listTotals.entries()).map(([key, t]) => (
            <TableRow key={`l-${key}`}>
              <TableCell>
                <Chip label="List" size="small" variant="outlined" />
              </TableCell>
              <TableCell>
                <strong>{key}</strong>
              </TableCell>
              <TableCell>{t.capacity - t.count}</TableCell>
              <TableCell>
                <UtilBar value={t.count} max={t.capacity} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SectionBox>
  );
}

function GameServersSection({ gameServers }: WithGameServers) {
  return (
    <SectionBox title="Game Servers">
      <GameServerTable gameServers={gameServers ?? []} />
    </SectionBox>
  );
}

function AllocateSection({ fleet }: { fleet: Fleet }) {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ pt: 1 }}>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Allocate Game Server
      </Button>
      <AllocationDialog
        open={open}
        onClose={() => setOpen(false)}
        fleetName={fleet.metadata.name}
        namespace={fleet.metadata.namespace}
      />
    </Box>
  );
}

export function FleetDetail() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const [gameServers] = GameServer.useList({
    namespace,
    labelSelector: `agones.dev/fleet=${name}`,
  });

  return (
    <DetailsGrid
      resourceType={Fleet}
      name={name}
      namespace={namespace}
      withEvents
      extraInfo={item =>
        item && [
          { name: 'Scheduling', value: item.scheduling },
          { name: 'Strategy', value: item.strategy },
          ...(item.strategy === 'RollingUpdate'
            ? [
                { name: 'Max Surge', value: item.maxSurge ?? '25%' },
                { name: 'Max Unavailable', value: item.maxUnavailable ?? '25%' },
              ]
            : []),
          { name: 'Desired Replicas', value: item.desiredReplicas },
          {
            name: 'Replica Status',
            value: (
              <ReplicaBar
                desired={item.desiredReplicas}
                ready={item.readyReplicas}
                allocated={item.allocatedReplicas}
                reserved={item.reservedReplicas}
              />
            ),
          },
          { name: 'Ready Replicas', value: item.readyReplicas },
          { name: 'Allocated Replicas', value: item.allocatedReplicas },
          ...(item.reservedReplicas > 0
            ? [{ name: 'Reserved Replicas', value: item.reservedReplicas }]
            : []),
        ]
      }
      extraSections={item =>
        item && [
          <AggregateCapacitySection gameServers={gameServers ?? null} />,
          <GameServersSection gameServers={gameServers ?? null} />,
          <AllocateSection fleet={item} />,
        ]
      }
    />
  );
}
