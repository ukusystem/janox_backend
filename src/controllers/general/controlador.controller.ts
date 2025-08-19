import { NextFunction, Request, Response } from 'express';
import { ControladorRepository } from '../../models/general/controlador/contralador.repository';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { EntityResponse } from '../../types/shared';
import { Controlador, Region } from '../../types/db';

export type ControladorInfo = Pick<Controlador, 'ctrl_id' | 'rgn_id' | 'nodo' | 'direccion' | 'descripcion' | 'latitud' | 'longitud' | 'serie' | 'ip' | 'personalgestion' | 'personalimplementador' | 'modo' | 'seguridad' | 'conectado'> & { region: Pick<Region, 'region' | 'descripcion' | 'rgn_id'> };

export class ControladorController {
  constructor(private readonly repository: ControladorRepository) {}

  get singleController() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { ctrl_id } = req.params as { ctrl_id: string };
      const controladorFound = await this.repository.findById(Number(ctrl_id));
      if (controladorFound === undefined) {
        return res.status(400).json({ success: false, message: 'Controlador no disponible' });
      }
      const response: EntityResponse<ControladorInfo> = {
        conectado: controladorFound.conectado,
        ctrl_id: controladorFound.ctrl_id,
        rgn_id: controladorFound.rgn_id,
        descripcion: controladorFound.descripcion,
        direccion: controladorFound.direccion,
        ip: controladorFound.ip,
        latitud: controladorFound.latitud,
        longitud: controladorFound.longitud,
        modo: controladorFound.modo,
        nodo: controladorFound.nodo,
        personalgestion: controladorFound.personalgestion,
        personalimplementador: controladorFound.personalimplementador,
        seguridad: controladorFound.seguridad,
        serie: controladorFound.serie,
        region: { descripcion: controladorFound.region_descripcion, region: controladorFound.region, rgn_id: controladorFound.rgn_id },
      };
      res.status(200).json(response);
    });
  }

  get listController() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const controladores = await this.repository.searchALl();
      const response: EntityResponse<ControladorInfo[]> = controladores.map((controlador) => ({
        conectado: controlador.conectado,
        ctrl_id: controlador.ctrl_id,
        rgn_id: controlador.rgn_id,
        descripcion: controlador.descripcion,
        direccion: controlador.direccion,
        ip: controlador.ip,
        latitud: controlador.latitud,
        longitud: controlador.longitud,
        modo: controlador.modo,
        nodo: controlador.nodo,
        personalgestion: controlador.personalgestion,
        personalimplementador: controlador.personalimplementador,
        seguridad: controlador.seguridad,
        serie: controlador.serie,
        region: { descripcion: controlador.region_descripcion, region: controlador.region, rgn_id: controlador.rgn_id },
      }));
      res.status(200).json(response);
    });
  }
}
