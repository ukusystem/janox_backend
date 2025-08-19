import exceljs from 'exceljs';
import { Request, Response, NextFunction } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { getFormattedDateTime } from '../../utils/getFormattedDateTime';
import { Register, RegisterType } from '../../models/registers/Register';

export const excelDownload = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { ctrl_id, end_date, start_date, type, col_delete } = req.query as { type: string; ctrl_id: string; start_date: string; end_date: string; col_delete: string | undefined | string[] };

  const registerRows = await Register.getRegistrosDownload({ col_delete, ctrl_id: Number(ctrl_id), end_date, start_date, type: type as RegisterType });

  //Create a Workbook
  const workbook = new exceljs.Workbook();
  // Set Workbook Properties
  workbook.creator = 'Mercurial Systems';
  workbook.lastModifiedBy = 'Mercurial Systems';
  workbook.created = new Date();
  workbook.modified = new Date();

  //Add a Worksheet
  const worksheet = workbook.addWorksheet('REGISTRO_' + type.toUpperCase());

  // Columns:
  worksheet.columns = registerRows.columns.map((column) => ({
    header: column.toUpperCase(),
    key: column,
    width: 20,
  }));

  // Add Rows
  registerRows.data.forEach((row) => {
    worksheet.addRow(row);
  });

  // Set font bold row 1
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });

  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=registro_${type}_${getFormattedDateTime()}.xlsx`);

  workbook.xlsx.write(res).then(() => {
    res.status(200);
  });
});
