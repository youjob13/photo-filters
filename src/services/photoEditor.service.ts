import EventEmitter from "events";

export class PhotoEditorService extends EventEmitter {
  private originalImageData: ImageData | null = null;
  private photoData: File | null = null;

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

  updateImageData(imageData: ImageData) {
    this.emit("updateImage", imageData);
  }

  resetImageDataToInitial() {
    this.emit("updateImage", this.originalImageData);
  }
}
