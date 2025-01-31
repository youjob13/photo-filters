import { PhotoEditorService } from "../../services/photoEditor.service.js";
import { BaseControl } from "../baseControl.js";
import { BaseElement, IBaseElementProps } from "../baseElement.js";
import { Wrapper } from "../wrapper.js";
import { FilterWrapper } from "./filterWrapper.js";
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
    this.photoEditorService.on("setNewPhotoData", (imageData) => {
      this.render(imageData);
    });
    this.render();
  }

  private render(imageData?: ImageData | null) {
    this.element.innerHTML = "";
    this.createTemplate(imageData);
  }

  private createTemplate(imageData?: ImageData | null) {
    const grayFilterComponent = new FilterWrapper(
      "Gray filter",
      new BaseControl({
        tag: "button",
        content: "Make gray",
        eventType: "click",
        handler: () => {
          this.photoEditorService.applyFilter("gray");
        },
        attributes: !imageData ? { disabled: true } : {},
      })
    );

    this.brightnessSlider = new BaseControl({
      tag: "input",
      attributes: {
        type: "range",
        min: "-100",
        max: "100",
        value: "0",
        ...(!imageData ? { disabled: true } : {}),
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
        ...(!imageData ? { disabled: true } : {}),
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
        ...(!imageData ? { disabled: true } : {}),
      },
      eventType: "input",
      handler: this.applyFilters.bind(this),
    });

    const bscFilter = new FilterWrapper("Brightness|Saturation|Contrast", [
      this.brightnessSlider,
      this.saturationSlider,
      this.contrastSlider,
    ]);

    const medianFilter = new FilterWrapper(
      "Median",
      new BaseControl({
        tag: "button",
        eventType: "click",
        content: "Calculate median",
        attributes: !imageData ? { disabled: true } : {},
        handler: () => {
          this.photoEditorService.applyFilter("median");
        },
      })
    );

    const sharpenFilter = new FilterWrapper(
      "Sharp",
      new BaseControl({
        tag: "button",
        eventType: "click",
        attributes: !imageData ? { disabled: true } : {},
        content: "Sharp",
        handler: () => {
          this.photoEditorService.applyFilter("sharpen");
        },
      })
    );

    const threshold1Slider = new BaseControl({
      tag: "input",
      attributes: {
        type: "range",
        min: "0",
        max: "255",
        value: "100",
        ...(!imageData ? { disabled: true } : {}),
      },
      eventType: "input",
      handler: () => {},
    });
    const threshold2Slider = new BaseControl({
      tag: "input",
      attributes: {
        type: "range",
        min: "0",
        max: "255",
        value: "100",
        ...(!imageData ? { disabled: true } : {}),
      },
      eventType: "input",
      handler: () => {},
    });
    const applyCannyButton = new BaseControl({
      tag: "button",
      eventType: "click",
      content: "Apply Canny",
      attributes: !imageData ? { disabled: true } : {},
      handler: () => {
        this.photoEditorService.applyFilter(
          "canny",
          threshold2Slider.value,
          threshold2Slider.value
        );
      },
    });

    const cannyFilter = new FilterWrapper("Canny", [
      threshold1Slider,
      threshold2Slider,
      applyCannyButton,
    ]);

    const robertsFilter = new FilterWrapper(
      "Roberts",
      new BaseControl({
        tag: "button",
        eventType: "click",
        content: "Apply Roberts",
        attributes: !imageData ? { disabled: true } : {},
        handler: () => {
          this.photoEditorService.applyFilter("roberts");
        },
      })
    );

    const motionBlurAngelInput = new BaseControl({
      tag: "input",
      attributes: {
        type: "number",
        value: "0",
        ...(!imageData ? { disabled: true } : {}),
      },
      eventType: "input",
      handler: () => {},
    });
    const motionBlurDistanceInput = new BaseControl({
      tag: "input",
      attributes: {
        type: "number",
        value: "0",
        ...(!imageData ? { disabled: true } : {}),
      },
      eventType: "input",
      handler: () => {},
    });
    const applyMotionBlurButton = new BaseControl({
      tag: "button",
      eventType: "click",
      content: "Motion Blur",
      attributes: !imageData ? { disabled: true } : {},
      handler: () => {
        this.photoEditorService.applyFilter(
          "motion",
          motionBlurAngelInput.value,
          motionBlurDistanceInput.value
        );
      },
    });

    const motionBlurFilter = new FilterWrapper("Motion Blur", [
      motionBlurAngelInput,
      motionBlurDistanceInput,
      applyMotionBlurButton,
    ]);

    const resetFiltersBtn = new BaseControl({
      tag: "button",
      content: "Reset filters",
      eventType: "click",
      handler: () => {
        this.photoEditorService.resetImageDataToInitial();
        this.brightnessSlider.editAttributes({ value: 0 });
        this.saturationSlider.editAttributes({ value: 0 });
        this.contrastSlider.editAttributes({ value: 0 });
      },
      attributes: !imageData ? { disabled: true } : {},
    });

    const wrapper = new Wrapper({
      tag: "div",
      classes: ["wrapper"],
      children: [
        grayFilterComponent.getElement(),
        bscFilter.getElement(),
        sharpenFilter.getElement(),
        medianFilter.getElement(),
        cannyFilter.getElement(),
        robertsFilter.getElement(),
        motionBlurFilter.getElement(),
        resetFiltersBtn.getElement(),
      ],
    });
    this.element.append(wrapper.getElement());
  }

  private applyFilters() {
    this.photoEditorService.applyFilter("bsc", {
      brightness: Number(this.brightnessSlider.value),
      saturation: Number(this.saturationSlider.value),
      contrast: Number(this.contrastSlider.value),
    });
  }
}
