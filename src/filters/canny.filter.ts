import { PhotoFilter } from "./model";
import { OpenCVBasicFactory } from "./util";
import cv from "@techstark/opencv-js";

export class CannyFilter extends OpenCVBasicFactory implements PhotoFilter {
  applyFilter(
    imageData: ImageData,
    threshold1SliderValue: string,
    threshold2SliderValue: string
  ): ImageData {
    // Получаем значения порогов
    const threshold1 = parseInt(threshold1SliderValue, 10);
    const threshold2 = parseInt(threshold2SliderValue, 10);

    const mat = cv.matFromImageData(imageData);

    // Конвертируем в оттенки серого
    let gray = new cv.Mat();
    cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY);

    // Применяем детектор Canny
    let edges = new cv.Mat();
    cv.Canny(gray, edges, threshold1, threshold2);

    // Отображаем результат на втором канвасе
    const newImageData = this.matToImageData(edges);

    // Освобождаем память
    gray.delete();
    edges.delete();

    return newImageData;
  }
}
