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
import { SimpleTable } from '@kinvolk/headlamp-plugin/lib/components/common';
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

  const podData = pods.map(pod => {
    const statuses = pod.jsonData?.status?.containerStatuses ?? [];
    const ready = (statuses as ContainerStatus[]).filter(c => c.ready).length;
    return {
      name: pod.metadata.name,
      status: pod.jsonData?.status?.phase ?? '—',
      node: pod.jsonData?.spec?.nodeName ?? '—',
      ip: pod.jsonData?.status?.podIP ?? '—',
      containersReady: statuses.length > 0 ? `${ready}/${statuses.length}` : '—',
    };
  });

  return (
    <PreviewPanel title={title}>
      <SimpleTable
        columns={[
          { label: 'Pod Name', datum: 'name' },
          { label: 'Status', datum: 'status' },
          { label: 'Node', datum: 'node' },
          { label: 'IP', datum: 'ip' },
          { label: 'Containers Ready', datum: 'containersReady' },
        ]}
        data={podData}
        emptyMessage="No pod found."
      />
    </PreviewPanel>
  );
}
