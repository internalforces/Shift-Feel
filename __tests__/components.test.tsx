import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { DrivingControls } from '../app/features/controls/DrivingControls';
import { Dashboard } from '../app/features/dashboard/Dashboard';

describe('driving controls', () => {
  it('renders dashboard values and stall feedback', async () => {
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <Dashboard rpm={0} speed={12} gear={-1} feedback="stalled" />,
      );
    });

    expect(renderer.toJSON()).toBeTruthy();
    await ReactTestRenderer.act(() => renderer.unmount());
  });

  it('renders the shared multi-touch driving controls', async () => {
    const onSelectGear = jest.fn(() => true);
    const onClutchChange = jest.fn();
    const onThrottleChange = jest.fn();
    let renderer!: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <DrivingControls
          selectedGear={1}
          clutch={0.5}
          throttle={0.75}
          onSelectGear={onSelectGear}
          onClutchChange={onClutchChange}
          onThrottleChange={onThrottleChange}
        />,
      );
    });

    expect(renderer.toJSON()).toBeTruthy();
    await ReactTestRenderer.act(() => renderer.unmount());
  });
});
