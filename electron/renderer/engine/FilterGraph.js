export class FilterGraph {
  constructor() {
    this.steps = [];
  }

  add(filter) {
    if (filter) this.steps.push(filter);
    return this;
  }

  compile(output = "vout") {
    return `${this.steps.filter(Boolean).join(",")}[${output}]`;
  }
}