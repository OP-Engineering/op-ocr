import { type FC, type PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import MRZCamera from './MRZCamera';
import { type MRZScannerProps } from '../types/types';
import type { MRZProperties } from '../types/mrzProperties';
import { parseMRZ } from '../util/mrzParser';

const idList: string[] = [];
const dobList: string[] = [];
const expiryList: string[] = [];

const MRZScanner: FC<PropsWithChildren<MRZScannerProps>> = ({
  mrzFinalResults,
  numberOfQAChecks,
}) => {
  //*****************************************************************************************
  //  setting up the state
  //*****************************************************************************************

  const numQAChecks = numberOfQAChecks ?? 3;

  /**
   * If all elements in list match element, add the new element.
   * If not, empty the list, then add the new element to the list.
   * @param list
   * @param element
   */
  const mrzQACheck = (list: string[], element: string) => {
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
      // docMRZQAList.length >= nu &&
      idList.length >= numQAChecks &&
      dobList.length >= numQAChecks &&
      expiryList.length >= numQAChecks
    ) {
      return true;
    }

    if (mrzResults.idNumber && idList.length < numQAChecks) {
      mrzQACheck(idList, mrzResults.idNumber);
    }

    if (mrzResults.dob && dobList.length < numQAChecks) {
      mrzQACheck(dobList, mrzResults.dob);
    }
    if (mrzResults.docExpirationDate && expiryList.length < numQAChecks) {
      mrzQACheck(expiryList, mrzResults.docExpirationDate);
    }

    return false;
  };

  return (
    <View testID="scanDocumentView" style={StyleSheet.absoluteFill}>
      <MRZCamera
        onData={(lines) => {
          const mrzResults = parseMRZ(lines);
          if (mrzResults && currentMRZMatchesPreviousMRZs(mrzResults)) {
            mrzFinalResults(mrzResults);
          }
        }}
      />
    </View>
  );
};

export default MRZScanner;
