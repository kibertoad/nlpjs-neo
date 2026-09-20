class Char {
  toChars(srcInput) {
    const input = srcInput;
    input.arr = input.text.split('');
    return input;
  }

  filter(srcInput) {
    const input = srcInput;
    input.arr = input.arr.filter((x) => !x.includes(input.excludeChars));
    return input;
  }

  run(input) {
    return this.toChars(input.text ? input : { text: input });
  }
}

export default Char;
