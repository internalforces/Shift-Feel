import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { DrivingControls } from '../app/features/controls/DrivingControls';
import { Dashboard } from '../app/features/dashboard/Dashboard';

const layoutEvent = (x: number, y: number, width: number, height: number) => ({
  nativeEvent: { layout: { x, y, width, height } },
});

type TestTouch = {
  identifier: number;
  locationX: number;
  locationY: number;
};

const touchEvent = (touches: TestTouch[], changedTouches: TestTouch[] = []) => {
  const touchBank = touches.reduce<Array<Record<string, unknown> | null>>(
    (bank, touch) => {
      bank[touch.identifier] = {
        touchActive: true,
        currentPageX: touch.locationX,
        currentPageY: touch.locationY,
        previousPageX: touch.locationX,
        previousPageY: touch.locationY,
        currentTimeStamp: 1,
      };
      return bank;
    },
    [],
  );

  return {
    nativeEvent: { touches, changedTouches },
    touchHistory: {
      touchBank,
      numberActiveTouches: touches.length,
      indexOfSingleActiveTouch:
        touches.length === 1 ? touches[0].identifier : -1,
      mostRecentTimeStamp: 1,
    },
  };
};

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

  const gearRegion = renderer.root.findByProps({ testID: 'gear-input-region' });
  const gearPattern = renderer.root.findByProps({
    accessibilityLabel: 'H-pattern gear lever',
  });
  const pedalRegion = renderer.root.findByProps({
    testID: 'pedal-input-region',
  });
  await ReactTestRenderer.act(() => {
    gearRegion.props.onLayout(layoutEvent(0, 0, 300, 230));
    gearPattern.props.onLayout(layoutEvent(16, 40, 268, 190));
    pedalRegion.props.onLayout(layoutEvent(0, 242, 300, 150));
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
    const { renderer, responder, onSelectGear, onClutchChange } =
      await renderControls();
    const clutchTouch = { identifier: 1, locationX: 50, locationY: 270 };
    const gearTouch = { identifier: 2, locationX: 64, locationY: 80 };

    await ReactTestRenderer.act(() => {
      responder.props.onResponderGrant(touchEvent([clutchTouch, gearTouch]));
      responder.props.onResponderEnd(touchEvent([clutchTouch]));
    });

    expect(onClutchChange).toHaveBeenCalledWith(expect.any(Number));
    expect(onSelectGear).toHaveBeenCalledWith(1);
    await ReactTestRenderer.act(() => renderer.unmount());
  });

  it('commits the gear before clearing a clutch touch that ends with it', async () => {
    const { renderer, responder, onSelectGear, onClutchChange } =
      await renderControls();
    const clutchTouch = { identifier: 1, locationX: 50, locationY: 270 };
    const gearTouch = { identifier: 2, locationX: 64, locationY: 80 };
    const callOrder: string[] = [];
    onSelectGear.mockImplementation(() => {
      callOrder.push('gear');
      return true;
    });
    onClutchChange.mockImplementation(value => {
      if (value === 0) {
        callOrder.push('clutch-release');
      }
    });

    await ReactTestRenderer.act(() => {
      responder.props.onResponderGrant(touchEvent([clutchTouch, gearTouch]));
      callOrder.length = 0;
      responder.props.onResponderEnd(touchEvent([]));
    });

    expect(onSelectGear).toHaveBeenCalledWith(1);
    expect(callOrder).toEqual(['gear', 'clutch-release']);
    await ReactTestRenderer.act(() => renderer.unmount());
  });

  it('uses the lifted gear touch position for a quick drag', async () => {
    const { renderer, responder, onSelectGear } = await renderControls();
    const startInNeutral = { identifier: 2, locationX: 150, locationY: 135 };
    const liftInFirst = { identifier: 2, locationX: 64, locationY: 80 };

    await ReactTestRenderer.act(() => {
      responder.props.onResponderGrant(touchEvent([startInNeutral]));
      responder.props.onResponderEnd(touchEvent([], [liftInFirst]));
    });

    expect(onSelectGear).toHaveBeenCalledWith(1);
    await ReactTestRenderer.act(() => renderer.unmount());
  });

  it('rejects a raw release between two gear gates', async () => {
    const { renderer, responder, onSelectGear } = await renderControls();
    const betweenGates = {
      identifier: 2,
      locationX: 16 + 268 * 0.34,
      locationY: 40 + 190 * 0.2,
    };

    await ReactTestRenderer.act(() => {
      responder.props.onResponderGrant(touchEvent([betweenGates]));
      responder.props.onResponderEnd(touchEvent([]));
    });

    expect(onSelectGear).not.toHaveBeenCalled();
    await ReactTestRenderer.act(() => renderer.unmount());
  });

  it('keeps a pedal pressed above its edge without claiming a gear', async () => {
    const { renderer, responder, onSelectGear, onClutchChange } =
      await renderControls();
    const clutchTouch = { identifier: 1, locationX: 50, locationY: 270 };
    const abovePedal = { identifier: 1, locationX: 64, locationY: 20 };

    await ReactTestRenderer.act(() => {
      responder.props.onResponderGrant(touchEvent([clutchTouch]));
      responder.props.onResponderMove(touchEvent([abovePedal]));
    });

    expect(onClutchChange).toHaveBeenLastCalledWith(1);

    await ReactTestRenderer.act(() => {
      responder.props.onResponderEnd(touchEvent([]));
    });
    expect(onSelectGear).not.toHaveBeenCalled();
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

  it('keeps an active pedal gesture from yielding to scrolling', async () => {
    const { renderer, responder } = await renderControls();
    const clutchTouch = { identifier: 1, locationX: 50, locationY: 270 };

    await ReactTestRenderer.act(() => {
      responder.props.onResponderGrant(touchEvent([clutchTouch]));
    });

    expect(responder.props.onResponderTerminationRequest()).toBe(false);
    await ReactTestRenderer.act(() => renderer.unmount());
  });

  it('allows a parent scroll view to terminate the responder', async () => {
    const { renderer, responder } = await renderControls();

    expect(responder.props.onResponderTerminationRequest()).toBe(true);
    await ReactTestRenderer.act(() => renderer.unmount());
  });
});
