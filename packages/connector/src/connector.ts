import { Clonable, containerBootstrap } from '@nlpjs-neo/core';
import type { Container, ContainerHolder } from '@nlpjs-neo/core';
import Session from './session.js';
import type {
  Activity,
  ConnectorSettings,
  ConversationContext,
  Message,
} from './types.js';

class Connector extends Clonable {
  declare settings: ConnectorSettings;

  constructor(settings: ConnectorSettings = {}, container?: ContainerHolder) {
    super(
      {
        settings: {},
        container:
          settings.container ||
          (container &&
            ((container as { container?: Container }).container ||
              (container as Container))) ||
          containerBootstrap(),
      },
      container as Container
    );
    this.applySettings(this.settings, settings);
    this.registerDefault();
    if (!this.settings.tag) {
      this.settings.tag = this.getSnakeName();
    }
    this.applySettings(
      this.settings,
      this.container.getConfiguration(this.settings.tag)
    );
    this.initialize();
  }

  registerDefault(): void {
    // Empty
  }

  /** `ConsoleConnector` becomes `console`: the tag it is configured under. */
  getSnakeName(): string {
    const name = this.constructor.name
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map((word) => word.toLowerCase())
      .join('-');
    return name.endsWith('-connector') ? name.slice(0, -10) : name;
  }

  initialize(): void {
    // Should be implemented by childs
  }

  /**
   * Sends a message on the channel. The base connector has no channel of its
   * own to send on, so this is where a `Session` reaches the one that has.
   */
  say(
    _message: Message | string,
    _session?: Session,
    _context?: ConversationContext
  ): void | Promise<void> {
    // Should be implemented by childs
  }

  close(): void {
    // Should be implemented by childs
  }

  destroy(): void {
    this.close();
  }

  createSession(activity: Activity = {}): Session {
    return new Session(this, activity);
  }
}

export default Connector;
