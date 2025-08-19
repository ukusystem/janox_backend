import { CronJob } from 'cron';
import { MySQL2 } from '../database/mysql';
import { ResultSetHeader } from 'mysql2';
import { genericLogger } from '../services/loggers';
import dayjs from 'dayjs';

export class TokenManger {
  private static async deleteRevokeTokens() {
    try {
      const curDate = dayjs().format('YYYY-MM-DD HH:mm:ss');
      await MySQL2.executeQuery<ResultSetHeader>({ sql: `DELETE FROM general.user_token WHERE revoked = 1 OR expires_at < '${curDate}' ` });
    } catch (error) {
      genericLogger.error('Error al eliminar token revocados.', error);
    }
  }
  static async init() {
    try {
      await TokenManger.deleteRevokeTokens();

      const deleteTokenJob = CronJob.from({
        cronTime: '0 0 0 * * *',
        onTick: async function () {
          await TokenManger.deleteRevokeTokens();
        },
        onComplete: null,
        start: false,
      });
      deleteTokenJob.start();
    } catch (error) {
      genericLogger.error('Error al inicializar TokenManager', error);
      throw error;
    }
  }
}
