class Join {
  constructor() {
    this.name = 'join';
  }

  join(input) {
    input.text = input.splitted.join('');
    return input;
  }

  run(input) {
    return this.join(input.splitted ? input : { splitted: input });
  }
}

export default Join;
