class Lower {
  constructor() {
    this.name = 'lower';
  }

  toLower(input, text) {
    if (!input) {
      return undefined;
    }
    if (typeof input === 'string') {
      return text.toLowerCase();
    }
    input.text = text.toLowerCase();
    return input;
  }

  run(input, arg) {
    const text = arg || (input.text ? input.text : input);
    return this.toLower(input, text);
  }
}

export default Lower;
