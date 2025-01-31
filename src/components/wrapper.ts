import { BaseElement } from "./baseElement.js";

export interface IWrapperProps {
  wrapper?: HTMLElement;
  tag?: string;
  classes?: string[];
  children: HTMLElement[];
  content?: string | Node;
  handler?: (...args: any) => void;
  eventType?: string;
}

export class Wrapper {
  private element: HTMLElement;

  constructor({
    wrapper,
    tag,
    classes,
    children,
    content,
    handler,
    eventType,
  }: IWrapperProps) {
    if (wrapper != null && wrapper instanceof HTMLElement) {
      wrapper.append(...children);
      this.element = wrapper;
    }

    this.element = new BaseElement({
      tag: tag || "div",
      classes,
      content,
    }).getElement();

    if (children) {
      this.element.append(...children);
    }

    if (handler == null) {
      return;
    }
    this.element.addEventListener(eventType ?? "click", handler);
  }

  updateContent(children: HTMLElement[]) {
    this.element.innerHTML = "";
    this.element.append(...children);
  }

  getElement() {
    return this.element;
  }
}
