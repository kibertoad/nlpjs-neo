import readline from 'readline';
import { Connector } from '@nlpjs-neo/connector';
import type {
  Bot,
  ConversationContext,
  HearHandler,
  Message,
  Session,
} from '@nlpjs-neo/connector';
import type { Logger } from '@nlpjs-neo/core';

/** The classifier this falls back to when no bot and no pipeline is set up. */
interface NlpService {
  process(
    input: Record<string, unknown>,
    settings?: unknown,
    context?: ConversationContext
  ): Promise<Message>;
}

class ConsoleConnector extends Connector {
  /** Conversation state, kept for the life of the process. */
  declare context: ConversationContext;
  /** Called instead of the default handling, when one is assigned. */
  declare onHear: HearHandler | undefined;
  declare rl: readline.Interface;

  initialize(): void {
    this.context = {};
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });
    this.rl.on('line', (line) => {
      void this.handleLine(line);
    });
  }

  /**
   * Prints an answer. `reference` is the session the answer belongs to, but
   * the pipelines call this with the resolved value in its place, which is
   * then what gets printed.
   */
  say(
    message: Message | string,
    reference?: Session | { value?: string }
  ): void {
    let text: string | undefined;
    const value = (reference as { value?: string } | undefined)?.value;
    if (typeof reference === 'object' && value) {
      text = value;
    } else if (typeof message === 'string') {
      text = message;
    } else {
      text =
        message.answer ||
        message.message ||
        message.text ||
        (reference as unknown as string);
    }
    const botName = this.settings.botName || 'bot';
    if (this.settings.debug && typeof message === 'object' && !reference) {
      const intent = message.intent || '';
      const score = message.score || '';
      // oxlint-disable-next-line no-console
      console.log(`${botName}> ${text} (${intent} - ${score})`);
    } else {
      // oxlint-disable-next-line no-console
      console.log(`${botName}> ${text}`);
    }
  }

  async hear(line: string): Promise<void> {
    if (this.onHear) {
      await this.onHear(this, line);
    } else {
      const name = `${this.settings.tag}.hear`;
      const pipeline = this.container.getPipeline(name);
      if (pipeline) {
        await this.container.runPipeline(
          pipeline,
          { message: line, channel: 'console', app: this.container.name },
          this
        );
      } else {
        const bot = this.container.get<Bot>('bot');
        if (bot) {
          const session = this.createSession({
            channelId: 'console',
            text: line,
            conversation: { id: 'console000' },
          });
          await bot.process(session);
        } else {
          const nlp = this.container.get<NlpService>('nlp');
          if (nlp) {
            const result = await nlp.process(
              {
                message: line,
                channel: 'console',
                app: this.container.name,
              },
              undefined,
              this.context
            );
            this.say(result);
          } else {
            console.error(`There is no pipeline for ${name}`);
          }
        }
      }
    }
  }

  async handleLine(line: string): Promise<void> {
    try {
      await this.hear(line);
    } catch (error) {
      this.logError(error);
    }
  }

  logError(error: unknown): void {
    // The line listener discards this promise, so reporting the error must
    // never throw: an unregistered or incomplete logger would otherwise turn
    // into the unhandled rejection that handleLine exists to prevent.
    try {
      const logger: Logger | undefined = this.logger;
      if (logger && typeof logger.error === 'function') {
        logger.error(error);
      } else if (typeof console.error === 'function') {
        // oxlint-disable-next-line no-console
        console.error(error);
      }
    } catch {
      // Ignore: there is no usable channel left to report through.
    }
  }

  close(): void {
    this.rl.close();
  }

  exit(): void {
    process.exit();
  }
}

export default ConsoleConnector;
