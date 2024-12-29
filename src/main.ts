import "./style.css";
import { PhotoUploader } from "./components/index";
import { PhotoEditor } from "./components/PhotoEditor/photoEditor";
import { PhotoEditorService } from "./services/photoEditor.service";
import { HistogramService } from "./services/histogram.service";
import { Histogram } from "./components/Histogram/histogram";

class App {
  constructor(private entryPoint: HTMLElement) {}

  start() {
    const histogramService = new HistogramService();
    const histogram = new Histogram({
      histogramService,
    });
    const photoEditorService = new PhotoEditorService(histogramService);
    const photoUploader = new PhotoUploader({ photoEditorService });
    const photoEditor = new PhotoEditor({
      photoEditorService,
    });

    this.entryPoint.append(
      photoUploader.getElement(),
      histogram.getElement(),
      photoEditor.getElement()
    );
  }
}

const appEntryPoint = document.querySelector<HTMLDivElement>("#app");

if (appEntryPoint == null) {
  throw new Error("The entry point for the application is not provided!");
}
const app = new App(appEntryPoint);
app.start();
