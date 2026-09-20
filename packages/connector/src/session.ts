import { uuid } from '@nlpjs-neo/core';

const localeDangle = '_localization';

class Session {
  declare activity: any;
  declare app: any;
  declare bot: any;
  declare channel: any;
  declare channelId: any;
  declare connector: any;
  declare conv: any;
  declare conversation: any;
  declare fbContext: any;
  declare from: any;
  declare id: any;
  declare inputHint: any;
  declare parent: any;
  declare recipient: any;
  declare replyToId: any;
  declare req: any;
  declare res: any;
  declare serviceUrl: any;
  declare suggestedActions: any;
  declare template: any;
  declare text: any;
  declare type: any;

  constructor(connector: any = {}, activity: any = {}) {
    this.activity = activity;
    this.connector = connector;
    this.bot = this.connector.container.get('bot');
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

    this.template = this.bot ? this.bot.container.get('Template') : undefined;
    this.suggestedActions = undefined;
  }

  beginDialog(context, name) {
    this.bot.dialogManager.beginDialog(context.dialogStack, name);
  }

  endDialog(context) {
    this.bot.dialogManager.endDialog(context.dialogStack);
  }

  restartDialog(context) {
    this.bot.dialogManager.restartDialog(context.dialogStack);
  }

  createMessage() {
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

  addSuggestedActions(actions) {
    if (typeof actions === 'string') {
      const objActions: any[] = [];
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

  async say(srcMessage, context?) {
    let message;
    if (typeof srcMessage === 'string') {
      message = this.createMessage();
      if (context && context[localeDangle]) {
        message.text = context[localeDangle].getLocalized(
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

  async sendCard(card, context) {
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
