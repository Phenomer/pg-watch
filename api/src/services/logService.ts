import fs from 'fs';
import { promisify } from 'util';
import { LogData } from '../types/index';

const readFile = promisify(fs.readFile);

export class LogService {
    private userDescription: Record<string, LogData> = {};
    constructor(private logDirPath: string) {
        this.loadLogs();
    }

    private async loadLogs() {
        this.readAllLogFiles(this.logDirPath);
        this.watchLogFile();
    }

    private async readLogFile(latestLogFilePath: string) {
        try {
            const data = await readFile(latestLogFilePath, 'utf-8');
            const lines = data.split('\n').filter(line => line.trim() !== '');
            lines.forEach(line => {
                console.log(line);
                this.updateUserDescription(JSON.parse(line));
            });
        } catch (error) {
            console.error('Error reading log file:', error);
        }
    }

    private watchLogFile() {
        fs.watch(this.logDirPath, async (eventType, fileName) => {
            if (eventType !== 'change') { return };
            if (!fileName) { return }
            if (fileName.endsWith('.json')) {
                await this.readLogFile(`${this.logDirPath}/${fileName}`);
            }
        });
    }

    /* 全てのログファイルに対してreadLogFileを実行する。 */
    private async readAllLogFiles(targetDir: string) {
        const files = fs.readdirSync(targetDir);
        const logFiles = files.filter(file => file.endsWith('.json'));

        /* ログファイルを更新日時でソート */
        logFiles.sort((a, b) => {
            const aTime = fs.statSync(`${targetDir}/${a}`).mtime;
            const bTime = fs.statSync(`${targetDir}/${b}`).mtime;
            return aTime.getTime() - bTime.getTime();
        });

        for (const file of logFiles) {
            await this.readLogFile(`${targetDir}/${file}`);
        }
    }

    /* 指定したディレクトリ内で最新のログファイルのパスを返す。 */
    /*
    private getLatestLogFilePath(targetDir: string): string | null {
        const files = fs.readdirSync(targetDir);
        const logFiles = files.filter(file => file.endsWith('.json'));
        if (logFiles.length === 0) return null;

        const latestFile = logFiles.reduce((prev, curr) => {
            const prevStat = fs.statSync(`${targetDir}/${prev}`);
            const currStat = fs.statSync(`${targetDir}/${curr}`);
            return prevStat.mtime > currStat.mtime ? prev : curr;
        });

        console.log(`latest log file: ${targetDir}/${latestFile}`);
        return `${targetDir}/${latestFile}`;
    }
    */

    private updateUserDescription(jsonData: any) {
        if (jsonData.user && jsonData.dbname) {
            const user = jsonData.user;

            // timestampをISO 8601形式（"YYYY-MM-DDTHH:mm:ss.sssZ"）に変換
            let isoTimestamp = jsonData.timestamp;
            if (typeof isoTimestamp === 'string') {
                // "2025-05-19 03:01:58.471 UTC" → "2025-05-19T03:01:58.471Z"
                isoTimestamp = isoTimestamp
                    .replace(' ', 'T')
                    .replace(' UTC', 'Z');
            }

            this.userDescription[user] = {
                user: jsonData.user,
                database: jsonData.dbname,
                statement: jsonData.statement || '',
                message: jsonData.message || '',
                success: jsonData.error_severity !== 'ERROR',
                timestamp: isoTimestamp,
            };
        }
    }

    public getUserDescription(): Record<string, LogData> {
        return this.userDescription;
    }
}
