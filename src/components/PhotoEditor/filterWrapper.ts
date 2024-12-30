import { BaseControl } from "../baseControl";
import { BaseElement } from "../baseElement";

export class FilterWrapper extends BaseElement {
  constructor(
    filterName: string,
    filterComponent: BaseControl[] | BaseControl
  ) {
    super({ tag: "div", classes: ["filter-wrapper"] });

    const filterNameComponent = new BaseElement({
      tag: "p",
      content: filterName,
    });
    this.element.append(
      filterNameComponent.getElement(),
      ...(Array.isArray(filterComponent)
        ? filterComponent.map((component) => component.getElement())
        : [filterComponent.getElement()])
    );
  }
}
