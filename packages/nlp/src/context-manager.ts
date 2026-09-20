import { Clonable } from '@nlpjs-neo/core';

const dataName = '_data';

class ContextManager extends Clonable {
  declare contextDictionary: any;
  declare defaultData: any;
  declare onCtxUpdate: any;
  declare onGetInputContextId: any;
  declare settings: any;

  constructor(settings: any = {}, container?) {
    super(
      { settings: {}, container: settings.container || container },
      container
    );
    this.applySettings(this.settings, settings);
    if (!this.settings.tag) {
      this.settings.tag = `context-manager`;
    }
    this.registerDefault();
    this.applySettings(
      this.settings,
      this.container.getConfiguration(this.settings.tag)
    );
    this.contextDictionary = {};
    this.defaultData = {};
  }

  registerDefault() {
    this.container.registerConfiguration(
      'context-manager',
      {
        tableName: 'context',
      },
      false
    );
  }

  async getInputContextId(input) {
    let result;
    if (this.onGetInputContextId) {
      result = await this.onGetInputContextId(input);
    }
    if (!result && input && input.activity) {
      if (input.activity.address && input.activity.address.conversation) {
        result = input.activity.address.conversation.id;
      } else if (input.activity.conversation) {
        result = input.activity.conversation.id;
      }
    }
    return result;
  }

  async getContext(input) {
    const id = await this.getInputContextId(input);
    let result;
    if (id) {
      if (this.settings.tableName) {
        const database = this.container
          ? this.container.get('database')
          : undefined;
        if (database) {
          result = (await database.findOne(this.settings.tableName, {
            conversationId: id,
          })) || { conversationId: id };
        }
      }
      if (!result) {
        result = this.contextDictionary[id] || { conversationId: id };
      }
    } else {
      result = {};
    }
    result[dataName] = this.defaultData;
    return result;
  }

  async setContext(input, context) {
    const logger = this.container.get('logger');
    const id = await this.getInputContextId(input);
    if (id) {
      if (!context.id) {
        const savedContext = await this.getContext(input);
        if (savedContext) {
          context.id = savedContext.id;
        }
      }
      const keys = Object.keys(context);
      const clone = { conversationId: id };
      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        if (!key.startsWith('_')) {
          clone[key] = context[key];
        }
      }
      if (this.settings.tableName) {
        const database = this.container
          ? this.container.get('database')
          : undefined;
        if (database) {
          await database.save(this.settings.tableName, clone);
        } else {
          this.contextDictionary[id] = clone;
        }
      } else {
        this.contextDictionary[id] = clone;
      }
      if (this.onCtxUpdate) {
        logger.debug(`emmitting event onCtxUpdate...`);
        await this.onCtxUpdate(clone);
      }
    }
  }

  async resetConversations() {
    for (const cid of Object.keys(this.contextDictionary)) {
      await this.resetConversation(cid);
    }
  }

  async resetConversation(cid) {
    const logger = this.container.get('logger');
    logger.debug(`resetting context in conversation: ${cid}`);
    const conversationCtx = this.contextDictionary[cid];
    Object.keys(conversationCtx).forEach((convCtxKey) => {
      delete conversationCtx[convCtxKey];
    });
    this.contextDictionary[cid].dialogStack = [];
    this.contextDictionary[cid].variableName = undefined;
  }
}

export default ContextManager;
