import { containerBootstrap } from '@nlpjs-neo/core';
import { Connector } from '../src/index.js';
import type { ConnectorSettings } from '../src/index.js';

// A connector reads its settings as an open bag, and these tests hand it the
// container in their place, as the constructor has always allowed.
const container = containerBootstrap() as unknown as ConnectorSettings;
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
