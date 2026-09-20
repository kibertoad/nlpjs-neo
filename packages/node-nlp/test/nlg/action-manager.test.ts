import { ActionManager } from '../../src/index.js';

describe('Action Manager', () => {
  describe('constructor', () => {
    test('Should create an instance', () => {
      const manager = new ActionManager();
      expect(manager).toBeDefined();
    });
    test('Should initialize properties', () => {
      const manager = new ActionManager();
      expect(manager.actions).toEqual({});
    });
  });

  describe('Add actions', () => {
    test('Should be able to add an action to an intent', () => {
      const manager = new ActionManager();
      manager.addAction('intent1', 'action1', ['parameter1', 'parameter2']);
      expect(manager.actions.intent1).toHaveLength(1);
      expect(manager.actions.intent1[0].action).toEqual('action1');
      expect(manager.actions.intent1[0].parameters).toEqual([
        'parameter1',
        'parameter2',
      ]);
    });
    test('If the same action is added, then avoid it', () => {
      const manager = new ActionManager();
      manager.addAction('intent1', 'action1', ['parameter1', 'parameter2']);
      manager.addAction('intent1', 'action1', ['parameter1', 'parameter2']);
      expect(manager.actions.intent1).toHaveLength(1);
      expect(manager.actions.intent1[0].action).toEqual('action1');
      expect(manager.actions.intent1[0].parameters).toEqual([
        'parameter1',
        'parameter2',
      ]);
    });
    test('Should be able to add several actions to an intent', () => {
      const manager = new ActionManager();
      manager.addAction('intent1', 'action1', ['parameter1', 'parameter2']);
      manager.addAction('intent1', 'action2', ['parameter3', 'parameter4']);
      expect(manager.actions.intent1).toHaveLength(2);
      expect(manager.actions.intent1[0].action).toEqual('action1');
      expect(manager.actions.intent1[0].parameters).toEqual([
        'parameter1',
        'parameter2',
      ]);
      expect(manager.actions.intent1[1].action).toEqual('action2');
      expect(manager.actions.intent1[1].parameters).toEqual([
        'parameter3',
        'parameter4',
      ]);
    });
    test('Should be able to add several actions to several intents', () => {
      const manager = new ActionManager();
      manager.addAction('intent1', 'action1', ['parameter1', 'parameter2']);
      manager.addAction('intent1', 'action2', ['parameter3', 'parameter4']);
      manager.addAction('intent2', 'action3', ['parameter5', 'parameter6']);
      manager.addAction('intent2', 'action4', ['parameter7', 'parameter8']);
      expect(manager.actions.intent1).toHaveLength(2);
      expect(manager.actions.intent1[0].action).toEqual('action1');
      expect(manager.actions.intent1[0].parameters).toEqual([
        'parameter1',
        'parameter2',
      ]);
      expect(manager.actions.intent1[1].action).toEqual('action2');
      expect(manager.actions.intent1[1].parameters).toEqual([
        'parameter3',
        'parameter4',
      ]);
      expect(manager.actions.intent2).toHaveLength(2);
      expect(manager.actions.intent2[0].action).toEqual('action3');
      expect(manager.actions.intent2[0].parameters).toEqual([
        'parameter5',
        'parameter6',
      ]);
      expect(manager.actions.intent2[1].action).toEqual('action4');
      expect(manager.actions.intent2[1].parameters).toEqual([
        'parameter7',
        'parameter8',
      ]);
    });
  });

  describe('find actions', () => {
    test('Should be able to find actions of an intent', () => {
      const manager = new ActionManager();
      manager.actionsMap = {
        action1: (input) => input,
        action2: (input) => input,
        action3: (input) => input,
        action4: (input) => input,
      };
      manager.addAction('intent1', 'action1', ['parameter1', 'parameter2']);
      manager.addAction('intent1', 'action2', ['parameter3', 'parameter4']);
      manager.addAction('intent2', 'action3', ['parameter5', 'parameter6']);
      manager.addAction('intent2', 'action4', ['parameter7', 'parameter8']);

      const actions = manager.findActions('intent2');

      expect(actions).toHaveLength(2);
      expect(actions[0].action).toEqual('action3');
      expect(actions[0].parameters).toEqual(['parameter5', 'parameter6']);
      expect(actions[1].action).toEqual('action4');
      expect(actions[1].parameters).toEqual(['parameter7', 'parameter8']);
    });
  });

  describe('process actions (sync)', () => {
    test('Should be able to get an answered after process sync actions related with an intent', async () => {
      const manager = new ActionManager();
      manager.actionsMap = {
        action1: (input, ...parameters) => `[${input}!${parameters.join(',')}]`,
        action2: (input, ...parameters) => `#${input}!${parameters.join(',')}#`,
      };
      manager.addAction('intent1', 'action1', ['parameter1', 'parameter2']);
      manager.addAction('intent1', 'action2', ['parameter3', 'parameter4']);
      manager.addAction('intent1', 'action1', ['parameter5', 'parameter6']);

      const actions = manager.findActions('intent1');

      const processedAnswer = await manager.processActions(
        'intent1',
        'original answer'
      );

      expect(actions).toHaveLength(3);
      expect(actions[0].action).toEqual('action1');
      expect(actions[0].parameters).toEqual(['parameter1', 'parameter2']);
      expect(actions[1].action).toEqual('action2');
      expect(actions[1].parameters).toEqual(['parameter3', 'parameter4']);
      expect(actions[2].action).toEqual('action1');
      expect(actions[2].parameters).toEqual(['parameter5', 'parameter6']);
      expect(processedAnswer).toEqual(
        '[#[original answer!parameter1,parameter2]!parameter3,parameter4#!parameter5,parameter6]'
      );
    });
  });

  describe('process actions (async)', () => {
    test('Should be able to get an answered after process async actions related with an intent', async () => {
      const manager = new ActionManager();
      manager.actionsMap = {
        action1: (input, ...parameters) =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve(`[${input}!${parameters.join(',')}]`);
            }, 0.3);
          }),
        action2: (input, ...parameters) =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve(`#${input}!${parameters.join(',')}#`);
            }, 0.1);
          }),
      };
      manager.addAction('intent1', 'action1', ['parameter1', 'parameter2']);
      manager.addAction('intent1', 'action2', ['parameter3', 'parameter4']);
      manager.addAction('intent1', 'action1', ['parameter5', 'parameter6']);

      const actions = manager.findActions('intent1');

      const processedAnswer = await manager.processActions(
        'intent1',
        'original answer'
      );

      expect(actions).toHaveLength(3);
      expect(actions[0].action).toEqual('action1');
      expect(actions[0].parameters).toEqual(['parameter1', 'parameter2']);
      expect(actions[1].action).toEqual('action2');
      expect(actions[1].parameters).toEqual(['parameter3', 'parameter4']);
      expect(actions[2].action).toEqual('action1');
      expect(actions[2].parameters).toEqual(['parameter5', 'parameter6']);
      expect(processedAnswer).toEqual(
        '[#[original answer!parameter1,parameter2]!parameter3,parameter4#!parameter5,parameter6]'
      );
    });
  });

  describe('remove action', () => {
    test('Should be able to remove an action', () => {
      const manager = new ActionManager();
      manager.addAction('intent1', 'action1', ['parameter1', 'parameter2']);
      manager.addAction('intent1', 'action2', ['parameter3', 'parameter4']);
      manager.addAction('intent2', 'action3', ['parameter5', 'parameter6']);
      manager.addAction('intent2', 'action4', ['parameter7', 'parameter8']);
      manager.removeAction('intent1', 'action2', ['parameter3', 'parameter4']);
      expect(manager.actions.intent1).toHaveLength(1);
      expect(manager.actions.intent1[0].action).toEqual('action1');
      expect(manager.actions.intent1[0].parameters).toEqual([
        'parameter1',
        'parameter2',
      ]);
      expect(manager.actions.intent2).toHaveLength(2);
      expect(manager.actions.intent2[0].action).toEqual('action3');
      expect(manager.actions.intent2[0].parameters).toEqual([
        'parameter5',
        'parameter6',
      ]);
      expect(manager.actions.intent2[1].action).toEqual('action4');
      expect(manager.actions.intent2[1].parameters).toEqual([
        'parameter7',
        'parameter8',
      ]);
    });
    test('No error if removing non existing action', () => {
      const manager = new ActionManager();
      manager.addAction('intent1', 'action1', ['parameter1', 'parameter2']);
      manager.addAction('intent1', 'action2', ['parameter3', 'parameter4']);
      manager.addAction('intent2', 'action3', ['parameter5', 'parameter6']);
      manager.addAction('intent2', 'action4', ['parameter7', 'parameter8']);
      manager.removeAction('intent1', 'action3', ['parameter3', 'parameter4']);
      expect(manager.actions.intent1).toHaveLength(2);
      expect(manager.actions.intent2).toHaveLength(2);
    });
  });
  describe('remove actions', () => {
    test('Should be able to remove all actions of an intent', () => {
      const manager = new ActionManager();
      manager.addAction('intent1', 'action1', ['parameter1', 'parameter2']);
      manager.addAction('intent1', 'action2', ['parameter3', 'parameter4']);
      manager.addAction('intent2', 'action3', ['parameter5', 'parameter6']);
      manager.addAction('intent2', 'action4', ['parameter7', 'parameter8']);
      manager.removeActions('intent1');
      expect(manager.actions.intent1).toBeUndefined();
      expect(manager.actions.intent2).toHaveLength(2);
      expect(manager.actions.intent2[0].action).toEqual('action3');
      expect(manager.actions.intent2[0].parameters).toEqual([
        'parameter5',
        'parameter6',
      ]);
      expect(manager.actions.intent2[1].action).toEqual('action4');
      expect(manager.actions.intent2[1].parameters).toEqual([
        'parameter7',
        'parameter8',
      ]);
    });
  });
});
