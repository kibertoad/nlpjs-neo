import { uuid } from '@nlpjs-neo/core';
import type Connector from './connector.js';
import type {
  Activity,
  Bot,
  ChannelAccount,
  ConversationAccount,
  ConversationContext,
  Localizer,
  Message,
  SuggestedAction,
  TemplateCompiler,
} from './types.js';

const localeDangle = '_localization';

/**
 * One turn of a conversation: the activity that arrived, and the channel to
 * answer it on.
 *
 * The channel connectors that build on this one add their own properties --
 * the Express request and response of a web hook, the Facebook context, the
 * parent session of a sub dialog -- so those are declared here rather than
 * appearing out of nowhere on the instance.
 */
class Session {
  declare activity: Activity;
  /** Name of the app the session belongs to, for the connectors that group. */
  declare app: string | undefined;
  declare bot: Bot | undefined;
  declare channel: string | undefined;
  declare channelId: string;
  declare connector: Connector;
  /** Conversation state, when a connector carries it on the session. */
  declare conv: ConversationContext | undefined;
  declare conversation: ConversationAccount;
  /** Facebook Messenger context, set by that connector. */
  declare fbContext: unknown;
  declare from: ChannelAccount;
  declare id: string;
  declare inputHint: string;
  /** Session this one was started from, for a sub dialog. */
  declare parent: Session | undefined;
  declare recipient: ChannelAccount | undefined;
  declare replyToId: string | undefined;
  /** Inbound request of a web hook connector. */
  declare req: unknown;
  /** Outbound response of a web hook connector. */
  declare res: unknown;
  declare serviceUrl: string | undefined;
  declare suggestedActions: SuggestedAction[] | undefined;
  declare template: TemplateCompiler | undefined;
  declare text: string | undefined;
  declare type: string;

  constructor(connector: Connector, activity: Activity = {}) {
    this.activity = activity;
    this.connector = connector;
    this.bot = this.connector.container.get<Bot>('bot');
    if (!this.connector.settings) {
      this.connector.settings = {};
    }
    this.type = 'message';
    this.serviceUrl = this.activity.serviceUrl;
    this.channelId =
      this.activity.channelId || this.connector.settings.tag || 'emulator';
    this.conversation = {
      id: activity.conversation ? activity.conversation.id : 'conversation',
    };
    this.text = this.activity.text;
    this.recipient = this.activity.from;
    this.inputHint = this.activity.inputHint || 'acceptingInput';
    this.replyToId = this.activity.id;
    this.id = uuid();
    this.from = {
      id: process.env.BACKEND_ID || this.connector.settings.tag || 'emulator',
      name:
        process.env.BACKEND_NAME || this.connector.settings.tag || 'emulator',
    };

    this.template = this.bot
      ? this.bot.container.get<TemplateCompiler>('Template')
      : undefined;
    this.suggestedActions = undefined;
  }

  beginDialog(context: ConversationContext, name: string): void {
    this.bot.dialogManager.beginDialog(context.dialogStack, name);
  }

  endDialog(context: ConversationContext): void {
    this.bot.dialogManager.endDialog(context.dialogStack);
  }

  restartDialog(context: ConversationContext): void {
    this.bot.dialogManager.restartDialog(context.dialogStack);
  }

  createMessage(): Message {
    return {
      type: 'message',
      serviceUrl: this.serviceUrl,
      channelId: this.channelId,
      conversation: this.conversation,
      recipient: this.recipient,
      inputHint: this.inputHint,
      replyToId: this.replyToId,
      id: uuid(),
      from: this.from,
    };
  }

  /** Offers buttons with the next answer, as objects or as `a|b|c`. */
  addSuggestedActions(actions: string | SuggestedAction[]): void {
    if (typeof actions === 'string') {
      const objActions: SuggestedAction[] = [];
      const tokens = actions.split('|');
      for (let i = 0; i < tokens.length; i += 1) {
        const obj = {
          type: 'imBack',
          title: tokens[i],
          value: tokens[i],
        };
        objActions.push(obj);
      }
      this.addSuggestedActions(objActions);
    } else {
      this.suggestedActions = actions;
    }
  }

  async say(
    srcMessage: string | Message,
    context?: ConversationContext
  ): Promise<void> {
    let message: Message;
    if (typeof srcMessage === 'string') {
      message = this.createMessage();
      if (context && context[localeDangle]) {
        message.text = (context[localeDangle] as Localizer).getLocalized(
          context.locale || 'en',
          srcMessage
        );
      } else {
        message.text = srcMessage;
      }
    } else {
      message = srcMessage;
    }
    if (this.suggestedActions) {
      message.suggestedActions = { actions: this.suggestedActions };
      this.suggestedActions = undefined;
    }
    if (context) {
      if (this.template) {
        message = this.template.compile(message, context);
      }
    }
    await this.connector.say(message, this, context);
  }

  async sendCard(
    card: Record<string, unknown>,
    context?: ConversationContext
  ): Promise<void> {
    let message = this.createMessage();
    const keys = Object.keys(card);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (!message[key]) {
        message[key] = card[key];
      }
    }
    if (context && this.template) {
      message = this.template.compile(message, context);
    }
    await this.connector.say(message, this, context);
  }
}

export default Session;
