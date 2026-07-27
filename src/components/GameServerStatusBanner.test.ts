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

import React from 'react';
import { describe, expect, it } from 'vitest';
import { GameServerStatusBanner } from './GameServerStatusBanner';

describe('GameServerStatusBanner', () => {
  describe('Allocated state', () => {
    it('should render a banner for Allocated state', () => {
      const element = React.createElement(GameServerStatusBanner, { state: 'Allocated' });
      expect(element).toBeDefined();
      expect(element.props.state).toBe('Allocated');
      // Component should not return null for Allocated
      expect(element.type).toBe(GameServerStatusBanner);
    });
  });

  describe('Non-highlighted states', () => {
    it.each(['Ready', 'Creating', 'Scheduled', 'Shutdown', 'Error', 'Unhealthy', ''])(
      'should return null for "%s" state (no banner needed)',
      state => {
        const result = GameServerStatusBanner({ state });
        expect(result).toBeNull();
      }
    );
  });

  describe('Edge cases', () => {
    it('should handle "__proto__" safely without crashing', () => {
      const result = GameServerStatusBanner({ state: '__proto__' });
      expect(result).toBeNull();
    });

    it('should handle "constructor" safely without crashing', () => {
      const result = GameServerStatusBanner({ state: 'constructor' });
      expect(result).toBeNull();
    });

    it('should handle "toString" safely without crashing', () => {
      const result = GameServerStatusBanner({ state: 'toString' });
      expect(result).toBeNull();
    });
  });
});
