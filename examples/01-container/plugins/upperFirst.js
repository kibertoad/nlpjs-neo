class UpperFirst {
  constructor() {
    this.name = 'upperFirst';
  }

  upperFirst(input) {
    input.text = `${input.text.slice(0, 1).toUpperCase()}${input.text.slice(
      1
    )}`;
    return input;
  }

  run(input) {
    return this.upperFirst(input.text ? input : { text: input });
  }
}

export default UpperFirst;
