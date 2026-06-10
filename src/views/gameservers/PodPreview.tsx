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

import { K8s } from '@kinvolk/headlamp-plugin/lib';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import React from 'react';
import { FleetLink } from '../../components/FleetLink';
import { PreviewPanel } from '../../components/PreviewPanel';
import { GameServer } from '../../resources/gameserver';

interface ContainerStatus {
  ready: boolean;
}

export function PodPreview({ gameServer }: { gameServer: GameServer }) {
  const [pods] = K8s.ResourceClasses.Pod.useList({
    namespace: gameServer.metadata.namespace,
    labelSelector: `agones.dev/gameserver=${gameServer.metadata.name}`,
  });

  const title = (
    <Typography variant="subtitle1">
      Pod for <strong>{gameServer.metadata.name}</strong>
      {gameServer.fleet && (
        <>
          {' '}
          · fleet <FleetLink namespace={gameServer.metadata.namespace} name={gameServer.fleet} />
        </>
      )}
    </Typography>
  );

  if (!pods)
    return (
      <PreviewPanel title={title}>
        <Typography variant="body2" color="text.secondary">
          Loading…
        </Typography>
      </PreviewPanel>
    );
  if (pods.length === 0)
    return (
      <PreviewPanel title={title}>
        <Typography variant="body2" color="text.secondary">
          No pod found.
        </Typography>
      </PreviewPanel>
    );

  return (
    <PreviewPanel title={title}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Pod Name</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Node</TableCell>
            <TableCell>IP</TableCell>
            <TableCell>Containers Ready</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pods.map(pod => {
            const statuses = pod.jsonData?.status?.containerStatuses ?? [];
            const ready = (statuses as ContainerStatus[]).filter(c => c.ready).length;
            return (
              <TableRow key={pod.metadata.uid}>
                <TableCell>{pod.metadata.name}</TableCell>
                <TableCell>{pod.jsonData?.status?.phase ?? '—'}</TableCell>
                <TableCell>{pod.jsonData?.spec?.nodeName ?? '—'}</TableCell>
                <TableCell>{pod.jsonData?.status?.podIP ?? '—'}</TableCell>
                <TableCell>{statuses.length > 0 ? `${ready}/${statuses.length}` : '—'}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </PreviewPanel>
  );
}
