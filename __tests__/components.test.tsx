import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { Dashboard } from '../app/features/dashboard/Dashboard';
import { GearSelector } from '../app/features/gearbox/GearSelector';
import { Pedal } from '../app/features/pedals/Pedal';

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

  it('selects gears and neutral', async () => {
    const onSelect = jest.fn();
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <GearSelector selectedGear={1} onSelect={onSelect} />,
      );
    });

    const buttons = renderer.root.findAll(
      node => typeof node.props.onPress === 'function',
    );
    await ReactTestRenderer.act(() => {
      buttons[0].props.onPress();
      buttons[1].props.onPress();
    });

    expect(onSelect).toHaveBeenCalledWith(0);
    expect(onSelect).toHaveBeenCalledWith(1);
    await ReactTestRenderer.act(() => renderer.unmount());
  });

  it('reports pedal press and release', async () => {
    const onChange = jest.fn();
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <Pedal label="CLUTCH" value={0} accent="#fff" onChange={onChange} />,
      );
    });

    const pedal = renderer.root.find(
      node =>
        typeof node.props.onPressIn === 'function' &&
        typeof node.props.onPressOut === 'function',
    );
    await ReactTestRenderer.act(() => {
      pedal.props.onPressIn();
      pedal.props.onPressOut();
    });

    expect(onChange).toHaveBeenNthCalledWith(1, 1);
    expect(onChange).toHaveBeenNthCalledWith(2, 0);
    await ReactTestRenderer.act(() => renderer.unmount());
  });
});
