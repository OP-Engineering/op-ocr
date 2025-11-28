import type { Frame } from 'react-native-vision-camera';
import { VisionCameraProxy } from 'react-native-vision-camera';
import { type MRZFrame } from 'src/types/types';

const pluginName = 'scanMRZPlugin';

const plugin = VisionCameraProxy.initFrameProcessorPlugin(pluginName, {});

export function scanMRZ(frame: Frame): MRZFrame {
  'worklet';

  if (plugin == null) {
    throw new Error(`Failed to load Frame Processor Plugin "${pluginName}"`);
  }

  return plugin.call(frame) as any;
}
