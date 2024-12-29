import { PhotoFilter } from "./model";

export class BSCFilter implements PhotoFilter {
  applyFilter(
    imageData: ImageData,
    {
      brightness,
      saturation,
      contrast,
    }: {
      brightness: number;
      saturation: number;
      contrast: number;
    }
  ) {
    const newImageData = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );
    const data = newImageData.data;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Применение яркости
      r += brightness;
      g += brightness;
      b += brightness;

      // Применение насыщенности
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r += (r - gray) * (saturation / 100);
      g += (g - gray) * (saturation / 100);
      b += (b - gray) * (saturation / 100);

      // Применение контрастности
      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      r = factor * (r - 128) + 128;
      g = factor * (g - 128) + 128;
      b = factor * (b - 128) + 128;

      // Ограничиваем значения пикселей
      data[i] = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));
    }

    return newImageData;
  }
}
