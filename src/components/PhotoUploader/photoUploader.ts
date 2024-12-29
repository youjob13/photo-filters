import { PhotoEditorService } from "../../services/photoEditor.service.js";
import { formatBytes, toUppercase } from "../../utils.js";
import { BaseControl } from "../baseControl.js";
import { BaseElement, IBaseElementProps } from "../baseElement.js";
import { Wrapper } from "../wrapper.js";
import "./styles.css";
import cv from "@techstark/opencv-js";

export interface IPhotoUploaderProps extends IBaseElementProps {
  photoEditorService: PhotoEditorService;
}

export class PhotoUploader extends BaseElement {
  private photoEditorService: PhotoEditorService;
  private canvas!: BaseElement<HTMLCanvasElement>;

  constructor(props: IPhotoUploaderProps) {
    super({ ...props, tag: "div" });

    this.photoEditorService = props.photoEditorService;
    this.photoEditorService.on("updateImage", (imageData) =>
      this.updateImage(imageData)
    );
    this.photoEditorService.on("updateImageDataWithOpenCV", (data) => {
      cv.imshow(this.canvas.getElement(), data);
    });
    this.createTemplate();
  }

  createTemplate() {
    const label = new BaseElement({
      tag: "h2",
      content: "Upload photo to modify",
    });
    this.canvas = new BaseElement({
      tag: "canvas",
      classes: ["photo-viewer"],
    });
    const photoInfoWrapper = new Wrapper({
      children: [],
      classes: ["photo-info-wrapper"],
    });
    const inputUploader = new BaseControl({
      tag: "input",
      attributes: { type: "file" },
      eventType: "change",
      handler: (event) => this.drawPhoto(event, photoInfoWrapper),
    });

    const wrapper = new Wrapper({
      tag: "div",
      classes: ["wrapper"],
      children: [
        label.getElement(),
        inputUploader.getElement(),
        this.canvas.getElement(),
        photoInfoWrapper.getElement(),
      ],
    });
    this.element.append(wrapper.getElement());
  }

  private drawPhoto(event: any, photoInfoWrapper: Wrapper) {
    const target = event.target;
    const files = target.files;
    const image = files[0];

    const fileReader = new FileReader();
    fileReader.onload = ({ target }) => {
      const result = target!.result as string;
      const img = new Image();
      img.onload = () => {
        const photoInfo = this.updatePhotoInfo({
          name: image.name,
          size: formatBytes(image.size),
          width: `${img.width}px`,
          height: `${img.height}px`,
        });
        photoInfoWrapper.updateContent(photoInfo);
        this.drawImage(img);
      };
      img.src = result;
    };
    fileReader.readAsDataURL(image);
  }

  private drawImage(img: CanvasImageSource) {
    const canvas = this.canvas.getElement();
    const ctx = canvas.getContext("2d")!;
    canvas.width = img.width as number;
    canvas.height = img.height as number;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(
      0,
      0,
      img.width as number,
      img.height as number
    );
    this.photoEditorService.setNewPhotoData(imageData);
  }

  private updateImage(imageData: ImageData) {
    const canvas = this.canvas.getElement();
    const ctx = canvas.getContext("2d")!;
    ctx.putImageData(imageData, 0, 0);
  }

  private updatePhotoInfo(
    info: Record<"name" | "size" | "width" | "height", string | number>
  ) {
    return Object.keys(info).map((key) => {
      return new BaseElement({
        tag: "p",
        content: `${toUppercase(key)}: ${info[
          key as keyof typeof info
        ].toString()}`,
      }).getElement();
    });
  }
}
