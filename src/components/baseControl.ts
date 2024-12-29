import { BaseElement, IBaseElementProps } from "./baseElement";

export interface IBaseControlProps extends IBaseElementProps {
  handler: (...args: any) => void;
  eventType: string;
}

export class BaseControl extends BaseElement {
  constructor(props: IBaseControlProps) {
    super({ ...props, tag: props.tag ?? "button" });

    this.element.addEventListener(props.eventType ?? "click", props.handler);
  }

  get value() {
    const element = this.element as HTMLInputElement | HTMLButtonElement;
    if ("value" in element) {
      return element.value;
    }
  }
}
