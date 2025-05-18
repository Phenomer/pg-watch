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
        const latestLogFilePath = this.getLatestLogFilePath(this.logDirPath);
        if (latestLogFilePath) {
            await this.readLogFile(latestLogFilePath);
        }
        this.watchLogFile();
    }

    private async readLogFile(latestLogFilePath:string) {
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

    /* 指定したディレクトリ内で最新のログファイルのパスを返す。 */
    private getLatestLogFilePath(directory: string): string | null {
        const files = fs.readdirSync(directory);
        const logFiles = files.filter(file => file.endsWith('.json'));
        if (logFiles.length === 0) return null;

        const latestFile = logFiles.reduce((prev, curr) => {
            const prevStat = fs.statSync(`${directory}/${prev}`);
            const currStat = fs.statSync(`${directory}/${curr}`);
            return prevStat.mtime > currStat.mtime ? prev : curr;
        });

        console.log(`latest log file: ${directory}/${latestFile}`);
        return `${directory}/${latestFile}`;
    }

    private updateUserDescription(jsonData: any) {
        if (jsonData.user && jsonData.dbname) {
            const user = jsonData.user;
            this.userDescription[user] = {
                user: jsonData.user,
                database: jsonData.dbname,
                query: jsonData.statement || '',
                message: jsonData.message || '',
                success: jsonData.error_severity !== 'ERROR',
                timestamp: jsonData.timestamp,
            };
        }
    }

    public getUserDescription(): Record<string, LogData> {
        return this.userDescription;
    }
}
