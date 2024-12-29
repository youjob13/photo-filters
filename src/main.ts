import "./style.css";
import { PhotoUploader } from "./components/index";
import { PhotoEditor } from "./components/PhotoEditor/photoEditor";
import { PhotoEditorService } from "./services/photoEditor.service";

class App {
  constructor(private entryPoint: HTMLElement) {}

  start() {
    const photoEditorService = new PhotoEditorService();
    const photoUploader = new PhotoUploader({ photoEditorService });
    const photoEditor = new PhotoEditor({ photoEditorService });

    this.entryPoint.append(
      photoUploader.getElement(),
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
