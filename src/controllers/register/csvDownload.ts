import exceljs from 'exceljs';
import { Request, Response, NextFunction } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { getFormattedDateTime } from '../../utils/getFormattedDateTime';
import { Register, RegisterType } from '../../models/registers/Register';

export const csvDownload = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { ctrl_id, end_date, start_date, type, col_delete } = req.query as { type: string; ctrl_id: string; start_date: string; end_date: string; col_delete: string | undefined | string[] };

  const registerRows = await Register.getRegistrosDownload({ col_delete, ctrl_id: Number(ctrl_id), end_date, start_date, type: type as RegisterType });

  //Create a Workbook
  const workbook = new exceljs.Workbook();

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

  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

  res.setHeader('Content-Type', 'text/csv');

  res.setHeader('Content-Disposition', `attachment; filename=registro_${type}_${getFormattedDateTime()}.csv`);

  workbook.csv.write(res).then(() => {
    res.status(200);
  });
});
