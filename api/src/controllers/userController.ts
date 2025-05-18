import { Response } from 'express';
import { LogService } from '../services/logService.js';

const logService = new LogService('/opt/pglogs');
export class UserController {
    public getUserDescription(res: Response): void {
        const userDescription = logService.getUserDescription();
        res.json(userDescription);
    }
}
