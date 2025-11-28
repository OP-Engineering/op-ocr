#import <Foundation/Foundation.h>
#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>

#import "OpVisionCameraMrzScanner-Swift.h"

@interface OpVisionCameraMrzScanner (FrameProcessorPluginLoader)
@end

@implementation OpVisionCameraMrzScanner (FrameProcessorPluginLoader)

+ (void)load {
  // vision @4.x.x
  [FrameProcessorPluginRegistry
      addFrameProcessorPlugin:@"scanMRZPlugin"
              withInitializer:^FrameProcessorPlugin *_Nonnull(
                  VisionCameraProxyHolder *_Nonnull proxy,
                  NSDictionary *_Nullable options) {
                return [[OpVisionCameraMrzScanner alloc] initWithProxy:proxy
                                                           withOptions:options];
              }];
}

@end
