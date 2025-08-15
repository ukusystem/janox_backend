import { Ticket } from './src/ticket';
import { Main } from './src/main';
import { FinishTicket } from './src/finishTicket';
import { PinOrder } from './src/types';
import { RequestResult } from './src/requestResult';
import { Camara } from '../../types/db';
import { ResultSetHeader } from 'mysql2';
import { executeQuery } from './src/dbManager';
import * as useful from './src/useful';
import util from 'util';

let mainService: Main | null = null;

export async function main() {
  // Usar esta instancia para tickets y ordenes
  mainService = new Main();
  await mainService.run();
}

export async function onTicket(newTicket: Ticket) {
  return await mainService?.onTicket(newTicket);
}

export async function onFinishTicket(ticket: FinishTicket) {
  return await mainService?.onFinishTicket(ticket);
}

export async function onOrder(pinOrder: PinOrder) {
  return await mainService?.onOrder(pinOrder);
}

export async function sendSecurity(controllerID: number, security: boolean): Promise<RequestResult | undefined> {
  return await mainService?.sendSecurity(controllerID, security);
}

export function notifyCamDisconnect(ctrl_id: number, cam: Camara): void {
  mainService?.addDisconnectedCamera(ctrl_id, cam);
}

/**
 * FOR DEVELOPMENT ONLY
 * Delete tickets from nodes except node1
 * Deprecated for safety :)
 * @deprecated
 */
export async function test_deleteTickets() {
  console.log('Deleting tickets');
  const q_conf_actividad_drop = `
    ALTER TABLE nodo%s.actividadpersonal
    DROP FOREIGN KEY fk_actividadpersonal_registroticket_rt_id;
    `;
  const q_conf_actividad_create_cascade = `
    ALTER TABLE nodo%s.actividadpersonal 
    ADD CONSTRAINT fk_actividadpersonal_registroticket_rt_id
      FOREIGN KEY (rt_id)
      REFERENCES nodo%s.registroticket (rt_id)
      ON DELETE CASCADE
      ON UPDATE RESTRICT;
  `;
  const q_conf_actividad_create_restrict = `
    ALTER TABLE nodo%s.actividadpersonal 
    ADD CONSTRAINT fk_actividadpersonal_registroticket_rt_id
      FOREIGN KEY (rt_id)
      REFERENCES nodo%s.registroticket (rt_id)
      ON DELETE RESTRICT
      ON UPDATE RESTRICT;
  `;
  const q_conf_archivo_drop = `
    ALTER TABLE nodo%s.archivoticket 
    DROP FOREIGN KEY fk_archivoticket_registroticket_rt_id;
  `;
  const q_conf_archivo_create_cascade = `
    ALTER TABLE nodo%s.archivoticket 
    ADD CONSTRAINT fk_archivoticket_registroticket_rt_id
      FOREIGN KEY (rt_id)
      REFERENCES nodo%s.registroticket (rt_id)
      ON DELETE CASCADE
      ON UPDATE RESTRICT;
  `;
  const q_conf_archivo_create_restrict = `
    ALTER TABLE nodo%s.archivoticket 
    ADD CONSTRAINT fk_archivoticket_registroticket_rt_id
      FOREIGN KEY (rt_id)
      REFERENCES nodo%s.registroticket (rt_id)
      ON DELETE RESTRICT
      ON UPDATE RESTRICT;
  `;
  const q_delete = `
    DELETE FROM nodo%s.registroticket WHERE rt_id>0;
  `;
  let counter = 0;
  // const nodeStart = 2;
  // const nodeEnd = 104;

  const nodeIDs: number[] = [1];
  // for (let i = 2; i <= 104; i++) {
  //   nodeIDs.push(i);
  // }
  for (const currNode of nodeIDs) {
    await executeQuery<ResultSetHeader>(util.format(q_conf_actividad_drop, currNode));
    await executeQuery<ResultSetHeader>(util.format(q_conf_actividad_create_cascade, currNode, currNode));

    await executeQuery<ResultSetHeader>(util.format(q_conf_archivo_drop, currNode));
    await executeQuery<ResultSetHeader>(util.format(q_conf_archivo_create_cascade, currNode, currNode));

    await executeQuery<ResultSetHeader>(util.format(q_delete, currNode));

    await executeQuery<ResultSetHeader>(util.format(q_conf_actividad_drop, currNode));
    await executeQuery<ResultSetHeader>(util.format(q_conf_actividad_create_restrict, currNode, currNode));

    await executeQuery<ResultSetHeader>(util.format(q_conf_archivo_drop, currNode));
    await executeQuery<ResultSetHeader>(util.format(q_conf_archivo_create_restrict, currNode, currNode));
    counter = counter + 1;
    if (counter % 50 === 0) {
      console.log(`Deleted from ${counter} tables`);
    }
  }
  console.log(`Finished operations for ${counter} node(s)`);
}

/**
 * FOR DEVELOPMENT ONLY
 * Insert fake tickets to 'node1'.
 * Deprecated for safety :)
 * @deprecated
 */
export async function test_insertFakeTickets() {
  console.log('Inserting fake tickets');
  let counter = 0;
  let supposedTicketID = 1000;
  const startDate = 1735707600; // 1 de enero del 2025
  let currStart = startDate;
  const ticketSpan = 3600 * 2;
  const startStep = 3600 * 5;
  const endDate = 1745172000; // 20 de abril del 2025
  const emails = ['mortizc@hotmail.com', 'evelyndc_10@hotmail.com', 'antony@pruebas.com', 'miguel@pruebas.com', 'mig_1294@hotmail.com', 'hans.gutierrez.davila@uni.pe', 'darlynnn@hotmail.com'];
  const states0 = [4, 18, 2, 3];
  const states1 = [16, 2, 3];
  const personal = new Map<number, any>();
  personal.set(1, {
    name: 'Miguel',
    last: 'Ortíz Carhuapoma',
    phone: 987654321,
    dni: 87654321,
    role: 13,
    photo: 'photos/registered\\foto1.png',
  });
  personal.set(2, {
    name: 'Hans',
    last: 'Gutiérrez Dávila',
    phone: 987654322,
    dni: 87654322,
    role: 12,
    photo: 'photos/registered\\foto2.png',
  });
  personal.set(3, {
    name: 'Anthony',
    last: 'Jaramillo Aranda',
    phone: 987654323,
    dni: 87654323,
    role: 15,
    photo: 'photos/registered\\foto3.png',
  });
  personal.set(4, {
    name: 'Evelyn',
    last: 'De la cruz Vargas',
    phone: 987654324,
    dni: 87654324,
    role: 14,
    photo: 'photos/registered\\foto4.png',
  });
  personal.set(5, {
    name: 'Darlyn',
    last: 'Narciso Narciso',
    phone: 987654325,
    dni: 87654325,
    role: 11,
    photo: 'photos/registered\\foto5.png',
  });
  const contrataPersonalID = [
    {
      id: 2,
      p_id: [3],
    },
    {
      id: 3,
      p_id: [1, 2],
    },
    {
      id: 4,
      p_id: [4],
    },
    {
      id: 5,
      p_id: [5],
    },
  ];
  const tipoDesc = [
    {
      id: 1,
      desc: ['Instalación de switch', 'Instalación de rack', 'Medición de potencia', 'Reinicio de servidor', 'Desconectar cliente', 'Conectar puerto', 'Verificar conexión', 'Medición de ancho de banda'],
    },
    {
      id: 2,
      desc: ['Instalación de UPS', 'Medición de consumo', 'Instalación de interruptor termomagnético', 'Control de consumo eléctrico', 'Instalación de luminarias', 'Instalación de Janox sistema de seguridad', 'Encendido de grupo electrógeno', 'Instalación de piso antiestático'],
    },
    {
      id: 3,
      desc: ['Proyección de instalación de rack', 'Visita guiada a un cliente', 'Visita técnica', 'Instrucción a nuevo personal', 'Proyección del recorrido de fibra', 'Proyeccion para instalación de Janox'],
    },
    {
      id: 4,
      desc: ['Mantenimiento preventivo', 'Mantenimiento correctivo', 'Limpieza del site', 'Pintura de paredes', 'Cambio de chapa', 'Instalación de rejas metálicas', 'Cambio de puerta', 'Reparacion de grietas'],
    },
  ];

  const getRandItem = (a: any[], r: number) => {
    return a[Math.floor(r * a.length)];
  };

  const q_ticket = `
    INSERT INTO nodo1.registroticket (rt_id, telefono, correo, descripcion, fechacomienzo, fechatermino, estd_id, fechaestadofinal, 
    fechacreacion, prioridad, p_id, tt_id, sn_id, enviado, co_id, asistencia) 
    VALUE (?,?,?,?,?,?,?,?,?,?,?,?,1,1,?,?);
  `;
  const q_actividad = `
    INSERT INTO nodo1.actividadpersonal (nombre, apellido, telefono, dni, c_id, co_id, rt_id, foto) 
    VALUES (?,?,?,?,?,?,?,?);
  `;
  while (currStart < endDate) {
    const r1 = Math.random();
    const b = r1 > 0.5;
    const r2 = Math.random();
    const c = getRandItem(contrataPersonalID, r1);
    const t = getRandItem(tipoDesc, r1);
    const lead_id = getRandItem(c.p_id, r1);
    await executeQuery<ResultSetHeader>(q_ticket, [
      supposedTicketID,
      Math.floor(r1 * 99999999 + 900000000),
      getRandItem(emails, r1),
      getRandItem(t.desc, r2),
      useful.formatTimestamp(currStart),
      useful.formatTimestamp(currStart + ticketSpan),
      getRandItem(b ? states1 : states0, r2),
      useful.formatTimestamp(currStart + ticketSpan),
      useful.formatTimestamp(currStart - 3600 * 8),
      Math.floor(r1 * 3) + 1,
      lead_id,
      t.id,
      c.id,
      b ? 1 : 0,
    ]);
    const p = personal.get(lead_id);
    await executeQuery(q_actividad, [p.name, p.last, p.phone, p.dni, p.role, c.id, supposedTicketID, p.photo]);
    currStart = currStart + startStep;
    supposedTicketID = supposedTicketID + 1;
    counter = counter + 1;
    if (counter % 50 === 0) {
      console.log(`Inserted ${counter} tickets`);
    }
  }
  console.log(`Finished`);
}
