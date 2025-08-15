
export class TableTuple {
  readonly valueNormal;
  readonly valueEnd;
  readonly selectQuery;
  readonly table;
  readonly logOnSend;

  constructor(value: number, end: number, query: string, tableName: string, log: boolean) {
    this.valueNormal = value;
    this.valueEnd = end;
    this.selectQuery = query;
    this.table = tableName;
    this.logOnSend = log;
  }
}
