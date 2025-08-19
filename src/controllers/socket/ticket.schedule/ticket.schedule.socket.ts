import { Server } from 'socket.io';
import { SocketTicketSchedule } from './ticket.schedule.types';
import { ticketScheduleNamespaceSchema } from './ticket.schedule.schema';
import { RegistroTicketSocketObserver, TicketScheduleManager } from './ticket.schedule.manager';

export const ticketScheduleSocket = async (io: Server, socket: SocketTicketSchedule) => {
  const nspTickets = socket.nsp;
  const [, , xctrl_id] = nspTickets.name.split('/'); // Namespace: "/tickets/ctrl_id/"

  const result = ticketScheduleNamespaceSchema.safeParse({ ctrl_id: xctrl_id });

  if (!result.success) {
    socket.disconnect(true);
    return;
  }

  const { ctrl_id } = result.data;
  const newObserver = new RegistroTicketSocketObserver(socket);
  TicketScheduleManager.registerObserver(ctrl_id, newObserver);
  // emit initial data
  const listRegTickets = TicketScheduleManager.getListRegTicket(ctrl_id);
  socket.emit('tickets', listRegTickets);
};
