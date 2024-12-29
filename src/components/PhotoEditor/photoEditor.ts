import { PhotoEditorService } from "../../services/photoEditor.service.js";
import { BaseControl } from "../baseControl.js";
import { BaseElement, IBaseElementProps } from "../baseElement.js";
import { Wrapper } from "../wrapper.js";
import "./styles.css";

export interface IPhotoEditorProps extends IBaseElementProps {
  photoEditorService: PhotoEditorService;
}

export class PhotoEditor extends BaseElement {
  private readonly photoEditorService: PhotoEditorService;
  private brightnessSlider!: BaseControl;
  private saturationSlider!: BaseControl;
  private contrastSlider!: BaseControl;

  constructor(props: IPhotoEditorProps) {
    super({ ...props, tag: "div" });

    this.photoEditorService = props.photoEditorService;
    this.photoEditorService.on("updatePhotoData", (photoData) =>
      this.render(photoData)
    );
    this.render();
  }

  private render(photoData?: File | null) {
    this.element.innerHTML = "";
    this.createTemplate(photoData);
  }

  private createTemplate(photoData?: File | null) {
    const button = new BaseControl({
      tag: "button",
      content: "Make gray",
      eventType: "click",
      handler: () => {
        this.makeGray();
      },
      attributes: !photoData ? { disabled: true } : {},
    });

    this.brightnessSlider = new BaseControl({
      tag: "input",
      attributes: {
        type: "range",
        min: "-100",
        max: "100",
        value: "0",
        ...(!photoData ? { disabled: true } : {}),
      },
      eventType: "input",
      handler: this.applyFilters.bind(this),
    });
    this.saturationSlider = new BaseControl({
      tag: "input",
      attributes: {
        type: "range",
        min: "-100",
        max: "100",
        value: "0",
        ...(!photoData ? { disabled: true } : {}),
      },
      eventType: "input",
      handler: this.applyFilters.bind(this),
    });
    this.contrastSlider = new BaseControl({
      tag: "input",
      attributes: {
        type: "range",
        min: "-100",
        max: "100",
        value: "0",
        ...(!photoData ? { disabled: true } : {}),
      },
      eventType: "input",
      handler: this.applyFilters.bind(this),
    });

    const resetFiltersBtn = new BaseControl({
      tag: "button",
      content: "Reset filters",
      eventType: "click",
      handler: () => {
        if (!this.photoEditorService.getPhotoData()) return;
        this.photoEditorService.resetImageDataToInitial();
        this.brightnessSlider.editAttributes({ value: 0 });
        this.saturationSlider.editAttributes({ value: 0 });
        this.contrastSlider.editAttributes({ value: 0 });
      },
      attributes: !photoData ? { disabled: true } : {},
    });

    const wrapper = new Wrapper({
      tag: "div",
      classes: ["wrapper"],
      children: [
        button.getElement(),
        this.brightnessSlider.getElement(),
        this.saturationSlider.getElement(),
        this.contrastSlider.getElement(),
        resetFiltersBtn.getElement(),
      ],
    });
    this.element.append(wrapper.getElement());
  }

  private makeGray() {
    this.photoEditorService.makeGray();
  }

  private applyFilters() {
    this.photoEditorService.applyFilters({
      brightness: Number(this.brightnessSlider.value),
      saturation: Number(this.saturationSlider.value),
      contrast: Number(this.contrastSlider.value),
    });
  }
}
