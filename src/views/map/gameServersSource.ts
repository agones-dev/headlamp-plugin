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

import { GraphEdge, GraphSource } from '@kinvolk/headlamp-plugin/lib/components/resourceMap/graph/graphModel';
import { useMemo } from 'react';
import { GameServer } from '../../resources/gameserver';
import { GameServerSet } from '../../resources/gameserverset';
import { buildNameToUidMap, makeNode } from './graphHelpers';

export const gameServersSource: GraphSource = {
  id: 'agones-gameservers',
  label: 'GameServers',
  useData() {
    const [gameServers] = GameServer.useList();
    const [sets] = GameServerSet.useList();
    return useMemo(() => {
      if (!gameServers) return null;

      const gssUidMap = buildNameToUidMap(sets ?? []);
      const edges: GraphEdge[] = [];

      for (const gs of gameServers) {
        const gssName = gs.gameServerSet;
        if (!gssName) continue;
        const uid = gssUidMap.get(`${gs.metadata.namespace}/${gssName}`);
        if (uid) {
          edges.push({
            id: `gss-gs-${uid}-${gs.metadata.uid}`,
            source: uid,
            target: gs.metadata.uid,
          });
        }
      }

      return { nodes: gameServers.map(gs => makeNode(gs, 60)), edges };
    }, [gameServers, sets]);
  },
};