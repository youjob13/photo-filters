import { PhotoFilter } from "./model";

export class MotionBlurFilter implements PhotoFilter {
  applyFilter(
    imageData: ImageData,
    angle: string,
    distance: string
  ): ImageData {
    const width = imageData.width;
    const height = imageData.height;
    const data = new Uint8ClampedArray(imageData.data);
    const angleRad = (Number(angle) * Math.PI) / 180;
    const cosAngle = Math.cos(angleRad);
    const sinAngle = Math.sin(angleRad);

    // Применение размытия по направлению
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0,
          g = 0,
          b = 0,
          count = 0;

        // Идем вдоль линии, чтобы размыть изображение
        for (let d = -distance; d <= Number(distance); d++) {
          const nx = Math.round(x + d * cosAngle);
          const ny = Math.round(y + d * sinAngle);

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const idx = (ny * width + nx) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            count++;
          }
        }

        // Применяем усредненные значения пикселей
        const idx = (y * width + x) * 4;
        data[idx] = r / count;
        data[idx + 1] = g / count;
        data[idx + 2] = b / count;
      }
    }

    return new ImageData(data, width, height);
  }
}
