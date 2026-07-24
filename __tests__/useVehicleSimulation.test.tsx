import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { useVehicleSimulation } from '../app/features/engine-sim/useVehicleSimulation';

type SimulationController = ReturnType<typeof useVehicleSimulation>;

function SimulationHarness({
  onRender,
}: {
  onRender: (value: SimulationController) => void;
}) {
  const controller = useVehicleSimulation();
  onRender(controller);
  return null;
}

test('simulation hook connects controls to timed vehicle updates', async () => {
  jest.useFakeTimers();
  let controller: SimulationController | undefined;
  let renderer: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <SimulationHarness
        onRender={value => {
          controller = value;
        }}
      />,
    );
  });

  await ReactTestRenderer.act(() => {
    controller?.startEngine();
    controller?.updateInput({ clutch: 1 });
  });
  await ReactTestRenderer.act(() => {
    controller?.selectGear(1);
    controller?.updateInput({ throttle: 1, clutch: 0, brake: 0 });
    jest.advanceTimersByTime(500);
  });

  expect(controller?.vehicle.gear).toBe(1);
  expect(controller?.input.throttle).toBe(1);

  await ReactTestRenderer.act(() => {
    renderer.unmount();
  });
  jest.useRealTimers();
});
