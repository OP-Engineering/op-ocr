import {
  type FC,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { useRunOnJS } from 'react-native-worklets-core';
import { scanMRZ } from '../util/wrapper';
import { type MRZFrame } from '../types/types';
import { sortFormatsByResolution } from '../util/generalUtil';

type Props = { onData: (data: string[]) => void };

const MRZCamera: FC<PropsWithChildren<Props>> = ({ onData }) => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const { width: screenWidth } = useWindowDimensions();
  const [isActive, setIsActive] = useState(true);
  const [feedbackText, setFeedbackText] = useState<string>(
    'Align your Passport'
  );

  useEffect(() => {
    return () => {
      setIsActive(false);
    };
  }, []);

  const handleScan = useCallback((data: MRZFrame) => {
    if (data.result && data.result.blocks && data.result.blocks.length === 0) {
      setFeedbackText('Align your passport');
    } else {
      data.result.blocks.forEach((block) => {
        if (block.frame.width / screenWidth >= 0.8) {
          setFeedbackText('Scanning...');
        }
      });

      const lines = data.result.blocks.map((block) => block.text);

      if (lines.length > 0 && isActive && onData) {
        onData(lines);
      }
    }
  }, []);

  const handleScanFunc = useRunOnJS(handleScan, []);

  /* Using the useFrameProcessor hook to process the video frames. */
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const data = scanMRZ(frame);

    if (!data) {
      return;
    }

    handleScanFunc(data);
  }, []);

  if (!device) {
    return null;
  }

  if (!hasPermission) {
    requestPermission();
    return null;
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive
        fps={30}
        format={device.formats.sort(sortFormatsByResolution)[0]}
        videoStabilizationMode={'standard'}
        frameProcessor={frameProcessor}
      />

      {/* Passport Overlay Guide */}
      <View style={styles.overlayContainer}>
        {/* Top overlay */}
        <View style={styles.overlay} />

        {/* Middle section with passport frame */}
        <View style={styles.middleRow}>
          <View style={styles.overlay} />
          <View style={styles.passportFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <View style={styles.overlay} />
        </View>

        {/* Bottom overlay */}
        <View style={styles.overlay} />
      </View>

      <View style={styles.feedbackContainer}>
        <Text style={styles.feedbackText}>{feedbackText}</Text>
      </View>
    </View>
  );
};

export default MRZCamera;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
  },
  middleRow: {
    flexDirection: 'row',
    height: 200,
  },
  passportFrame: {
    width: 320,
    height: 200,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 8,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: 'white',
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  feedbackContainer: {
    position: 'absolute',
    top: 200,
    width: '90%',
    alignItems: 'center',
  },
  feedbackText: {
    backgroundColor: 'white',
    color: 'black',
    fontSize: 18,
    paddingRight: 8,
    paddingLeft: 8,
    textAlign: 'center',
  },
});
