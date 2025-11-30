import MLKitTextRecognition
import MLKitVision
import VisionCamera

@objc(OpVisionCameraMrzScanner)
public class OpVisionCameraMrzScanner: FrameProcessorPlugin {

  private static let textRecognizer = TextRecognizer.textRecognizer(
    options: TextRecognizerOptions.init())

  private static func getBlockArray(_ blocks: [TextBlock]) -> [[String: Any]] {

    var blockArray: [[String: Any]] = []

    for block in blocks {
      blockArray.append([
        "text": block.text,
        "frame": getFrame(block.frame),
        "lines": getLineArray(block.lines),
      ])
    }

    return blockArray
  }

  private static func getLineArray(_ lines: [TextLine]) -> [[String: Any]] {

    var lineArray: [[String: Any]] = []

    for line in lines {
      lineArray.append([
        "text": line.text,
        "frame": getFrame(line.frame),
        "elements": getElementArray(line.elements),
      ])
    }

    return lineArray
  }

  private static func getElementArray(_ elements: [TextElement]) -> [[String: Any]] {

    var elementArray: [[String: Any]] = []

    for element in elements {
      elementArray.append([
        "text": element.text,
        "frame": getFrame(element.frame),
        "symbols": [],
      ])
    }

    return elementArray
  }

  private static func getFrame(_ frameRect: CGRect) -> [String: CGFloat] {

    let offsetX = (frameRect.midX - ceil(frameRect.width)) / 2.0
    let offsetY = (frameRect.midY - ceil(frameRect.height)) / 2.0

    let x = frameRect.maxX + offsetX
    let y = frameRect.minY + offsetY

    return [
      "x": frameRect.midX + (frameRect.midX - x),
      "y": frameRect.midY + (y - frameRect.midY),
      "top": frameRect.maxY,
      "left": frameRect.maxX,
      "right": frameRect.minX,
      "bottom": frameRect.minY,
      "width": frameRect.width,
      "height": frameRect.height,
      "boundingCenterX": frameRect.midX,
      "boundingCenterY": frameRect.midY,
    ]
  }

  public override func callback(_ frame: Frame, withArguments arguments: [AnyHashable: Any]?)
    -> Any?
  {
    guard CMSampleBufferGetImageBuffer(frame.buffer) != nil else {
      return nil
    }

    let visionImage = VisionImage(buffer: frame.buffer)
    switch frame.orientation {
      case .left:
        visionImage.orientation = .right
      case .right:
        visionImage.orientation = .left
      case .up, .down:
        fallthrough
        
      default: visionImage.orientation = frame.orientation
    }


    var result: Text
    do {
      result = try OpVisionCameraMrzScanner.textRecognizer.results(in: visionImage)
    } catch let error {
      print("Error scanning text \(error)")
      return nil
    }

    return [
      "result": [
        "text": result.text,
        "blocks": OpVisionCameraMrzScanner.getBlockArray(result.blocks),
      ]
    ]
  }
}
