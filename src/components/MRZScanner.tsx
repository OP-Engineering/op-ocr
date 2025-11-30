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
import type { MRZProperties } from '../types/mrzProperties';
import { parseMRZ } from '../util/mrzParser';
import { sortFormatsByResolution } from '../util/generalUtil';

const idList: string[] = [];
const dobList: string[] = [];
const expiryList: string[] = [];
const numQAChecks = 3;

const MRZScanner: FC<
  PropsWithChildren<{ onResults: (results: MRZProperties) => any }>
> = ({ onResults }) => {
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

  /**
   * If all elements in list match element, add the new element.
   * If not, empty the list, then add the new element to the list.
   * @param list
   * @param element
   */
  const mrzQACheck = (list: string[], element: string) => {
    if (element === '') {
      return;
    }

    for (let i = 0; i < list.length; i++) {
      if (list[i] !== element) {
        list = [];
      }
    }
    list.push(element);
  };

  /**
   * Returns true if all QALists are full (their sizes are >= numberOfPreviousMRZsToCompareTo).
   * If one or more of them are not full, it updates them with the most recently captured field that pertains to them.
   * @param numberOfPreviousMRZsToCompareTo
   * @param mrzResults
   */
  const currentMRZMatchesPreviousMRZs = (mrzResults: MRZProperties) => {
    if (
      idList.length >= numQAChecks &&
      dobList.length >= numQAChecks &&
      expiryList.length >= numQAChecks
    ) {
      return true;
    }

    if (mrzResults.passportNumber && idList.length < numQAChecks) {
      mrzQACheck(idList, mrzResults.passportNumber);
    }

    if (mrzResults.birthDate && dobList.length < numQAChecks) {
      mrzQACheck(dobList, mrzResults.birthDate);
    }

    if (mrzResults.expiryDate && expiryList.length < numQAChecks) {
      mrzQACheck(expiryList, mrzResults.expiryDate);
    }

    return false;
  };

  const handleScan = useCallback(
    (data: MRZFrame) => {
      if (
        data.result &&
        data.result.blocks &&
        data.result.blocks.length === 0
      ) {
        setFeedbackText('Align your passport');
      } else {
        data.result.blocks.forEach((block) => {
          if (block.frame.width / screenWidth >= 0.8) {
            setFeedbackText('Scanning...');
          }
        });

        if (data.result.blocks.length > 0 && isActive) {
          const mrzResults = parseMRZ(data.result.blocks);
          if (mrzResults && currentMRZMatchesPreviousMRZs(mrzResults)) {
            onResults(mrzResults);
          }
        }
      }
    },
    [isActive, screenWidth, numQAChecks, onResults]
  );

  const handleScanFunc = useRunOnJS(handleScan, []);

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

      <View style={styles.overlayContainer}>
        <View style={styles.overlay} />

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

        <View style={styles.overlay} />
      </View>

      <View style={styles.feedbackContainer}>
        <Text style={styles.feedbackText}>{feedbackText}</Text>
      </View>
    </View>
  );
};

export default MRZScanner;

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
    top: '30%',
    width: '100%',
    alignItems: 'center',
  },
  feedbackText: {
    backgroundColor: 'white',
    color: 'black',
    fontSize: 18,
    padding: 10,
    textAlign: 'center',
    borderRadius: 5,
  },
});
