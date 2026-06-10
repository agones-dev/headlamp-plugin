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

import Typography from '@mui/material/Typography';
import React from 'react';
import { GameServerTable } from '../../components/GameServerTable';
import { PreviewPanel } from '../../components/PreviewPanel';
import { Fleet } from '../../resources/fleet';
import { GameServer } from '../../resources/gameserver';

export function GameServersPreview({ fleet }: { fleet: Fleet }) {
  const [gameServers] = GameServer.useList({
    namespace: fleet.metadata.namespace,
    labelSelector: `agones.dev/fleet=${fleet.metadata.name}`,
  });

  const title = (
    <Typography variant="subtitle1">
      Game Servers for <strong>{fleet.metadata.name}</strong>{' '}
      <Typography component="span" variant="body2" color="text.secondary">
        ({fleet.metadata.namespace})
      </Typography>
    </Typography>
  );

  if (!gameServers)
    return (
      <PreviewPanel title={title}>
        <Typography variant="body2" color="text.secondary">
          Loading…
        </Typography>
      </PreviewPanel>
    );
  if (!gameServers.length)
    return (
      <PreviewPanel title={title}>
        <Typography variant="body2" color="text.secondary">
          No game servers found.
        </Typography>
      </PreviewPanel>
    );

  return (
    <PreviewPanel title={title}>
      <GameServerTable gameServers={gameServers} />
    </PreviewPanel>
  );
}
