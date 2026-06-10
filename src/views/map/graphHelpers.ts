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

import {
  GraphEdge,
  GraphNode,
} from '@kinvolk/headlamp-plugin/lib/components/resourceMap/graph/graphModel';
import { KubeObject } from '@kinvolk/headlamp-plugin/lib/k8s/cluster';

export function makeNode(obj: KubeObject, weight?: number): GraphNode {
  return {
    id: obj.metadata.uid,
    kubeObject: obj,
    weight,
  };
}

export function ownerEdges(obj: KubeObject): GraphEdge[] {
  return (obj.metadata.ownerReferences ?? []).map(ref => ({
    id: `${ref.uid}-${obj.metadata.uid}`,
    source: ref.uid,
    target: obj.metadata.uid,
  }));
}

/** Returns a map of "namespace/name" → uid for any list of KubeObjects. */
export function buildNameToUidMap(objects: KubeObject[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const o of objects) {
    m.set(`${o.metadata.namespace}/${o.metadata.name}`, o.metadata.uid);
  }
  return m;
}
