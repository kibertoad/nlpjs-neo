import type { Settings } from '@nlpjs-neo/core-loader';
import ConversationContext from './conversation-context.js';
import type { BotSession, RecognizerContext } from '../types.js';

/**
 * In memory conversation context manager.
 */
class MemoryConversationContext extends ConversationContext {
  declare conversationContexts: Record<string, RecognizerContext>;

  /**
   * Constructor of the class.
   * @param {Object} settings Settings for the instance.
   */
  constructor(settings?: Settings) {
    super(settings);
    this.conversationContexts = {};
  }

  /**
   * Gets the conversation context from the session.
   * @param {Object} session Chatbot session of the conversation.
   * @returns {Promise<Object>} Promise to resolve the conversation context.
   */
  getConversationContext(
    session: BotSession,
    _conversationContext?: RecognizerContext
  ): Promise<RecognizerContext> {
    return new Promise<RecognizerContext>((resolve, reject) => {
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

  setConversationContext(
    session: BotSession,
    context: RecognizerContext
  ): Promise<void> {
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
