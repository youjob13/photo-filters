import { PhotoFilter } from "./model";
import { toGrayscale } from "./util";

export class RobertsFilter implements PhotoFilter {
  applyFilter(imageData: ImageData): ImageData {
    const newImageData = toGrayscale(imageData);
    const width = newImageData.width;
    const height = newImageData.height;
    const output = new Uint8ClampedArray(newImageData.data.length);

    for (let y = 0; y < height - 1; y++) {
      for (let x = 0; x < width - 1; x++) {
        const i = (y * width + x) * 4;

        // Compute the diagonal gradients
        const Gx = Math.abs(
          newImageData.data[i] - newImageData.data[i + 4 + width * 4]
        );
        const Gy = Math.abs(
          newImageData.data[i + 4] - newImageData.data[i + width * 4]
        );

        const gradient = Math.sqrt(Gx * Gx + Gy * Gy);

        // Set the pixel value to the gradient intensity
        output[i] = output[i + 1] = output[i + 2] = gradient;
        output[i + 3] = 255; // Alpha channel remains 255
      }
    }
    return new ImageData(output, width, height);
  }
}
