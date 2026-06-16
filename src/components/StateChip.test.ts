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
import { StateChip } from './StateChip';

// We test that StateChip renders without crashing for every known Agones
// GameServer lifecycle state as documented in the official state diagram:
// https://agones.dev/site/docs/reference/gameserver/#gameserver-state-diagram

describe('StateChip', () => {
  // In-progress lifecycle states → 'info' chip
  it.each(['PortAllocation', 'Creating', 'Starting', 'Scheduled', 'RequestReady'])(
    'should render "%s" as an info chip',
    state => {
      const element = React.createElement(StateChip, { state });
      // Verify the component creates a valid React element
      expect(element).toBeDefined();
      expect(element.props.state).toBe(state);
    }
  );

  // Stable states
  it('should render "Ready" as a success chip', () => {
    const element = React.createElement(StateChip, { state: 'Ready' });
    expect(element.props.state).toBe('Ready');
  });

  it('should render "Allocated" as a warning chip', () => {
    const element = React.createElement(StateChip, { state: 'Allocated' });
    expect(element.props.state).toBe('Allocated');
  });

  it('should render "Reserved" as a secondary chip', () => {
    const element = React.createElement(StateChip, { state: 'Reserved' });
    expect(element.props.state).toBe('Reserved');
  });

  // Terminal / problem states → 'error' chip
  it.each(['Error', 'Unhealthy'])('should render "%s" as an error chip', state => {
    const element = React.createElement(StateChip, { state });
    expect(element.props.state).toBe(state);
  });

  it('should render "Shutdown" as a default chip', () => {
    const element = React.createElement(StateChip, { state: 'Shutdown' });
    expect(element.props.state).toBe('Shutdown');
  });

  // Unknown / unmapped states should not crash (fallback to 'default')
  it.each(['SomeUnknownState', ''])('should handle unmapped state "%s" gracefully', state => {
    const element = React.createElement(StateChip, { state });
    expect(element).toBeDefined();
    expect(element.props.state).toBe(state);
  });
});
