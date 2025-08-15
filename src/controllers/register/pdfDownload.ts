import pdfmake from 'pdfmake';
import { Request, Response, NextFunction } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { getFormattedDateTime } from '../../utils/getFormattedDateTime';
import { TDocumentDefinitions, TableCell } from 'pdfmake/interfaces';

import dayjs from 'dayjs';

// PDF fonts:
const fonts = {
  //   Roboto: {
  //     normal: "./fonts/Roboto-Regular.ttf",
  //     bold: "./fonts/Roboto-Medium.ttf",
  //     italics: "./fonts/Roboto-Italic.ttf",
  //     bolditalics: "./fonts/Roboto-MediumItalic.ttf",
  //   },
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

export const pdfDownload = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const data: { data: Record<any, any>[]; title: string } = req.body;
  const columnsTable = Object.keys(data.data[0]).map((key) => key.toUpperCase());
  const rowsTable = data.data.map((onedata) => Object.values(onedata));
  const tableBody: TableCell[][] = [columnsTable, ...rowsTable];

  const pdf = new pdfmake(fonts);
  const docDefinition: TDocumentDefinitions = {
    content: [
      {
        columns: [
          {
            alignment: 'left',
            columns: [
              {
                width: 40,
                svg: '<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_318_552)"><path d="M60.9823 43.9359H72.7286C75.5251 54.1372 50.0746 92.1086 16.7931 64.3383L11.7589 68.8726C27.7005 87.8583 80 85.8743 80 36.5683H59.5834L56.7869 18.4328H50.0746L42.2437 42.8025L45.0405 52.1537L52.5917 33.1679L57.3463 58.6709H63.2194L60.9823 43.9359Z" fill="#549AEC"/><path d="M20.7086 36.5683H7.28406C7.28406 21.5498 31.0566 -9.62069 63.4989 15.8825L67.9737 11.3486C40.8453 -13.0211 -0.826577 3.69761 0.0124759 43.9359H19.3102L16.5134 58.1046H22.9459L27.7005 33.1679L36.9298 58.1046H42.803L30.2175 18.4328H23.5053L20.7086 36.5683Z" fill="#1668DC"/></g><defs><clipPath id="clip0_318_552"><rect width="80" height="80" fill="white"/></clipPath></defs></svg>',
              },
              {
                text: 'Mercurial Systems',
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
      { text: `Reporte de Registros: ${data.title}`, bold: true, fontSize: 12, margin: [0, 10, 0, 0] },
      {
        style: 'tableExample',
        table: {
          body: tableBody,
        },
      },
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10],
      },
      subheader: {
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 5],
      },
      tableExample: {
        margin: [0, 5, 0, 15],
      },
      tableOpacityExample: {
        margin: [0, 5, 0, 15],
        fillColor: 'blue',
        fillOpacity: 0.3,
      },
      tableHeader: {
        bold: true,
        fontSize: 13,
        color: 'black',
      },
    },
    defaultStyle: {
      // alignment: 'justify'
      font: 'Times',
    },
    // patterns: {
    //   stripe45d: {
    //     boundingBox: [1, 1, 4, 4],
    //     xStep: 3,
    //     yStep: 3,
    //     pattern: "1 w 0 1 m 4 5 l s 2 0 m 5 3 l s",
    //   },
    // },
  };

  const pdfDoc = pdf.createPdfKitDocument(docDefinition);

  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=registro_${data.title.replace(/ /g, '-')}_${getFormattedDateTime()}.pdf`);

  // Enviar el PDF directamente al cliente
  pdfDoc.pipe(res);
  pdfDoc.end();
});
