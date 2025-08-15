/**
 * Object that can hold one piece of data that is the result of parsing one item
 * in a command. Even when each field can save different data, it is recommended
 * to use only one of them per instance. The {@linkcode setNumber} or {@linkcode setString} methods must be used
 * to change the value of each field, for those methods update the
 * {@linkcode selected} object which will be used when saving items to the database,
 * NOT the field itself.
 */
export class DataStruct {
  private intData: number = 0;
  private strData: string = '';

  // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
  selected: Object = this.intData;

  setNumber(intValue: number) {
    this.intData = intValue;
    this.selected = this.intData;
  }

  setString(strValue: string) {
    this.strData = strValue;
    this.selected = this.strData;
  }

  getInt(): number {
    return this.intData;
  }

  getString(): string {
    return this.strData;
  }

  toString(): string {
    return this.selected.toString();
  }
}
