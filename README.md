# OPVisionCameraMrzScanner

VisionCamera Frame Processor Plugin to detect and read MRZ data from passports using MLKit Text Recognition.

## Installation & Configuration

### Install

```sh
yarn add @op-engineering/op-ocr
```

### Configure

### Add the following permission to the AndroidManifest.xml located at ~/android/app/src/AndroidManifest.xml

```xml
<uses-permission android:name="android.permission.CAMERA"/>
```

## Basic Usage

```tsx
import * as React from 'react';

import { StyleSheet, View } from 'react-native';
import { MRZProperties, MRZScanner } from 'vision-camera-mrz-scanner';

export default function App() {
  return (
    <View style={styles.container}>
      <MRZScanner
        mrzFinalResults={(mrzResults: MRZProperties) => {
          // do something with the results
          console.log('mrzResults: ', JSON.stringify(mrzResults, null, 2));
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
