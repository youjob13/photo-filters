import EventEmitter from "events";
import { HistogramService } from "./histogram.service";
import { ApplyFilterFactory } from "../filters/filter-factory";

export class PhotoEditorService extends EventEmitter {
  private originalImageData: ImageData | undefined;
  private currentImageData: ImageData | undefined;
  private readonly filterFactory = new ApplyFilterFactory();

  constructor(private readonly histogramService: HistogramService) {
    super();
  }

  setNewPhotoData(originalImageData: ImageData) {
    this.originalImageData = originalImageData;
    this.currentImageData = this.originalImageData;
    this.histogramService.setImageData(originalImageData);
    this.drawHistogram();
    this.emit("setNewPhotoData", this.originalImageData);
  }

  getImageData() {
    if (this.currentImageData == null) {
      throw new Error("Image data is not exist");
    }
    return this.currentImageData;
  }

  applyFilter(filterName: string, ...args: any[]) {
    if (this.originalImageData == null) {
      throw new Error("Image data is not exist");
    }
    const filter = this.filterFactory.applyFilter(filterName);
    const imageData = filter.applyFilter(this.originalImageData, ...args);
    return this.updateImageData(imageData);
  }

  private updateImageData(imageData: ImageData) {
    this.currentImageData = imageData;
    this.emit("updateImage", imageData);
    this.drawHistogram();
  }

  resetImageDataToInitial() {
    this.currentImageData = this.originalImageData;
    this.emit("updateImage", this.originalImageData);
    this.drawHistogram();
  }

  private drawHistogram() {
    this.histogramService.drawHistogram(this.currentImageData);
  }
}
