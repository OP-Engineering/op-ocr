import { useState } from 'react';
import 'react-native-reanimated';
import { Button, StyleSheet, Text, View } from 'react-native';
import { type MRZProperties, MRZScanner } from '@op-engineering/op-ocr';

export default function App() {
  const [mrzResults, setMrzResults] = useState<MRZProperties>();

  return (
    <View style={styles.container}>
      {!mrzResults ? <MRZScanner onResults={setMrzResults} /> : null}
      {!!mrzResults ? (
        <View style={styles.results}>
          <Text style={styles.title}>MRZ Results</Text>
          <View style={styles.resultsContainer}>
            <View>
              <Text style={styles.label}>MRZ Source:</Text>
              <Text style={styles.text}>
                {JSON.stringify(mrzResults, null, 2)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>MRZ Type: </Text>
              <Text style={styles.text}>{mrzResults.docType}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>ID Number: </Text>
              <Text style={styles.text}>{mrzResults.passportNumber}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Doc Expiration: </Text>
              <Text style={styles.text}>{mrzResults.expiryDate}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Last Name: </Text>
              <Text style={styles.text}>{mrzResults.lastNames}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>First Name: </Text>
              <Text style={styles.text}>{mrzResults.givenNames}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Gender: </Text>
              <Text style={styles.text}>{mrzResults.gender}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Date Of Birth: </Text>
              <Text style={styles.text}>{mrzResults.birthDate}</Text>
            </View>
          </View>
          <Button
            onPress={() => {
              setMrzResults(undefined);
            }}
            title="Rescan"
          />
        </View>
      ) : undefined}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  results: {
    width: '90%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultsContainer: {
    width: '100%',
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 16,
    paddingVertical: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
