import { NativeModules } from 'react-native';

const mockNativeAudio = {
  initialize: jest.fn(),
  startEngineEvent: jest.fn(),
  setRpm: jest.fn(),
  triggerCue: jest.fn(),
  stop: jest.fn(),
};

NativeModules.FmodEngineAudio = mockNativeAudio;

const { startEngineAudio } = require('../app/features/engine-audio/EngineAudio');

describe('FMOD engine audio startup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNativeAudio.initialize.mockResolvedValue(undefined);
    mockNativeAudio.startEngineEvent.mockRejectedValue(
      new Error('event unavailable'),
    );
    mockNativeAudio.stop.mockResolvedValue(undefined);
  });

  it('stops native audio when starting the engine event fails', async () => {
    await expect(startEngineAudio()).resolves.toBe(false);

    expect(mockNativeAudio.initialize).toHaveBeenCalledTimes(1);
    expect(mockNativeAudio.startEngineEvent).toHaveBeenCalledTimes(1);
    expect(mockNativeAudio.stop).toHaveBeenCalledTimes(1);
  });
});
