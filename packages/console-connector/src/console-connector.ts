import readline from 'readline';
import { Connector } from '@nlpjs-neo/connector';

class ConsoleConnector extends Connector {
  declare context: any;
  declare onHear: any;
  declare rl: any;

  initialize() {
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

  say(message, reference?) {
    let text;
    if (typeof reference === 'object' && reference.value) {
      text = reference.value;
    } else if (typeof message === 'string') {
      text = message;
    } else {
      text = message.answer || message.message || message.text || reference;
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

  async hear(line) {
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
        const bot = this.container.get('bot');
        if (bot) {
          const session = this.createSession({
            channelId: 'console',
            text: line,
            conversation: { id: 'console000' },
          });
          await bot.process(session);
        } else {
          const nlp = this.container.get('nlp');
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

  async handleLine(line) {
    try {
      await this.hear(line);
    } catch (error) {
      this.logError(error);
    }
  }

  logError(error) {
    // The line listener discards this promise, so reporting the error must
    // never throw: an unregistered or incomplete logger would otherwise turn
    // into the unhandled rejection that handleLine exists to prevent.
    try {
      const logger = this.logger;
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

  close() {
    this.rl.close();
  }

  exit() {
    process.exit();
  }
}

export default ConsoleConnector;
