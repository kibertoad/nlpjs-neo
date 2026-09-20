import { containerBootstrap } from '@nlpjs-neo/core';
import { Connector } from '../src/index.js';

const container = containerBootstrap();
class TestConnector extends Connector {}

describe('Connector', () => {
  describe('Constructor', () => {
    test('Constructor', () => {
      const connector = new Connector(container);
      expect(connector).toBeDefined();
      expect(connector.settings.tag).toEqual('connector');
    });
    test('Child constructor', () => {
      const connector = new TestConnector(container);
      expect(connector).toBeDefined();
      expect(connector.settings.tag).toEqual('test');
    });
  });
});
