class Split {
  constructor() {
    this.name = 'split';
  }

  split(input) {
    input.splitted = input.text.split('');
    return input;
  }

  run(input) {
    return this.split(input.text ? input : { text: input });
  }
}

export default Split;
