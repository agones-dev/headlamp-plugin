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
import { Fleet } from '../../resources/fleet';
import { GameServerSet } from '../../resources/gameserverset';
import { buildNameToUidMap, makeNode, ownerEdges } from './graphHelpers';

export const gameServerSetsSource: GraphSource = {
  id: 'agones-gameserversets',
  label: 'GameServerSets',
  useData() {
    const [sets] = GameServerSet.useList();
    const [fleets] = Fleet.useList();
    return useMemo(() => {
      if (!sets) return null;

      const fleetUidMap = buildNameToUidMap(fleets ?? []);
      const ownerRefEdges = sets.flatMap(ownerEdges);
      const fleetLabelEdges: GraphEdge[] = [];

      for (const gss of sets) {
        const fleetName = gss.fleet;
        if (!fleetName) continue;
        const fleetUid = fleetUidMap.get(`${gss.metadata.namespace}/${fleetName}`);
        if (fleetUid) {
          fleetLabelEdges.push({
            id: `fleet-gss-${fleetUid}-${gss.metadata.uid}`,
            source: fleetUid,
            target: gss.metadata.uid,
          });
        }
      }

      return {
        nodes: sets.map(gss => makeNode(gss, 80)),
        edges: [...ownerRefEdges, ...fleetLabelEdges],
      };
    }, [sets, fleets]);
  },
};
