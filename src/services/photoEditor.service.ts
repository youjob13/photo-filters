import EventEmitter from "events";
import cv from "@techstark/opencv-js";

export class PhotoEditorService extends EventEmitter {
  private originalImageData: ImageData | null = null;
  private currentImageData: ImageData | null = null;
  private photoData: File | null = null;
  private lastSelectedChannel: "r" | "g" | "b" | "all" | undefined;
  private openCvSrc: any;

  updatePhotoData(photoData: File) {
    this.photoData = photoData;
    this.emit("updatePhotoData", this.photoData);
  }

  savePhotoInCVFormat(imageCanvas: HTMLCanvasElement) {
    this.openCvSrc = cv.imread(imageCanvas);
  }

  getPhotoData() {
    return this.photoData;
  }

  getOriginalImageData() {
    return this.originalImageData;
  }

  setOriginalImageData(originalImageData: ImageData) {
    this.originalImageData = originalImageData;
    this.currentImageData = this.originalImageData;
    this.emit("setOriginalImageData", this.originalImageData);
  }

  makeGray() {
    this.updateImageData(this.toGrayscale(this.originalImageData!));
  }

  applyFilters({
    brightness,
    saturation,
    contrast,
  }: {
    brightness: number;
    saturation: number;
    contrast: number;
  }) {
    if (!this.originalImageData) return;

    const imageData = new ImageData(
      new Uint8ClampedArray(this.originalImageData.data),
      this.originalImageData.width,
      this.originalImageData.height
    );
    const data = imageData.data;

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

    this.updateImageData(imageData);
  }

  drawHistogram(channel?: "r" | "g" | "b" | "all") {
    if (!this.currentImageData) return;

    if (channel) {
      this.lastSelectedChannel = channel;
    }
    const data = this.currentImageData.data;
    const hist = {
      r: Array(256).fill(0),
      g: Array(256).fill(0),
      b: Array(256).fill(0),
    };

    // Считаем гистограмму для каждого канала
    for (let i = 0; i < data.length; i += 4) {
      hist.r[data[i]]++;
      hist.g[data[i + 1]]++;
      hist.b[data[i + 2]]++;
    }

    // Нарисуем гистограмму для выбранного канала
    let maxValue = Math.max(...hist.r, ...hist.g, ...hist.b);
    let color: { r: "red"; g: "green"; b: "blue" } = {
      r: "red",
      g: "green",
      b: "blue",
    };

    switch (channel ?? this.lastSelectedChannel) {
      case "r": {
        this.drawChannelHistogram({
          channelData: hist.r,
          color: color.r,
          maxValue,
        });
        break;
      }

      case "g": {
        this.drawChannelHistogram({
          channelData: hist.g,
          color: color.g,
          maxValue,
        });
        break;
      }
      case "b": {
        this.drawChannelHistogram({
          channelData: hist.b,
          color: color.b,
          maxValue,
        });
        break;
      }
      case "all":
      default: {
        this.drawChannelHistogram({
          channelData: hist.r,
          color: color.r,
          maxValue,
        });
        this.drawChannelHistogram({
          channelData: hist.g,
          color: color.g,
          maxValue,
        });
        this.drawChannelHistogram({
          channelData: hist.b,
          color: color.b,
          maxValue,
        });
      }
    }
  }

  sharpeImage() {
    if (!this.originalImageData) return;

    const width = this.originalImageData.width;
    const height = this.originalImageData.height;

    const imageData = this.originalImageData;
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

    this.updateImageData(
      new ImageData(
        output,
        this.originalImageData.width,
        this.originalImageData.height
      )
    );
  }

  medianFilter() {
    if (!this.originalImageData) return;

    const width = this.originalImageData.width;
    const height = this.originalImageData.height;
    const imageData = this.originalImageData;
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

    // Обновляем изображение
    this.updateImageData(new ImageData(output, width, height));
  }

  applyCanny(threshold1SliderValue: string, threshold2SliderValue: string) {
    if (!this.openCvSrc) return;

    // Получаем значения порогов
    const threshold1 = parseInt(threshold1SliderValue, 10);
    const threshold2 = parseInt(threshold2SliderValue, 10);

    // Конвертируем в оттенки серого
    let gray = new cv.Mat();
    cv.cvtColor(this.openCvSrc, gray, cv.COLOR_RGBA2GRAY);

    // Применяем детектор Canny
    let edges = new cv.Mat();
    cv.Canny(gray, edges, threshold1, threshold2);

    // Отображаем результат на втором канвасе
    this.updateImageDataWithOpenCV(edges);

    // Освобождаем память
    gray.delete();
    edges.delete();
  }

  applyRobertsFilter() {
    const imageData = this.toGrayscale(this.currentImageData!);
    const width = imageData.width;
    const height = imageData.height;
    const output = new Uint8ClampedArray(imageData.data.length);

    for (let y = 0; y < height - 1; y++) {
      for (let x = 0; x < width - 1; x++) {
        const i = (y * width + x) * 4;

        // Compute the diagonal gradients
        const Gx = Math.abs(
          imageData.data[i] - imageData.data[i + 4 + width * 4]
        );
        const Gy = Math.abs(
          imageData.data[i + 4] - imageData.data[i + width * 4]
        );

        const gradient = Math.sqrt(Gx * Gx + Gy * Gy);

        // Set the pixel value to the gradient intensity
        output[i] = output[i + 1] = output[i + 2] = gradient;
        output[i + 3] = 255; // Alpha channel remains 255
      }
    }
    this.updateImageData(new ImageData(output, width, height));
  }

  applyMotionBlur(angle: string, distance: string) {
    if (this.originalImageData == null) {
      return;
    }
    const width = this.originalImageData.width;
    const height = this.originalImageData.height;
    const data = new Uint8ClampedArray(this.originalImageData.data);
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

    this.updateImageData(new ImageData(data, width, height));
  }

  toGrayscale(imageData: ImageData) {
    const newImageData = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );
    const { data } = newImageData;
    for (let i = 0; i < data.length; i += 4) {
      const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = data[i + 1] = data[i + 2] = avg;
    }
    return newImageData;
  }

  private drawChannelHistogram(args: {
    channelData: number[];
    color: "red" | "green" | "blue";
    maxValue: number;
  }) {
    this.emit("drawChannelHistogram", args);
  }

  updateImageData(imageData: ImageData) {
    this.currentImageData = imageData;
    this.emit("updateImage", imageData);
  }

  updateImageDataWithOpenCV(edges: cv.Mat) {
    const imageData = this.matToImageData(edges);
    this.currentImageData = imageData;
    this.emit("updateImageDataWithOpenCV", edges);
  }

  matToImageData(mat: cv.Mat) {
    // Получаем данные матрицы (пиксели)
    const width = mat.cols;
    const height = mat.rows;

    // Создаем объект ImageData
    const imageData = new ImageData(width, height);

    // Преобразуем пиксели матрицы в ImageData
    const data = imageData.data;
    const matData = mat.data;

    for (let i = 0; i < width * height; i++) {
      const pixelIdx = i * 4; // Индекс пикселя в ImageData (rgba)
      const matIdx = i; // Индекс пикселя в OpenCV Mat (grayscale)

      // В Canny результат — это бинарное изображение (0 или 255)
      const intensity = matData[matIdx] === 0 ? 0 : 255;

      // Устанавливаем значения RGBA
      data[pixelIdx] = intensity; // Red
      data[pixelIdx + 1] = intensity; // Green
      data[pixelIdx + 2] = intensity; // Blue
      data[pixelIdx + 3] = 255; // Alpha (полная непрозрачность)
    }

    return imageData;
  }

  resetImageDataToInitial() {
    this.currentImageData = this.originalImageData;
    this.emit("updateImage", this.originalImageData);
  }
}
