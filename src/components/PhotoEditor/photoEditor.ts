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
  private canvasHistogram!: BaseElement<HTMLCanvasElement>;

  constructor(props: IPhotoEditorProps) {
    super({ ...props, tag: "div" });

    this.photoEditorService = props.photoEditorService;
    this.photoEditorService.on("updatePhotoData", (photoData) => {
      this.render(photoData);
    });
    this.photoEditorService.on("setOriginalImageData", () => {
      this.drawHistogram();
    });
    this.photoEditorService.on("drawChannelHistogram", (data) => {
      this.drawChannelHistogram(data);
    });
    this.render();
  }

  private render(photoData?: File | null) {
    this.element.innerHTML = "";
    this.createTemplate(photoData);
  }

  private createTemplate(photoData?: File | null) {
    const makeGrayBtn = new BaseControl({
      tag: "button",
      content: "Make gray",
      eventType: "click",
      handler: () => {
        this.photoEditorService.makeGray();
        this.drawHistogram();
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
        this.drawHistogram();
      },
      attributes: !photoData ? { disabled: true } : {},
    });

    this.canvasHistogram = new BaseElement<HTMLCanvasElement>({
      tag: "canvas",
    });
    const channelSelect = new Wrapper({
      tag: "select",
      handler: (event) => this.drawHistogram(event.target.value),
      children: [
        new BaseElement({
          tag: "option",
          attributes: { value: "all" },
          content: "All channels (RGB)",
        }).getElement(),
        new BaseElement({
          tag: "option",
          attributes: { value: "r" },
          content: "Red (R)",
        }).getElement(),
        new BaseElement({
          tag: "option",
          attributes: { value: "g" },
          content: "Green (G)",
        }).getElement(),
        new BaseElement({
          tag: "option",
          attributes: { value: "b" },
          content: "Blue (B)",
        }).getElement(),
      ],
    });

    const medianFilterButton = new BaseControl({
      tag: "button",
      eventType: "click",
      content: "Calculate median",
      attributes: !photoData ? { disabled: true } : {},
      handler: () => {
        this.photoEditorService.medianFilter();
        this.drawHistogram();
      },
    });

    const sharpenBtn = new BaseControl({
      tag: "button",
      eventType: "click",
      attributes: !photoData ? { disabled: true } : {},
      content: "Sharp",
      handler: () => {
        this.photoEditorService.sharpeImage();
        this.drawHistogram();
      },
    });

    const threshold1Slider = new BaseControl({
      tag: "input",
      attributes: {
        type: "range",
        min: "0",
        max: "255",
        value: "100",
        ...(!photoData ? { disabled: true } : {}),
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
        ...(!photoData ? { disabled: true } : {}),
      },
      eventType: "input",
      handler: () => {},
    });

    const applyCannyButton = new BaseControl({
      tag: "button",
      eventType: "click",
      content: "Apply Canny",
      handler: () => {
        this.photoEditorService.applyCanny(
          threshold2Slider.value!,
          threshold2Slider.value!
        );
        this.drawHistogram();
      },
    });

    const applyRobertsButton = new BaseControl({
      tag: "button",
      eventType: "click",
      content: "Apply Roberts",
      handler: () => {
        this.photoEditorService.applyRobertsFilter();
        this.drawHistogram();
      },
    });

    const motionBlurAngelInput = new BaseControl({
      tag: "input",
      attributes: {
        type: "number",
        value: "0",
      },
      eventType: "input",
      handler: () => {},
    });

    const motionBlurDistanceInput = new BaseControl({
      tag: "input",
      attributes: {
        type: "number",
        value: "0",
      },
      eventType: "input",
      handler: () => {},
    });

    const applyMotionBlurButton = new BaseControl({
      tag: "button",
      eventType: "click",
      content: "Motion Blur",
      handler: () => {
        this.photoEditorService.applyMotionBlur(
          motionBlurAngelInput.value!,
          motionBlurDistanceInput.value!
        );
        this.drawHistogram();
      },
    });

    const wrapper = new Wrapper({
      tag: "div",
      classes: ["wrapper"],
      children: [
        makeGrayBtn.getElement(),
        this.brightnessSlider.getElement(),
        this.saturationSlider.getElement(),
        this.contrastSlider.getElement(),
        this.canvasHistogram.getElement(),
        channelSelect.getElement(),
        sharpenBtn.getElement(),
        medianFilterButton.getElement(),
        threshold1Slider.getElement(),
        threshold2Slider.getElement(),
        applyCannyButton.getElement(),
        applyRobertsButton.getElement(),
        motionBlurAngelInput.getElement(),
        motionBlurDistanceInput.getElement(),
        applyMotionBlurButton.getElement(),
        resetFiltersBtn.getElement(),
      ],
    });
    this.element.append(wrapper.getElement());
  }

  private drawHistogram(event?: any) {
    const canvas = this.canvasHistogram.getElement()!;
    const ctxHistogram = canvas.getContext("2d")!;
    ctxHistogram.clearRect(
      0,
      0,
      this.canvasHistogram.getElement().width,
      this.canvasHistogram.getElement().height
    );
    this.photoEditorService.drawHistogram(event);
  }

  private drawChannelHistogram({
    channelData,
    color,
    maxValue,
  }: Parameters<PhotoEditorService["drawChannelHistogram"]>[0]) {
    const canvas = this.canvasHistogram.getElement()!;
    const ctxHistogram = canvas.getContext("2d")!;
    ctxHistogram.fillStyle = color;
    const height = canvas.height;
    const width = canvas.width;
    const barWidth = width / 256;

    for (let i = 0; i < 256; i++) {
      const heightValue = (channelData[i] / maxValue) * height;
      ctxHistogram.fillRect(
        i * barWidth,
        height - heightValue,
        barWidth,
        heightValue
      );
    }
  }

  private applyFilters() {
    this.photoEditorService.applyFilters({
      brightness: Number(this.brightnessSlider.value),
      saturation: Number(this.saturationSlider.value),
      contrast: Number(this.contrastSlider.value),
    });
    this.drawHistogram();
  }
}
