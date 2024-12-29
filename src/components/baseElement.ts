export type IBaseElementProps = Partial<{
  id: string;
  tag: string;
  classes: string[];
  attributes: Record<string, string | boolean>;
  title: string;
  styles: Record<string, string>;
  content: string | Node;
}>;

export class BaseElement<THtmlElement extends HTMLElement = HTMLElement> {
  protected element: THtmlElement;
  constructor({
    tag,
    id,
    classes,
    attributes,
    title,
    content,
    styles,
  }: IBaseElementProps) {
    if (tag == null) {
      throw new Error("Required tag prop is missing");
    }
    this.element = document.createElement(tag) as THtmlElement;
    if (id) {
      this.element.id = id;
    }

    if (title) {
      this.element.title = title;
    }

    if (styles) {
      Object.keys(styles).forEach((key) => {
        this.element.style[key as any] = styles[key];
      });
    }

    if (classes) {
      this.element.classList.add(...classes);
    }
    if (attributes) {
      Object.keys(attributes).forEach((key) => {
        // @ts-ignore
        this.element.setAttribute(key, attributes[key]);
      });
    }
    if (content) {
      this.element.append(content);
    }
  }

  editAttributes(attributes: Record<string, string | number | boolean>) {
    Object.keys(attributes).forEach((key) => {
      // @ts-ignore
      this.element.setAttribute(key, attributes[key]);
    });
  }

  getElement() {
    return this.element;
  }
}
