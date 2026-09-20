import CollectionMock from './collection-mock.js';

class MongoClientMock {
  constructor() {
    this.collections = {};
  }

  connect(cb) {
    cb(undefined, this);
  }

  close() {}

  db() {
    return this;
  }

  collection(name) {
    if (!this.collections[name]) {
      this.collections[name] = new CollectionMock();
    }
    return this.collections[name];
  }
}

export default MongoClientMock;
