import cv from "@techstark/opencv-js";

export function toGrayscale(imageData: ImageData) {
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

export class OpenCVBasicFactory {
  protected matToImageData(mat: cv.Mat) {
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
}
