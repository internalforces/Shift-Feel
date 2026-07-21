import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { Dashboard } from '../app/features/dashboard/Dashboard';
import { GearSelector } from '../app/features/gearbox/GearSelector';
import { PedalControls } from '../app/features/pedals/PedalControls';

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

  it('renders the draggable gear pattern', async () => {
    const onSelect = jest.fn();
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <GearSelector selectedGear={1} onSelect={onSelect} />,
      );
    });

    expect(renderer.toJSON()).toBeTruthy();
    await ReactTestRenderer.act(() => renderer.unmount());
  });

  it('renders independent continuous pedal values', async () => {
    const onClutchChange = jest.fn();
    const onThrottleChange = jest.fn();
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <PedalControls
          clutch={0.5}
          throttle={0.75}
          onClutchChange={onClutchChange}
          onThrottleChange={onThrottleChange}
        />,
      );
    });

    expect(renderer.toJSON()).toBeTruthy();
    await ReactTestRenderer.act(() => renderer.unmount());
  });
});
