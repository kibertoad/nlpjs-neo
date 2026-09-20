import { MemoryConversationContext } from '../../src/index.js';

describe('MemoryConversation Context', () => {
  describe('Constructor', () => {
    test('It should create an instance', () => {
      const context = new MemoryConversationContext();
      expect(context).toBeDefined();
    });
    test('The instance should initialize the properties', () => {
      const context = new MemoryConversationContext();
      expect(context.conversationContexts).toBeDefined();
    });
  });

  describe('Get conversation context', () => {
    test('It should return a new context if if the conversation identifier is valid', async () => {
      const session = {
        message: {
          address: {
            conversation: {
              id: 'a1b2c3',
            },
          },
        },
      };
      const context = new MemoryConversationContext();
      const conversationContext = await context.getConversationContext(session);
      expect(conversationContext).toBeDefined();
      expect(conversationContext).toEqual({});
    });
    test('It should reject if the conversation id does not exists', async () => {
      const session = {
        message: {
          address: {
            conversation: {},
          },
        },
      };
      const context = new MemoryConversationContext();
      expect.assertions(1);

      await expect(context.getConversationContext(session)).rejects.toThrow(
        'No conversation id found'
      );
    });
    test('It should return the same object if called second time with same conversation id', async () => {
      const session = {
        message: {
          address: {
            conversation: {
              id: 'a1b2c3',
            },
          },
        },
      };
      const context = new MemoryConversationContext();
      const conversationContext = await context.getConversationContext(session);
      const conversationContext2 =
        await context.getConversationContext(session);
      expect(conversationContext2).toBe(conversationContext);
    });
    test('It should return a different object if called with different conversation id', async () => {
      const session1 = {
        message: {
          address: {
            conversation: {
              id: 'a1b2c3',
            },
          },
        },
      };
      const session2 = {
        message: {
          address: {
            conversation: {
              id: 'a1b2c4',
            },
          },
        },
      };
      const context = new MemoryConversationContext();
      const conversationContext1 =
        await context.getConversationContext(session1);
      const conversationContext2 =
        await context.getConversationContext(session2);
      expect(conversationContext2).not.toBe(conversationContext1);
    });
  });
  describe('Set conversation context', () => {
    test('It should set a conversation context', async () => {
      const context = new MemoryConversationContext();
      const session = {
        message: {
          address: {
            conversation: {
              id: 'a1b2c3',
            },
          },
        },
      };
      const conversationContext = { a: 1 };
      await context.setConversationContext(session, conversationContext);
      const conversationContext1 =
        await context.getConversationContext(session);
      expect(conversationContext1).toBe(conversationContext);
    });
    test('It should reject if the conversation id does not exists', async () => {
      const session = {
        message: {
          address: {
            conversation: {},
          },
        },
      };
      const context = new MemoryConversationContext();
      expect.assertions(1);
      const conversationContext = { a: 1 };

      await expect(
        context.getConversationContext(session, conversationContext)
      ).rejects.toThrow('No conversation id found');
    });
  });
});
