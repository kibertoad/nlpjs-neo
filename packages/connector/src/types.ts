import type { Container, Settings } from '@nlpjs-neo/core';
import type Connector from './connector.js';
import type Session from './session.js';

/**
 * Types of the connector packages: the activity a channel delivers, the
 * message a bot answers with and the contract a connector implements.
 */

/** Who an activity is from or to, as the channel identifies them. */
export interface ChannelAccount {
  id: string;
  name?: string;
}

/** The conversation an activity belongs to. */
export interface ConversationAccount {
  id: string;
}

/** One button offered alongside an answer. */
export interface SuggestedAction {
  type: string;
  title: string;
  value: string;
}

/**
 * An inbound activity, in the shape of the Bot Framework. Channels add their
 * own properties, so the shape stays open.
 */
export interface Activity {
  type?: string;
  id?: string;
  text?: string;
  serviceUrl?: string;
  channelId?: string;
  conversation?: ConversationAccount;
  from?: ChannelAccount;
  recipient?: ChannelAccount;
  inputHint?: string;
  [key: string]: unknown;
}

/** An outbound message, as `Session.createMessage` builds it. */
export interface Message extends Activity {
  suggestedActions?: { actions: SuggestedAction[] };
  /** Text a classifier answered with, for the connectors that log it. */
  answer?: string;
  message?: string;
  intent?: string;
  score?: number;
}

/**
 * State carried between the turns of a conversation. The dialog manager, the
 * localizer and the bot each keep their own keys in it.
 */
export interface ConversationContext {
  locale?: string;
  dialogStack?: unknown[];
  [key: string]: unknown;
}

/** Settings of a `Connector`. */
export interface ConnectorSettings extends Settings {
  /** Name the bot answers under; defaults to `bot`. */
  botName?: string;
  /** Logs the intent and the score alongside every answer. */
  debug?: boolean;
}

/** The bot a connector hands its sessions to, when one is registered. */
export interface Bot {
  container: Container;
  dialogManager: DialogManager;
  process(session: Session): Promise<unknown>;
}

/** Where a conversation stands in its dialogs. */
export interface DialogManager {
  beginDialog(dialogStack: unknown[], name: string): void;
  endDialog(dialogStack: unknown[]): void;
  restartDialog(dialogStack: unknown[]): void;
}

/** Compiles the templates an answer may carry against the context. */
export interface TemplateCompiler {
  compile(message: Message, context: ConversationContext): Message;
}

/** Localizes an answer, when the context carries a localization. */
export interface Localizer {
  getLocalized(locale: string, text: string): string;
}

/** Called instead of the default pipeline when a connector is given one. */
export type HearHandler = (
  connector: Connector,
  line: string
) => void | Promise<void>;
