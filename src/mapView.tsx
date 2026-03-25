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
import { GraphEdge, GraphNode, GraphSource } from '@kinvolk/headlamp-plugin/lib/components/resourceMap/graph/graphModel';
import { KubeObject } from '@kinvolk/headlamp-plugin/lib/k8s/cluster';
import { useMemo } from 'react';
import { Fleet } from './resources/fleet';
import { GameServer } from './resources/gameserver';
import { GameServerSet } from './resources/gameserverset';

function makeNode(obj: KubeObject): GraphNode {
  return {
    id: obj.metadata.uid,
    kubeObject: obj,
  };
}

function ownerEdges(obj: KubeObject): GraphEdge[] {
  return (obj.metadata.ownerReferences ?? []).map(ref => ({
    id: `${ref.uid}-${obj.metadata.uid}`,
    source: ref.uid,
    target: obj.metadata.uid,
  }));
}

export const agonesMapSource: GraphSource = {
  id: 'agones',
  label: 'Agones',
  sources: [
    {
      id: 'agones-fleets',
      label: 'Fleets',
      useData() {
        const [fleets] = Fleet.useList();
        return useMemo(() => {
          if (!fleets) return null;
          return { nodes: fleets.map(makeNode) };
        }, [fleets]);
      },
    },
    {
      id: 'agones-gameserversets',
      label: 'GameServerSets',
      useData() {
        const [gameServerSets] = GameServerSet.useList();
        return useMemo(() => {
          if (!gameServerSets) return null;
          return {
            nodes: gameServerSets.map(makeNode),
            edges: gameServerSets.flatMap(ownerEdges),
          };
        }, [gameServerSets]);
      },
    },
    {
      id: 'agones-gameservers',
      label: 'GameServers',
      useData() {
        const [gameServers] = GameServer.useList();
        return useMemo(() => {
          if (!gameServers) return null;
          return {
            nodes: gameServers.map(makeNode),
            edges: gameServers.flatMap(ownerEdges),
          };
        }, [gameServers]);
      },
    },
    {
      id: 'agones-pods',
      label: 'Pods (Agones)',
      useData() {
        const [pods] = K8s.ResourceClasses.Pod.useList();
        return useMemo(() => {
          if (!pods) return null;
          const agonesPods = pods.filter(pod =>
            pod.metadata.ownerReferences?.some(ref => ref.kind === 'GameServer')
          );
          return {
            nodes: agonesPods.map(makeNode),
            edges: agonesPods.flatMap(ownerEdges),
          };
        }, [pods]);
      },
    },
  ],
};
