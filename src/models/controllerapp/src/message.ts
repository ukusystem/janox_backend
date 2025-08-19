import * as Codes from './codes'
import { IntConsumer } from './types';

/**
 * Class representing the message that will be send through the socket.
 */
export class Message {
  static nextID = 1;

  message = "";
  messageID = 0;
  responseExpected = false;
  forceAddToPending = false;
  logOnSend = true;
  logOnResponse = true;
  action: IntConsumer = null;

  /**
   * Construct a string message joining the header, id and body separating each
   * component with proper characters and adding a end of message character at the
   * end. The minimum message is composed of a command (CMD_X || VALUE_X) and a
   * positive or zero id (>=0). Shorter messages will not be understood by the
   * receiving side.
   *
   * @constructor
   * @param header    The header of the message
   * @param id        The id of the message. A negative value means that the id is assigned automatically using an internal count and that a response is expected. A zero or positive value means that no response is expected and positive values are used when the message is the final response to another message.
   * @param body      The body of the message. Can be empty to create a message without a body.
   * @param action    Action to perform after the response to this message has been received, if a response was expected.
   * @param forceAdd
   */
  constructor(
    header: number,
    id: number = 0,
    body: string[] = [],
    action: IntConsumer = null,
    forceAdd: boolean = false
  ) {
    this.action = action;
    this.forceAddToPending = forceAdd;
    this.responseExpected = id < 0;
    this.messageID = this.responseExpected ? Message.nextID : id;
    this.message = Message.#joinMessage(header, this.messageID, body);
    Message.nextID += this.responseExpected ? 1 : 0;
  }

  attachAction(action: IntConsumer|null = null): Message {
    this.action = action;
    return this;
  }

  setLogOnSend(log: boolean): Message {
    this.logOnSend = log;
    return this;
  }

  setLogOnResponse(log: boolean): Message {
    this.logOnResponse = log;
    return this;
  }

  /**
   * Edit the object with a different message and an id = 0.
   * @param newMessage The new inner text. The ending character <code>SEP_EOL</code> will be appended at the end.
   * @returns The same object with the parameters changed.
   */
  reset(newMessage: string): Message {
    this.message = newMessage + Codes.SEP_EOL;
    this.messageID = 0;
    this.responseExpected = false;
    return this;
  }

  /**
   * Join the header, id and body parts into a String separating each component
   * with a SEP_CMD
   *
   * @param header The header of the message
   * @param id     The id of the message. This exact value will be added to the
   *               message.
   * @param body   The body of the message. Can be empty to create a message
   *               without a body.
   * @returns The String with all the values joined
   */
  static #joinMessage(header: number, id: number, body: string[]): string {
    let tempMessage = `${header}${Codes.SEP_CMD}${id}`;
    for (let i = 0; i < body.length; i++) {
      tempMessage = `${tempMessage}${Codes.SEP_CMD}${body[i]}`;
    }
    return tempMessage + Codes.SEP_EOL;
  }

  /**
   * Get the string representation
   * @returns The string representation
   * @override
   */
  toString(): string {
    return `<${this.messageID}:${this.message}>`;
  }
}
