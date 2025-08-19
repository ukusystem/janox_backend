import { ResultSetHeader, RowDataPacket, format } from 'mysql2';
import { MySQL2 } from '../../../database/mysql';
import { BaseAttach } from './baseAttach';
import bcrypt from 'bcrypt';
import * as queries from './queries';
// import * as useful from './useful'
import * as db2 from './db2';
import * as util from 'util';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function executeQuery<T extends RowDataPacket[] | ResultSetHeader>(sql: string, values: any[] | null = null, config: boolean = false) {
  try {
    return await MySQL2.executeQuery<T>({ sql: sql, values: values }, config);
  } catch (e) {
    console.log(`${e}\nQuery:\n${sql}`);
  }
  return null;
}

/**
 * Format the query with a node database name and execute it for each element in an array.
 * @param query Query to format and execute.
 * @param nodeID Node ID
 * @param parameters Array of parameters. Each element is an array of parameters for the query.
 * @param extra If not null, format the query once more with this value.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function executeBatchForNode(query: string, nodeID: number, parameters: any[][], extra: string | null = null) {
  // console.log(parameters);
  let fullQuery = BaseAttach.formatQueryWithNode(query, nodeID);
  if (extra) {
    fullQuery = util.format(fullQuery, extra);
  }
  // console.log(batchQuery);
  for (const parameter of parameters) {
    const q = format(fullQuery, parameter);
    // console.log('Query: \n'+q)
    await executeQuery<ResultSetHeader>(q);
  }
}

/**
 * Checks whether an active user exist in the database with the same user and
 * password combination.
 *
 * @param loginUser     User to match.
 * @param loginPassword Password to match. It should be already hashed if the
 *                      database stores hashed passwords.
 * @return The ID of the first user matching the given credential, ``-1`` if
 *         an error occurred or `0` if the credential doesn't match any
 *         active user.
 */
export async function userExist(loginUser: string, loginPassword: string): Promise<number> {
  // log("Password: %s", loginPassword);
  const users = await executeQuery<db2.UserPassword[]>(queries.loginManager, [loginUser]);
  if (!users) return -1;
  for (const user of users) {
    const match = await bcrypt.compare(loginPassword, user.contraseña);
    if (match) {
      return user.u_id;
    }
  }
  return 0;
}
