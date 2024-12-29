import EventEmitter from "events";

export class PhotoEditorService extends EventEmitter {
  private originalImageData: ImageData | null = null;
  private currentImageData: ImageData | null = null;
  private photoData: File | null = null;
  private lastSelectedChannel: "r" | "g" | "b" | "all" | undefined;

  updatePhotoData(photoData: File) {
    this.photoData = photoData;
    this.emit("updatePhotoData", this.photoData);
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
    const file = this.photoData;
    if (!file || !this.originalImageData) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const imageData = new ImageData(
        new Uint8ClampedArray(this.originalImageData!.data),
        this.originalImageData!.width,
        this.originalImageData!.height
      );
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Рассчитываем значение серого (взвешенная сумма)
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        // Устанавливаем его для всех каналов (R, G, B)
        data[i] = data[i + 1] = data[i + 2] = gray;
      }

      // Обновляем изображение на канвасе
      this.updateImageData(imageData);
    };
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

  sharpenImage(widths: number, heights: number) {
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

  resetImageDataToInitial() {
    this.currentImageData = this.originalImageData;
    this.emit("updateImage", this.originalImageData);
  }
}
