/**
 * Structure of the request from the web application to take the ticket to its
 * final state, which can be: accepted (1), rejected (-1) or cancelled (0).
 */
export class FinishTicket{
		readonly action:number
		readonly ctrl_id:number
		readonly rt_id:number	
	
    constructor(action:number, ctrl_id:number, rt_id:number){
        this.action = action
        this.ctrl_id = ctrl_id
        this.rt_id = rt_id
    }

    isValid():boolean {
		return this.action>0 && this.ctrl_id>0 && this.rt_id>0;
	}
}