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

import { K8s } from '@kinvolk/headlamp-plugin/lib';
import { GraphEdge, GraphSource } from '@kinvolk/headlamp-plugin/lib/components/resourceMap/graph/graphModel';
import { useMemo } from 'react';
import { GameServer } from '../../resources/gameserver';
import { buildNameToUidMap, makeNode, ownerEdges } from './graphHelpers';

export const podsSource: GraphSource = {
  id: 'agones-pods',
  label: 'Pods (Agones)',
  useData() {
    const [pods]        = K8s.ResourceClasses.Pod.useList();
    const [gameServers] = GameServer.useList();
    return useMemo(() => {
      if (!pods) return null;

      const agonesPods = pods.filter(pod =>
        pod.metadata.ownerReferences?.some(ref => ref.kind === 'GameServer')
      );

      const ownerRefEdges = agonesPods.flatMap(ownerEdges);

      const gsUidMap = buildNameToUidMap(gameServers ?? []);
      const labelEdges: GraphEdge[] = [];
      for (const pod of agonesPods) {
        const gsName = pod.metadata.labels?.['agones.dev/gameserver'];
        if (gsName) {
          const gsUid = gsUidMap.get(`${pod.metadata.namespace}/${gsName}`);
          if (gsUid) {
            labelEdges.push({ id: `gs-pod-${gsUid}-${pod.metadata.uid}`, source: gsUid, target: pod.metadata.uid });
          }
        }
      }

      return {
        nodes: agonesPods.map(p => makeNode(p, 40)),
        edges: [...ownerRefEdges, ...labelEdges],
      };
    }, [pods, gameServers]);
  },
};