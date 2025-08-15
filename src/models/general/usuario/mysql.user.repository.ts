import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { MySQL2 } from '../../../database/mysql';
import { CreateUserDTO } from './dtos/create.user.dto';
import { Usuario } from './user.entity';
import { UserRepository, UserWithRoleAndPersonal } from './user.repository';
import { UpdateUserDTO } from './dtos/update.user.dto';
import dayjs from 'dayjs';

interface UsuarioRowData extends RowDataPacket, Usuario {}
interface UsuarioRoleAndPersonalRowData extends RowDataPacket, Usuario {
  rol: string;
  nombre: string;
  apellido: string;
}
interface TotalUserRowData extends RowDataPacket {
  total: number;
}

export class MySQLUserRepository implements UserRepository {
  async softDeleteMembersByContrataId(co_id: number): Promise<void> {
    await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.usuario u INNER JOIN general.personal p  ON u.p_id = p.p_id AND u.activo = 1  AND p.representante = 0 AND p.co_id = ? SET u.activo = 0`, values: [co_id] });
  }
  async findMembersByContrataId(co_id: number): Promise<Array<Usuario>> {
    const users = await MySQL2.executeQuery<UsuarioRowData[]>({ sql: `SELECT u.* FROM general.usuario u INNER JOIN general.personal p  ON u.p_id = p.p_id AND u.activo = 1  AND p.representante = 0 AND p.co_id = ?`, values: [co_id] });
    return users;
  }
  // async findWithRoleByPersonalUuId(p_uuid: string): Promise<UserWithRoleAndPersonal | undefined> {
  //   const users = await MySQL2.executeQuery<UsuarioRoleAndPersonalRowData[]>({
  //     sql: `SELECT u.* , r.rol , p.nombre, p.apellido FROM  general.usuario u INNER JOIN general.rol r ON u.rl_id = r.rl_id INNER JOIN general.personal p ON u.p_id = p.p_id WHERE  u.activo = 1  AND p.p_uuid = ? LIMIT 1`,
  //     values: [p_uuid],
  //   });

  //   if (users[0] !== undefined) {
  //     const { usuario, fecha, p_id, rl_id, apellido, nombre, rol, u_id, activo, u_uuid } = users[0];
  //     const result: UserWithRoleAndPersonal = {
  //       u_id,
  //       u_uuid,
  //       usuario,
  //       fecha,
  //       p_id,
  //       rl_id,
  //       rol: { rl_id, rol },
  //       personal: { apellido, nombre, p_id },
  //       activo,
  //     };
  //     return result;
  //   }
  //   return undefined;
  // }

  // async findByUuId(u_uuid: string): Promise<Usuario | undefined> {
  //   const users = await MySQL2.executeQuery<UsuarioRowData[]>({ sql: `SELECT * FROM general.usuario WHERE u_uuid = ? AND activo = 1 LIMIT 1`, values: [u_uuid] });
  //   return users[0];
  // }
  // async findWithRoleAndPersonalByUuId(u_uuid: string): Promise<UserWithRoleAndPersonal | undefined> {
  //   const users = await MySQL2.executeQuery<UsuarioRoleAndPersonalRowData[]>({
  //     sql: `SELECT u.* , r.rol , p.nombre, p.apellido FROM  general.usuario u INNER JOIN general.rol r ON u.rl_id = r.rl_id INNER JOIN general.personal p ON u.p_id = p.p_id WHERE u.u_uuid = ? AND u.activo = 1 LIMIT 1`,
  //     values: [u_uuid],
  //   });
  //   if (users[0] !== undefined) {
  //     const { usuario, fecha, apellido, nombre, p_id, rl_id, rol, u_id, activo } = users[0];
  //     const result: UserWithRoleAndPersonal = {
  //       u_id,
  //       u_uuid,
  //       usuario,
  //       fecha,
  //       p_id,
  //       personal: { apellido, nombre, p_id },
  //       rl_id,
  //       rol: { rl_id, rol },
  //       activo,
  //     };
  //     return result;
  //   }
  //   return undefined;
  // }

  async findByPersonalId(p_id: number): Promise<Array<Usuario>> {
    const users = await MySQL2.executeQuery<UsuarioRowData[]>({ sql: `SELECT * FROM general.usuario WHERE activo = 1 AND p_id = ?`, values: [p_id] });
    return users;
  }
  async softDeleteByPersonalId(p_id: number): Promise<void> {
    await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.usuario SET activo = 0 WHERE activo = 1 AND p_id = ? `, values: [p_id] });
  }
  async findByContrataId(co_id: number): Promise<Array<Usuario>> {
    const users = await MySQL2.executeQuery<UsuarioRowData[]>({ sql: `SELECT u.* FROM general.usuario u INNER JOIN general.personal p  ON u.p_id = p.p_id AND u.activo = 1 AND p.co_id = ?`, values: [co_id] });
    return users;
  }
  async softDeleteByContrataId(co_id: number): Promise<void> {
    await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.usuario u INNER JOIN general.personal p  ON u.p_id = p.p_id AND u.activo = 1 AND p.co_id = ? SET u.activo = 0`, values: [co_id] });
  }

  async findWithRoleAndPersonalById(u_id: number): Promise<UserWithRoleAndPersonal | undefined> {
    const users = await MySQL2.executeQuery<UsuarioRoleAndPersonalRowData[]>({
      sql: `SELECT u.* , r.rol , p.nombre, p.apellido FROM  general.usuario u INNER JOIN general.rol r ON u.rl_id = r.rl_id INNER JOIN general.personal p ON u.p_id = p.p_id WHERE u.u_id = ? AND u.activo = 1 LIMIT 1`,
      values: [u_id],
    });
    if (users[0] !== undefined) {
      const { usuario, fecha, apellido, nombre, p_id, rl_id, rol, activo } = users[0];
      const result: UserWithRoleAndPersonal = {
        u_id,
        usuario,
        fecha,
        p_id,
        personal: { apellido, nombre, p_id },
        rl_id,
        rol: { rl_id, rol },
        activo,
      };
      return result;
    }
    return undefined;
  }
  async isPersonalAvailable(p_id: number): Promise<boolean> {
    const users = await MySQL2.executeQuery<UsuarioRowData[]>({ sql: `SELECT * FROM general.usuario WHERE p_id = ? AND activo = 1 LIMIT 1`, values: [p_id] });
    return users[0] === undefined;
  }

  async countTotal(_filters?: any): Promise<number> {
    const totals = await MySQL2.executeQuery<TotalUserRowData[]>({ sql: `SELECT COUNT(*) AS total FROM general.usuario WHERE activo = 1` });
    return totals[0].total;
  }

  async findByOffsetPagination(limit: number, offset: number): Promise<UserWithRoleAndPersonal[]> {
    const users = await MySQL2.executeQuery<UsuarioRoleAndPersonalRowData[]>({
      sql: `SELECT  u.* , r.rol , p.nombre, p.apellido FROM  general.usuario u INNER JOIN general.rol r ON u.rl_id = r.rl_id INNER JOIN general.personal p ON u.p_id = p.p_id WHERE u.activo = 1 ORDER BY u.u_id ASC LIMIT ? OFFSET ?`,
      values: [limit, offset],
    });
    const result = users.map<UserWithRoleAndPersonal>(({ apellido, fecha, nombre, p_id, rl_id, rol, u_id, usuario, activo }) => ({ activo, u_id, usuario, fecha, p_id, personal: { apellido, nombre, p_id }, rl_id, rol: { rl_id, rol } }));
    return result;
  }

  async create(data: CreateUserDTO): Promise<Usuario> {
    const { usuario, contraseña, rl_id, p_id } = data;
    // const new_u_uuid = uuidv4();
    const fecha = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const result = await MySQL2.executeQuery<ResultSetHeader>({ sql: `INSERT INTO general.usuario ( usuario, contraseña, rl_id, p_id , fecha , activo ) VALUES ( ? , ? , ? , ? , ? , 1 )`, values: [usuario, contraseña, rl_id, p_id, fecha] });
    return { usuario, contraseña, rl_id, p_id, activo: 1, fecha, u_id: result.insertId };
  }

  async findById(u_id: number): Promise<Usuario | undefined> {
    const users = await MySQL2.executeQuery<UsuarioRowData[]>({ sql: `SELECT * FROM general.usuario WHERE u_id = ? AND activo = 1 LIMIT 1`, values: [u_id] });
    return users[0];
  }

  async update(u_id: number, fieldsUpdate: UpdateUserDTO): Promise<void> {
    const keyValueList = Object.entries(fieldsUpdate).filter(([, value]) => value !== undefined);
    const queryValues = keyValueList.reduce<{ setQuery: string; setValues: string[] }>(
      (prev, cur, index, arr) => {
        const result = prev;
        const [key, value] = cur;
        result.setQuery = `${result.setQuery.trim()} ${key} = ? ${index < arr.length - 1 ? ', ' : ''}`;
        result.setValues.push(value);
        return result;
      },
      { setQuery: '', setValues: [] },
    );

    await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.usuario SET ${queryValues.setQuery} WHERE u_id = ? LIMIT 1`, values: [...queryValues.setValues, u_id] });
  }

  async findAll(): Promise<Usuario[]> {
    const users = await MySQL2.executeQuery<UsuarioRowData[]>({ sql: `SELECT * FROM general.usuario WHERE activo = 1` });
    return users;
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    const users = await MySQL2.executeQuery<UsuarioRowData[]>({ sql: `SELECT * FROM general.usuario WHERE usuario = ? AND activo = 1 LIMIT 1`, values: [username] });
    return users[0] === undefined;
  }

  async softDelete(u_id: number): Promise<void> {
    await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.usuario SET activo = 0 WHERE u_id = ? LIMIT 1`, values: [u_id] });
  }
}
