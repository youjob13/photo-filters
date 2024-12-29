import { PhotoFilter } from "./model";

export class SharpenFilter implements PhotoFilter {
  applyFilter(imageData: ImageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;

    // Фильтр для повышения резкости (например, операторы свертки)
    const kernel = [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ];

    // Новый массив данных для изображения
    const output = new Uint8ClampedArray(data);

    // Применение свертки с ядром
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let r = 0,
          g = 0,
          b = 0;

        // Применяем ядро (свертку) к каждому пикселю
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
            const weight = kernel[ky + 1][kx + 1];

            r += data[pixelIndex] * weight;
            g += data[pixelIndex + 1] * weight;
            b += data[pixelIndex + 2] * weight;
          }
        }

        // Ограничиваем значения для предотвращения выхода за границы
        const index = (y * width + x) * 4;
        output[index] = Math.min(255, Math.max(0, r));
        output[index + 1] = Math.min(255, Math.max(0, g));
        output[index + 2] = Math.min(255, Math.max(0, b));
        output[index + 3] = 255; // Альфа-канал остаётся неизменным
      }
    }

    return new ImageData(output, imageData.width, imageData.height);
  }
}
