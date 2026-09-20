import { Clonable } from '@nlpjs-neo/core';
import type { Container, ContainerHolder, Logger } from '@nlpjs-neo/core';
import type {
  Context,
  ContextDatabase,
  ContextIdResolver,
  ContextInput,
  ContextManagerSettings,
  ContextUpdateHandler,
} from './types.js';

const dataName = '_data';

class ContextManager extends Clonable {
  /** Contexts kept in memory, by conversation id, when no database is set up. */
  declare contextDictionary: Record<string, Context>;
  /** Values every context starts with, as a corpus may declare them. */
  declare defaultData: Record<string, unknown>;
  /** Called with the stored context every time one is written. */
  declare onCtxUpdate: ContextUpdateHandler | undefined;
  /** Answers the conversation id of an input, ahead of the default rules. */
  declare onGetInputContextId: ContextIdResolver | undefined;
  declare settings: ContextManagerSettings;

  constructor(
    settings: ContextManagerSettings = {},
    container?: ContainerHolder
  ) {
    super(
      {
        settings: {},
        container:
          settings.container ||
          (container &&
            ((container as { container?: Container }).container ||
              (container as Container))),
      },
      container as Container
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

  registerDefault(): void {
    this.container.registerConfiguration(
      'context-manager',
      {
        tableName: 'context',
      },
      false
    );
  }

  async getInputContextId(
    input: ContextInput
  ): Promise<string | number | undefined> {
    let result: string | number | undefined;
    if (this.onGetInputContextId) {
      result = (await this.onGetInputContextId(input)) as
        | string
        | number
        | undefined;
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

  async getContext(input: ContextInput): Promise<Context> {
    const id = await this.getInputContextId(input);
    let result: Context | undefined;
    if (id) {
      if (this.settings.tableName) {
        const database = this.container
          ? this.container.get<ContextDatabase>('database')
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

  async setContext(input: ContextInput, context: Context): Promise<void> {
    const logger = this.container.get<Logger>('logger');
    const id = await this.getInputContextId(input);
    if (id) {
      if (!context.id) {
        const savedContext = await this.getContext(input);
        if (savedContext) {
          context.id = savedContext.id;
        }
      }
      const keys = Object.keys(context);
      // Keys that start with `_` are per turn state, not worth storing.
      const clone: Context = { conversationId: id };
      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        if (!key.startsWith('_')) {
          clone[key] = context[key];
        }
      }
      if (this.settings.tableName) {
        const database = this.container
          ? this.container.get<ContextDatabase>('database')
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

  async resetConversations(): Promise<void> {
    for (const cid of Object.keys(this.contextDictionary)) {
      await this.resetConversation(cid);
    }
  }

  async resetConversation(cid: string): Promise<void> {
    const logger = this.container.get<Logger>('logger');
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
