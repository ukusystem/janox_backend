export class PartialTicket {
  /**
   * Wether this ticket is already sent. This state should change to true when the ticket is sent and to false
   * when the related controller is disconnected, so after the next reconnection it can be sent again.
   */
	sent = false;

  readonly startTime;
  readonly endTime;
  readonly ticketID;
  readonly companyID;

  constructor(id: number, company: number, start: number, end: number) {
    this.startTime = start;
    this.endTime = end;
    this.ticketID = id;
    this.companyID = company;
  }

  getBody(): string[] {
    return [this.ticketID.toString(), this.companyID.toString(), this.startTime.toString(), this.endTime.toString()];
  }
}
