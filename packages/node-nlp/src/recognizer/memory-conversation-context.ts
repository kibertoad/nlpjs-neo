import ConversationContext from './conversation-context.js';

/**
 * In memory conversation context manager.
 */
class MemoryConversationContext extends ConversationContext {
  declare conversationContexts: any;

  /**
   * Constructor of the class.
   * @param {Object} settings Settings for the instance.
   */
  constructor(settings?) {
    super(settings);
    this.conversationContexts = {};
  }

  /**
   * Gets the conversation context from the session.
   * @param {Object} session Chatbot session of the conversation.
   * @returns {Promise<Object>} Promise to resolve the conversation context.
   */
  getConversationContext(session, _conversationContext?) {
    return new Promise((resolve, reject) => {
      const conversationId = this.getConversationId(session);
      if (!conversationId) {
        return reject(new Error('No conversation id found'));
      }
      if (!this.conversationContexts[conversationId]) {
        this.conversationContexts[conversationId] = {};
      }
      return resolve(this.conversationContexts[conversationId]);
    });
  }

  setConversationContext(session, context) {
    return new Promise<void>((resolve, reject) => {
      const conversationId = this.getConversationId(session);
      if (!conversationId) {
        return reject(new Error('No conversation id found'));
      }
      this.conversationContexts[conversationId] = context;
      return resolve();
    });
  }
}

export default MemoryConversationContext;
