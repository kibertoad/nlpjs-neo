class Reverse {
  constructor() {
    this.name = 'reverse';
  }

  reverse(input) {
    input.splitted = input.splitted.reverse();
    return input;
  }

  run(input) {
    return this.reverse(input.splitted ? input : { splitted: input });
  }
}

export default Reverse;
