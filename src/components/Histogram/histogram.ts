import { HistogramService } from "../../services/histogram.service.js";
import { BaseElement, IBaseElementProps } from "../baseElement.js";
import { Wrapper } from "../wrapper.js";

export interface IHistogramProps extends IBaseElementProps {
  histogramService: HistogramService;
}

type HistogramData = {
  channelData: any[];
  color: "green" | "blue" | "red";
  maxValue: number;
};

export class Histogram extends BaseElement {
  private readonly histogramService: HistogramService;
  private canvasHistogram!: BaseElement<HTMLCanvasElement>;

  constructor(props: IHistogramProps) {
    super({ ...props, tag: "div" });

    this.histogramService = props.histogramService;
    this.histogramService.on("drawHistogram", (data) => {
      this.drawHistogram(data);
    });

    this.canvasHistogram = new BaseElement<HTMLCanvasElement>({
      tag: "canvas",
    });

    const channelSelect = new Wrapper({
      tag: "select",
      handler: (event) => {
        this.histogramService.drawHistogram(undefined, event.target.value);
      },
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

    this.element.append(
      this.canvasHistogram.getElement(),
      channelSelect.getElement()
    );
  }

  private drawHistogram(histogramData: HistogramData[]) {
    const canvas = this.canvasHistogram.getElement()!;
    const ctxHistogram = canvas.getContext("2d")!;

    const height = canvas.height;
    const width = canvas.width;
    ctxHistogram.clearRect(0, 0, width, height);

    for (const { color, channelData, maxValue } of histogramData) {
      ctxHistogram.fillStyle = color;
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
  }
}
