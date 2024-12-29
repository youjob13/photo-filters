import { BSCFilter } from "./bsc.filter";
import { CannyFilter } from "./canny.filter";
import { GrayFilter } from "./gray.filter";
import { MedianFilter } from "./median.filter";
import { PhotoFilter } from "./model";
import { MotionBlurFilter } from "./motion-blur.filter";
import { RobertsFilter } from "./roberts.filter";
import { SharpenFilter } from "./sharpen.filter";

export class ApplyFilterFactory {
  applyFilter(filterName: string): PhotoFilter {
    switch (filterName) {
      case "sharpen": {
        return new SharpenFilter();
      }
      case "median": {
        return new MedianFilter();
      }
      case "roberts": {
        return new RobertsFilter();
      }
      case "motion": {
        return new MotionBlurFilter();
      }
      case "gray": {
        return new GrayFilter();
      }
      case "canny": {
        return new CannyFilter();
      }
      case "bsc":
      default:
        return new BSCFilter();
    }
  }
}
