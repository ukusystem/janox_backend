import pdfmake from 'pdfmake';
import { Response, NextFunction } from 'express';
import { asyncErrorHandler } from '../../../utils/asynErrorHandler';
import { TDocumentDefinitions, TableCell, UnorderedListElement } from 'pdfmake/interfaces';
import { Ticket } from '../../../models/ticket';
import dayjs from 'dayjs';
import type { RequestWithUser } from '../../../types/requests';
import { join } from 'node:path';
import { appConfig } from '../../../configs';

// PDF fonts:
const fonts = {
  Roboto: {
    normal: join(__dirname, '../../../../fonts/Roboto/Roboto-Regular.ttf'),
    bold: join(__dirname, '../../../../fonts/Roboto/Roboto-Bold.ttf'),
    italics: join(__dirname, '../../../../fonts/Roboto/Roboto-Italic.ttf'),
    bolditalics: join(__dirname, '../../../../fonts/Roboto/Roboto-BlackItalic.ttf'),
  },
  Courier: {
    normal: 'Courier',
    bold: 'Courier-Bold',
    italics: 'Courier-Oblique',
    bolditalics: 'Courier-BoldOblique',
  },
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
  Times: {
    normal: 'Times-Roman',
    bold: 'Times-Bold',
    italics: 'Times-Italic',
    bolditalics: 'Times-BoldItalic',
  },
  Symbol: {
    normal: 'Symbol',
  },
  ZapfDingbats: {
    normal: 'ZapfDingbats',
  },
};

export const downloadPdfDetalles = asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
  const { ctrl_id, rt_id } = req.query as { ctrl_id: string; rt_id: string };
  const user = req.user!; // ! -> anteponer middleware auth
  const result = await Ticket.getAllTicketDetails({ ctrl_id: Number(ctrl_id), rt_id: Number(rt_id), user });

  if (result) {
    const { solicitante, ticket, personales, archivos_respaldo } = result;

    const personalesRows = personales.map((personal, index) => {
      const { nombre, telefono, dni, cargo, contrata, foto } = personal;
      const fotoFinal = foto
        ? {
            text: 'Ver',
            alignment: 'left',
            link: `http://${appConfig.server.ip}:${appConfig.server.port}/api/v1/ticket/download/fotoactividadpersonal?filePath=${encodeURIComponent(foto)}`,
            color: 'blue',
          }
        : 'Sin Foto';

      return [index + 1, nombre, telefono, dni, cargo, contrata, fotoFinal];
    });
    const personalesTableBody: TableCell[][] = [
      [
        { text: 'N°', bold: true, fontSize: 12, alignment: 'left' },
        {
          text: 'NOMBRE',
          bold: true,
          fontSize: 12,
          alignment: 'left',
        },
        {
          text: 'TELEFONO',
          bold: true,
          fontSize: 12,
          alignment: 'left',
        },
        { text: 'DNI', bold: true, fontSize: 12, alignment: 'left' },
        {
          text: 'CARGO',
          bold: true,
          fontSize: 12,
          alignment: 'left',
        },
        {
          text: 'CONTRATA',
          bold: true,
          fontSize: 12,
          alignment: 'left',
        },
        {
          text: 'FOTO',
          bold: true,
          fontSize: 12,
          alignment: 'left',
        },
      ],
      ...personalesRows,
    ];

    const listArchivosRespaldo: UnorderedListElement[] = archivos_respaldo.map((archivo) => {
      return {
        columns: [
          {
            width: 'auto',
            text: archivo.nombreoriginal,
          },
          {
            width: '*',
            text: 'Ver',
            alignment: 'right',
            link: `http://${appConfig.server.ip}:${appConfig.server.port}/api/v1/ticket/download/archivorespaldo?filePath=${encodeURIComponent(archivo.ruta)}`,
            color: 'blue',
          },
        ],
      };
    });

    const docDefinitionDetalles: TDocumentDefinitions = {
      content: [
        {
          columns: [
            {
              alignment: 'left',
              columns: [
                {
                  width: 40,
                  svg: '<svg width="56" height="60" viewBox="0 0 56 60" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_644_739)"><path d="M0.972961 10.9091L9.97296 0V60L0.972961 49.0908V10.9091Z" fill="#1668DC"/><path d="M54.973 49.0908L45.973 60V0L54.973 10.9091V49.0908Z" fill="#1668DC"/><path d="M45.973 60H9.9729V50.1819H45.973V60Z" fill="#1668DC"/><path d="M45.973 9.81819H9.9729V0H45.973V9.81819Z" fill="#1668DC"/><path d="M45.973 30.2727H9.9729V22.0909H45.973V30.2727Z" fill="#1668DC"/></g><defs><clipPath id="clip0_644_739"><rect width="54.0541" height="60" fill="white" transform="translate(0.972961)"/></clipPath></defs></svg>',
                },
                {
                  text: 'Janox',
                  alignment: 'left',
                  margin: [5, 10, 0, 0],
                  fontSize: 20,
                  bold: true,
                },
              ],
            },
            {
              alignment: 'right',
              margin: [0, 14, 0, 0],
              columns: [{ text: 'Fecha : ' }, { text: dayjs().format('DD/MM/YYYY HH:mm:ss'), opacity: 0.5 }],
              fontSize: 12,
            },
          ],
        },
        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  text: 'Solicitante',
                  bold: true,
                  fontSize: 15,
                  alignment: 'left',
                },
              ],
              [
                {
                  table: {
                    widths: ['*', '*'],
                    body: [
                      [
                        {
                          stack: [
                            {
                              text: 'Nombre : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: solicitante.nombre,
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                        {
                          stack: [
                            {
                              text: 'Telefono : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: solicitante.telefono,
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                      ],
                      [
                        {
                          stack: [
                            {
                              text: 'Correo : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: solicitante.correo,
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                        {
                          stack: [
                            {
                              text: 'DNI : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: solicitante.dni,
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                      ],
                      [
                        {
                          stack: [
                            {
                              text: 'Cargo : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: solicitante.cargo,
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                        {
                          stack: [
                            {
                              text: 'Contrata : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: solicitante.contrata,
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                      ],
                    ],
                  },
                  layout: 'noBorders',
                  margin: [5, 5, 5, 5],
                },
              ],
            ],
          },
          margin: [0, 10, 0, 0],
        },
        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  text: 'Ticket',
                  bold: true,
                  fontSize: 15,
                  alignment: 'left',
                },
              ],
              [
                {
                  table: {
                    widths: ['*', '*', '*'],
                    body: [
                      [
                        {
                          stack: [
                            {
                              text: 'Tipo Trabajo : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: ticket.tipotrabajo,
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                        {
                          stack: [
                            {
                              text: 'Descripción : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: ticket.descripcion,
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                        {
                          stack: [
                            {
                              text: 'Prioridad : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: ticket.prioridad === 1 ? 'Alta' : ticket.prioridad === 2 ? 'Medio' : ticket.prioridad === 3 ? 'Bajo' : '¡error-prioridad!',
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                      ],
                      [
                        {
                          stack: [
                            {
                              text: 'Contrata : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: ticket.contrata,
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                        {
                          stack: [
                            {
                              text: 'Estado : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: ticket.estado,
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                        {
                          stack: [
                            {
                              text: 'Fecha Creación : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: dayjs(ticket.fechacreacion).format('DD/MM/YYYY HH:mm:ss'),
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                      ],
                      [
                        {
                          stack: [
                            {
                              text: 'Fecha Comienzo : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: dayjs(ticket.fechacomienzo).format('DD/MM/YYYY HH:mm:ss'),
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                        {
                          stack: [
                            {
                              text: 'Fecha Termino : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: dayjs(ticket.fechatermino).format('DD/MM/YYYY HH:mm:ss'),
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                        {
                          stack: [
                            {
                              text: 'Fecha Final : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: dayjs(ticket.fechaestadofinal).format('DD/MM/YYYY HH:mm:ss'),
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                      ],
                      [
                        {
                          stack: [
                            {
                              text: 'Telefono : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: ticket.telefono,
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                        {
                          stack: [
                            {
                              text: 'Correo : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: ticket.correo,
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                        {
                          stack: [
                            {
                              text: 'Numero Ticket : ',
                              bold: true,
                              alignment: 'left',
                            },
                            {
                              text: ticket.rt_id,
                              alignment: 'left',
                              opacity: 0.5,
                            },
                          ],
                          alignment: 'center',
                        },
                      ],
                    ],
                  },
                  layout: 'noBorders',
                  margin: [5, 5, 5, 5],
                },
              ],
            ],
          },
          margin: [0, 10, 0, 0],
        },
        {
          text: 'Personales',
          bold: true,
          fontSize: 15,
          alignment: 'left',
          margin: [0, 10, 0, 0],
        },
        {
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
            body: personalesTableBody,
          },
          margin: [0, 10, 0, 0],
        },
        {
          text: 'Archivos Respaldo',
          bold: true,
          fontSize: 15,
          alignment: 'left',
          margin: [0, 10, 0, 0],
        },
        {
          type: 'square',
          margin: [10, 0, 0, 0],
          ul: listArchivosRespaldo,
        },
      ],
      defaultStyle: {
        // alignment: 'justify'
        font: 'Roboto',
        fontSize: 12,
      },
    };

    const pdf = new pdfmake(fonts);
    const pdfDoc = pdf.createPdfKitDocument(docDefinitionDetalles);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=DetallesTicket_${Date.now()}.pdf`);

    // Enviar el PDF directamente al cliente
    pdfDoc.pipe(res);
    pdfDoc.end();
    return;
  } else {
    return res.status(404).json({ message: "No se encontraron detalles. Asegúrese de ingresar valores válidos para 'ctrl_id' y 'rt_id'." });
  }
});
