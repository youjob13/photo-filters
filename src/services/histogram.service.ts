import EventEmitter from "events";

export class HistogramService extends EventEmitter {
  private lastSelectedChannel: "r" | "g" | "b" | "all" | undefined;
  private imageData: ImageData | undefined;

  setImageData(imageData: ImageData) {
    this.imageData = imageData;
  }

  drawHistogram(imageData?: ImageData, channel?: "r" | "g" | "b" | "all") {
    if (channel) {
      this.lastSelectedChannel = channel;
    }
    if (imageData) {
      this.setImageData(imageData);
    }

    const data = imageData?.data ?? this.imageData?.data;

    if (data == null) {
      return;
    }

    const hist = {
      r: Array(256).fill(0),
      g: Array(256).fill(0),
      b: Array(256).fill(0),
    };

    for (let i = 0; i < data.length; i += 4) {
      hist.r[data[i]]++;
      hist.g[data[i + 1]]++;
      hist.b[data[i + 2]]++;
    }

    let maxValue = Math.max(...hist.r, ...hist.g, ...hist.b);
    let color: { r: "red"; g: "green"; b: "blue" } = {
      r: "red",
      g: "green",
      b: "blue",
    };

    switch (channel ?? this.lastSelectedChannel) {
      case "r": {
        this.emit("drawHistogram", [
          {
            channelData: hist.r,
            color: color.r,
            maxValue,
          },
        ]);
        break;
      }

      case "g": {
        this.emit("drawHistogram", [
          {
            channelData: hist.g,
            color: color.g,
            maxValue,
          },
        ]);
        break;
      }
      case "b": {
        this.emit("drawHistogram", [
          {
            channelData: hist.b,
            color: color.b,
            maxValue,
          },
        ]);
        break;
      }
      case "all":
      default: {
        this.emit("drawHistogram", [
          {
            channelData: hist.r,
            color: color.r,
            maxValue,
          },
          {
            channelData: hist.g,
            color: color.g,
            maxValue,
          },
          {
            channelData: hist.b,
            color: color.b,
            maxValue,
          },
        ]);
      }
    }
  }
}
