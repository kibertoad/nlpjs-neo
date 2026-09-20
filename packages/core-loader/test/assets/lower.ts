class Lower {
  declare register: any;

  declare name: any;

  constructor() {
    this.name = 'lower';
  }

  toLower(srcInput, text, holder, container, context) {
    const input = srcInput;
    const result = text.toLowerCase();
    if (holder && container) {
      container.setValue(holder, `"${result}"`, context, input, this);
    } else {
      input.text = result;
    }
    return input;
  }

  run(input, arg1?, arg2?) {
    let text = input.text ? input.text : input;
    let holder;
    let container;
    let context: any = {};
    if (arg1) {
      if (arg1.type === 'literal') {
        text = arg1.value;
      } else if (arg1.type === 'reference') {
        text = arg2 ? arg2.value : arg1.value;
        holder = arg1.src;
        container = arg1.container;
        context = arg1.context;
      }
    }
    return this.toLower(input, text, holder, container, context);
  }
}

export default Lower;
