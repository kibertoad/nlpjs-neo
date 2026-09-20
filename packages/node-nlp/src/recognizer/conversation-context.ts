/**
 * Abstract class for a conversation context of a chatbot.
 * The conversation context is the responsible of storing and retrieving
 * the context scope variables based on the current conversation.
 * The getConversationContext receive the session of the chatbot, and must return
 * a promise with the context in the resolve.
 */
class ConversationContext {
  declare settings: any;

  /**
   * Constructor of the class.
   * @param {Object} settings Settings for the instance.
   */
  constructor(settings?) {
    this.settings = settings || {};
  }

  /**
   * Given a session instance of a chatbot, return the conversation identifier.
   * @param {Object} session Session instance of a message of chatbot.
   * @returns {String} Identifier of the conversation.
   */
  getConversationId(session) {
    if (
      session &&
      session.message &&
      session.message.address &&
      session.message.address.conversation
    ) {
      return session.message.address.conversation.id;
    }
    // oxlint-disable-next-line no-underscore-dangle
    if (session && session._activity && session._activity.conversation) {
      // oxlint-disable-next-line no-underscore-dangle
      return session._activity.conversation.id;
    }
    return undefined;
  }

  /**
   * Given a session, return a promise to resolve the conversation context.
   */
  getConversationContext(_session?, _conversationContext?): any {
    throw new Error('This method must be implemented by child');
  }

  /**
   * Given a session, return a promise to set the conversation context.
   */
  setConversationContext(_session?, _context?): any {
    throw new Error('This method must be implemented by child');
  }
}

export default ConversationContext;
