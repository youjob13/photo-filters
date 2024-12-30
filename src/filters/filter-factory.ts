import { BSCFilter } from "./bsc.filter";
import { CannyFilter } from "./canny.filter";
import { GrayFilter } from "./gray.filter";
import { MedianFilter } from "./median.filter";
import { PhotoFilter } from "./model";
import { MotionBlurFilter } from "./motion-blur.filter";
import { RobertsFilter } from "./roberts.filter";
import { SharpenFilter } from "./sharpen.filter";

export type Filters =
  | "sharpen"
  | "median"
  | "roberts"
  | "motion"
  | "gray"
  | "canny"
  | "bsc";

export class ApplyFilterFactory {
  applyFilter(filterName: Filters): PhotoFilter {
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
        return new BSCFilter();
      default:
        throw new Error("The provided filter name is not exist");
    }
  }
}
