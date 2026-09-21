import type { NlpResult } from '@nlpjs-neo/nlp';
import { NlpManager } from '../nlp/index.js';
import MemoryConversationContext from './memory-conversation-context.js';
import type ConversationContext from './conversation-context.js';
import type {
  BotFrameworkBot,
  BotSession,
  RecognizeCallback,
  RecognizerAction,
  RecognizerContext,
  RecognizerSettings,
  RoutingHandler,
} from '../types.js';

/**
 * Microsoft Bot Framework compatible recognizer for nlp.js.
 */
class Recognizer {
  /** Functions an intent may name, by action name. */
  declare actions: Record<string, RecognizerAction>;
  declare conversationContext: ConversationContext;
  declare nlpManager: NlpManager;
  /** Decides whether the recognizer takes over a message at all. */
  declare onBeginRouting: RoutingHandler | undefined;
  declare onNoTextRouting: RoutingHandler | undefined;
  declare onRecognizedRouting: RoutingHandler | undefined;
  declare onUnrecognizedRouting: RoutingHandler | undefined;
  declare settings: RecognizerSettings;
  /** Below this score, an answer counts as unrecognized. */
  declare threshold: number;

  /**
   * Constructor of the class.
   * @param {Object} settings Settings for the instance.
   */
  constructor(settings?: RecognizerSettings) {
    this.settings = settings || {};
    this.nlpManager =
      (this.settings.nlpManager as NlpManager) ||
      new NlpManager({
        container: this.settings.container,
        ner: { threshold: this.settings.nerThreshold || 1 },
      });
    // All three slots reach the settings through an index signature, so the
    // shape of the action map is only known here.
    this.actions = (this.settings.actions ||
      this.settings.action ||
      this.nlpManager.settings?.action ||
      {}) as Record<string, RecognizerAction>;
    this.threshold = this.settings.threshold || 0.7;
    this.conversationContext =
      (this.settings.conversationContext as ConversationContext) ||
      new MemoryConversationContext();
  }

  /**
   * Train the NLP manager.
   */
  async train(_arg0?: unknown): Promise<void> {
    await this.nlpManager.train();
  }

  /**
   * Loads the model from a file.
   * @param {String} filename Name of the file.
   */
  load(filename?: string): void {
    this.nlpManager.load(filename);
  }

  /**
   * Saves the model into a file.
   * @param {String} filename Name of the file.
   */
  save(filename?: string): void {
    this.nlpManager.save(filename);
  }

  /**
   * Loads the NLP manager from an excel.
   * @param {String} filename Name of the file.
   */
  async loadExcel(filename: string): Promise<void> {
    await this.nlpManager.loadExcel(filename);
    await this.train();
    this.save();
  }

  /**
   * Process an utterance using the NLP manager. This is done using a given context
   * as the context object.
   * @param {Object} srcContext Source context
   * @param {String} locale Locale of the utterance.
   * @param {Promise.String} Promise utterance Utterance to be recognized.
   */
  async process(
    srcContext: RecognizerContext | undefined,
    locale?: string,
    utterance?: string,
    _arg3?: unknown
  ): Promise<NlpResult> {
    const context = srcContext || {};
    const response = await (locale
      ? this.nlpManager.process(locale, utterance, context)
      : this.nlpManager.process(utterance, undefined, context));
    if (response.score < this.threshold || response.intent === 'None') {
      response.answer = undefined;
      return response;
    }
    for (let i = 0; i < response.entities.length; i += 1) {
      const entity = response.entities[i];
      context[entity.entity] = entity.option;
    }
    if (response.slotFill) {
      context.slotFill = response.slotFill;
    } else {
      delete context.slotFill;
    }
    return response;
  }

  /**
   * Given an utterance and the locale, returns the recognition of the utterance.
   * @param {String} utterance Utterance to be recognized.
   * @param {String} model Model of the utterance.
   * @param {Function} cb Callback Function.
   */
  async recognizeUtterance(
    utterance: string,
    model: (RecognizerContext & { locale?: string }) | undefined,
    cb: RecognizeCallback
  ): Promise<unknown> {
    const response = await this.process(
      model,
      model ? model.locale : undefined,
      utterance,
      {}
    );
    return cb(null, response);
  }

  /**
   * Gets the last developer (not framework) dialogId on the stack.
   * @param {Object} session Microsoft bot framework session.
   * @returns {string} Last dialog id.
   */
  getDialogId(session: BotSession): string {
    if (!session.dialogStack) {
      return '';
    }
    const stack = session.dialogStack();
    for (let i = 0; i < stack.length; i += 1) {
      const dialogId = stack[i];
      if (dialogId.startsWith('*:')) {
        return dialogId.substring(2);
      }
    }
    return '';
  }

  innerRecognize(session: BotSession, cb: RecognizeCallback): unknown {
    const result: NlpResult = {
      score: 0.0,
      intent: undefined,
    };
    if (session && session.message && session.message.text) {
      const utterance = session.message.text;
      const { locale } = session;
      this.conversationContext
        .getConversationContext(session)
        .then(async (srcContext) => {
          const context = srcContext;
          context.dialogId = this.getDialogId(session);
          const processResult = await this.process(context, locale, utterance);
          context.lastRecognized = processResult;
          this.conversationContext
            .setConversationContext(session, context)
            .then(() => cb(null, processResult))
            .catch(() => cb(null, processResult));
          return undefined;
        })
        .catch(async () => {
          const processResult = await this.process({}, locale, utterance);
          return cb(null, processResult);
        });
      return undefined;
    }
    // oxlint-disable-next-line no-underscore-dangle
    if (session && session._activity && session._activity.type === 'message') {
      // oxlint-disable-next-line no-underscore-dangle
      const message = session._activity;
      const utterance = message.text;
      const { locale } = message;
      this.conversationContext
        .getConversationContext(session)
        .then(async (srcContext) => {
          const context = srcContext;
          const processResult = await this.process(context, locale, utterance);
          context.lastRecognized = processResult;
          this.conversationContext
            .setConversationContext(session, context)
            .then(() => cb(null, processResult))
            .catch(() => cb(null, processResult));
          return undefined;
        })
        .catch(async () => {
          const processResult = await this.process({}, locale, utterance);
          return cb(null, processResult);
        });
      return undefined;
    }
    return cb(null, result);
  }

  /**
   * Given a session of a chatbot containing a message, recognize the utterance in the message.
   * @param {Object} session Chatbot session of the message.
   * @param {Function} cb Callback function.
   */
  recognize(session: BotSession, cb?: RecognizeCallback): unknown {
    if (cb) {
      return this.innerRecognize(session, cb);
    }
    return new Promise((resolve, reject) => {
      this.innerRecognize(session, (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      });
    });
  }

  /**
   * Given a session of a chatbot containing a message, recognize for second time
   * the utterance in the message.
   * @param {Object} session Chatbot session of the message.
   * @param {Function} cb Callback function.
   */
  recognizeTwice(session: BotSession, cb: RecognizeCallback): void {
    this.conversationContext
      .getConversationContext(session)
      .then(async (srcContext) => {
        const context = srcContext;
        if (context.lastRecognized) {
          const processResult = context.lastRecognized;
          delete context.lastRecognized;
          this.conversationContext
            .setConversationContext(session, context)
            .then(() => cb(null, processResult))
            .catch(() => cb(null, processResult));
        } else {
          return this.recognize(session, cb);
        }
        return undefined;
      })
      .catch(async () => this.recognize(session, cb));
  }

  /**
   * Route to a default route of the bot. First the route is calculated as the
   * best route based on the results and the dialog stack. If no best route exists
   * then is routed to the active dialog.
   * @param {Object} bot Microsoft Bot Framework Universal Bot instance.
   * @param {Object} session Microsoft bot framework session.
   * @param {Object} results Results for the routing.
   */
  defaultRouting(
    bot: BotFrameworkBot,
    session: BotSession,
    results: unknown
  ): unknown {
    const route = bot.libraries.BotBuilder.constructor.bestRouteResult(
      results,
      session.dialogStack(),
      bot.name
    );
    if (route) {
      return bot.library(route.libraryName).selectRoute(session, route);
    }
    return session.routeToActiveDialog();
  }

  executeAction(
    name: string,
    parameters: string,
    context: RecognizerContext
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      const params = JSON.parse(`[${parameters}]`) as unknown[];
      if (this.actions[name]) {
        // An action may answer a promise, in which case it is waited for.
        const action = this.actions[name](this, context, ...(params || [])) as
          | Promise<unknown>
          | undefined;
        if (action && action.then) {
          action.then(() => resolve());
        } else {
          return resolve();
        }
      }
      return resolve();
    });
  }

  processActions(
    session: BotSession,
    response: NlpResult | undefined,
    cb: (err?: unknown) => unknown
  ): unknown {
    const responseActions = response
      ? (response.actions as unknown[])
      : undefined;
    if (!response || !responseActions || responseActions.length === 0) {
      return cb();
    }
    this.conversationContext
      .getConversationContext(session)
      .then(async (srcContext) => {
        const context = srcContext;
        const actions = response.actions as {
          action: string;
          parameters: string;
        }[];
        const promises = actions.map((action) =>
          this.executeAction(action.action, action.parameters, context)
        );
        Promise.all(promises)
          .then(() => cb())
          .catch((err) => cb(err));
      })
      .catch(async () => cb());
    return undefined;
  }

  /**
   * When an answer is received over the threshold, decide what to do with this answer.
   * @param {Object} session Microsoft bot framework session.
   * @param {string} answer Answer given by the NLP.
   */
  processAnswer(session: BotSession, answer: string): unknown {
    if (answer[0] === '/') {
      return session.beginDialog(answer);
    }
    return session.send(answer);
  }

  /**
   * Sets the recognizer to a Microsoft bot framework universal bot instance.
   * Also, the default bot routing can be overrided and replaced by the
   * recognizer routing.
   * @param {Object} bot Microsoft Bot Framework Universal Bot instance.
   * @param {boolean} activateRouting True if default routing should be overrided.
   * @param {number} routingThreshold Threshold for the score of the intent.
   */
  setBot(
    bot: BotFrameworkBot,
    activateRouting = false,
    routingThreshold = 0.7
  ): void {
    bot.recognizer(this);
    if (!activateRouting) {
      return;
    }
    // The route below is installed on the bot, which calls it with a `this`
    // of its own, so the recognizer is reached through a binding rather than
    // through `this`.
    // oxlint-disable-next-line typescript/no-this-alias
    const self = this;
    // oxlint-disable-next-line no-underscore-dangle, no-param-reassign
    bot._onDisambiguateRoute = function disambiguate(
      session,
      results,
      cb = () => {}
    ) {
      if (self.onBeginRouting && !self.onBeginRouting(session)) {
        return cb();
      }
      if (session.message && session.message.text) {
        self.recognizeTwice(session, (err, result) => {
          if (result.score > routingThreshold) {
            if (
              self.onRecognizedRouting &&
              !self.onRecognizedRouting(session, result)
            ) {
              return cb();
            }
            self.processActions(session, result, () => {
              if (result.answer && result.answer !== '') {
                self.processAnswer(session, result.answer);
              }
              return cb();
            });
            return undefined;
          }
          if (
            self.onUnrecognizedRouting &&
            !self.onUnrecognizedRouting(session, result)
          ) {
            return cb();
          }
          self.defaultRouting(bot, session, results);
          return cb();
        });
      } else {
        if (self.onNoTextRouting && !self.onNoTextRouting(session)) {
          return cb();
        }
        self.defaultRouting(bot, session, results);
        return cb();
      }
      return undefined;
    };
  }
}

export default Recognizer;
