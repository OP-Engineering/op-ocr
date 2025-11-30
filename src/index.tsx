export { default as MRZScanner } from './components/MRZScanner';

export type { MRZProperties } from './types/mrzProperties';
export type {
  BoundingFrame,
  Dimensions,
  MRZFrame,
  OCRElement,
  Point,
  Rect,
  Size,
  Text,
  TextBlock,
  TextElement,
  TextLine,
} from './types/types';
export { boundingBoxAdjustToView } from './util/boundingBoxAdjustToView';
export { sortFormatsByResolution } from './util/generalUtil';
export { scanMRZ } from './util/wrapper';
