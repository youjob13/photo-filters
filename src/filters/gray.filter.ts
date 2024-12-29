import { PhotoFilter } from "./model";
import { toGrayscale } from "./util";

export class GrayFilter implements PhotoFilter {
  applyFilter(imageData: ImageData): ImageData {
    return toGrayscale(imageData);
  }
}
