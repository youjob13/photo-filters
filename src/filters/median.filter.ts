import { PhotoFilter } from "./model";

export class MedianFilter implements PhotoFilter {
  applyFilter(imageData: ImageData): ImageData {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;

    // Размер окна для медианной фильтрации (например, 3x3)
    const windowSize = 3;
    const halfWindow = Math.floor(windowSize / 2);

    // Новый массив для хранения данных после фильтрации
    const output = new Uint8ClampedArray(data.length);

    // Функция для получения медианы массива
    function getMedian(arr: number[]) {
      arr.sort((a, b) => a - b);
      const mid = Math.floor(arr.length / 2);
      return arr.length % 2 === 0 ? (arr[mid - 1] + arr[mid]) / 2 : arr[mid];
    }

    // Применение медианной фильтрации
    for (let y = halfWindow; y < height - halfWindow; y++) {
      for (let x = halfWindow; x < width - halfWindow; x++) {
        const rValues = [];
        const gValues = [];
        const bValues = [];

        // Собираем пиксели в окрестности
        for (let ky = -halfWindow; ky <= halfWindow; ky++) {
          for (let kx = -halfWindow; kx <= halfWindow; kx++) {
            const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
            rValues.push(data[pixelIndex]);
            gValues.push(data[pixelIndex + 1]);
            bValues.push(data[pixelIndex + 2]);
          }
        }

        // Находим медиану для каждого канала
        const rMedian = getMedian(rValues);
        const gMedian = getMedian(gValues);
        const bMedian = getMedian(bValues);

        // Записываем медианное значение в новый массив
        const index = (y * width + x) * 4;
        output[index] = rMedian;
        output[index + 1] = gMedian;
        output[index + 2] = bMedian;
        output[index + 3] = 255; // Альфа-канал не меняем
      }
    }
    return new ImageData(output, width, height);
  }
}
