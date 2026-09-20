class Lookup {
  declare dict: any;
  declare items: any;

  constructor(data?, propName = 'input') {
    this.dict = {};
    this.items = [];
    if (data) {
      this.buildFromData(data, propName);
    }
  }

  add(key) {
    if (this.dict[key] === undefined) {
      this.dict[key] = this.items.length;
      this.items.push(key);
    }
  }

  buildFromData(data, propName) {
    for (let i = 0; i < data.length; i += 1) {
      const item = data[i][propName];
      const keys = Object.keys(item);
      for (let j = 0; j < keys.length; j += 1) {
        this.add(keys[j]);
      }
    }
  }

  prepare(item) {
    const keys = Object.keys(item);
    const resultKeys: any[] = [];
    const resultData: any = {};
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (this.dict[key] !== undefined) {
        resultKeys.push(this.dict[key]);
        resultData[this.dict[key]] = item[key];
      }
    }
    return {
      keys: resultKeys,
      data: resultData,
    };
  }
}

export default Lookup;
