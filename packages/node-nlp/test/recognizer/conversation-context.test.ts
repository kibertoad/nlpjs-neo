import { ConversationContext } from '../../src/index.js';
import type { BotSession } from '../../src/types.js';

describe('Conversation Context', () => {
  describe('Constructor', () => {
    test('It should create an instance', () => {
      const context = new ConversationContext();
      expect(context).toBeDefined();
    });
  });
  describe('Get conversation id', () => {
    test('It should return the conversation id if provided in the session', () => {
      const expected = 'a1b2c3';
      const session = {
        message: {
          address: {
            conversation: {
              id: expected,
            },
          },
        },
      };
      const context = new ConversationContext();
      const result = context.getConversationId(session);
      expect(result).toEqual(expected);
    });
    test('It should return the conversation id if provided in the an v4 session', () => {
      const expected = 'a1b2c3';
      const session = {
        _activity: {
          conversation: {
            id: expected,
          },
        },
      };
      const context = new ConversationContext();
      const result = context.getConversationId(session);
      expect(result).toEqual(expected);
    });
    test('It should return undefined if the session does not provide a conversation identifier', () => {
      const session = {
        message: {
          address: {
            conversation: {
              pid: 'a1b2c3',
            },
          },
        },
      };
      const context = new ConversationContext();
      const result = context.getConversationId(session as BotSession);
      expect(result).toBeUndefined();
    });
    test('It should return undefined if the session does not provide a conversation', () => {
      const session = {
        message: {
          address: {},
        },
      };
      const context = new ConversationContext();
      const result = context.getConversationId(session as BotSession);
      expect(result).toBeUndefined();
    });
    test('It should return undefined if the session does not provide an address', () => {
      const session = {
        message: {},
      };
      const context = new ConversationContext();
      const result = context.getConversationId(session as BotSession);
      expect(result).toBeUndefined();
    });
    test('It should return undefined if the session does not provide a message', () => {
      const session: BotSession = {};
      const context = new ConversationContext();
      const result = context.getConversationId(session as BotSession);
      expect(result).toBeUndefined();
    });
    test('It should return undefined if the session is not provided', () => {
      const context = new ConversationContext();
      const result = context.getConversationId(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe('Get conversation context', () => {
    test('It should throw an error', () => {
      const context = new ConversationContext();
      expect(() => context.getConversationContext()).toThrow(
        'This method must be implemented by child'
      );
    });
  });
  describe('Set conversation context', () => {
    test('It should throw an error', () => {
      const context = new ConversationContext();
      expect(() => context.setConversationContext()).toThrow(
        'This method must be implemented by child'
      );
    });
  });
});
