export interface PhotoFilter {
  applyFilter(imageData: ImageData, ...args: any[]): ImageData;
}
