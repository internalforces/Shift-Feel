import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { DrivingControls } from '../app/features/controls/DrivingControls';
import { Dashboard } from '../app/features/dashboard/Dashboard';

const layoutEvent = (x: number, y: number, width: number, height: number) => ({
  nativeEvent: { layout: { x, y, width, height } },
});

const touchEvent = (
  touches: Array<{ identifier: number; locationX: number; locationY: number }>,
) => ({ nativeEvent: { touches } });

async function renderControls() {
  const onSelectGear = jest.fn(() => true);
  const onClutchChange = jest.fn();
  const onThrottleChange = jest.fn();
  let renderer!: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <DrivingControls
        selectedGear={0}
        clutch={0}
        throttle={0}
        onSelectGear={onSelectGear}
        onClutchChange={onClutchChange}
        onThrottleChange={onThrottleChange}
      />,
    );
  });

  const layoutNodes = renderer.root.findAll(
    node => typeof node.props.onLayout === 'function',
  );
  await ReactTestRenderer.act(() => {
    layoutNodes[0].props.onLayout(layoutEvent(0, 0, 300, 230));
    layoutNodes[1].props.onLayout(layoutEvent(16, 40, 268, 190));
    layoutNodes[2].props.onLayout(layoutEvent(0, 242, 300, 150));
  });

  const responder = renderer.root.find(
    node => typeof node.props.onResponderMove === 'function',
  );
  return {
    renderer,
    responder,
    onSelectGear,
    onClutchChange,
    onThrottleChange,
  };
}

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

  it('shifts while a separate touch keeps the clutch pressed', async () => {
    const {
      renderer,
      responder,
      onSelectGear,
      onClutchChange,
    } = await renderControls();
    const clutchTouch = { identifier: 1, locationX: 50, locationY: 270 };
    const gearTouch = { identifier: 2, locationX: 64, locationY: 80 };

    await ReactTestRenderer.act(() => {
      responder.props.onResponderGrant(
        touchEvent([clutchTouch, gearTouch]),
      );
      responder.props.onResponderEnd(touchEvent([clutchTouch]));
    });

    expect(onClutchChange).toHaveBeenCalledWith(
      expect.any(Number),
    );
    expect(onSelectGear).toHaveBeenCalledWith(1);
    await ReactTestRenderer.act(() => renderer.unmount());
  });

  it('cancels a gear drag when the responder is terminated', async () => {
    const { renderer, responder, onSelectGear } = await renderControls();
    const gearTouch = { identifier: 2, locationX: 236, locationY: 80 };

    await ReactTestRenderer.act(() => {
      responder.props.onResponderGrant(touchEvent([gearTouch]));
      responder.props.onResponderTerminate(touchEvent([]));
    });

    expect(onSelectGear).not.toHaveBeenCalled();
    await ReactTestRenderer.act(() => renderer.unmount());
  });
});
