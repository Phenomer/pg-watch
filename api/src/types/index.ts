export interface LogData {
    user: string;
    database: string;
    statement: string;
    message: string;
    success: boolean;
    timestamp: string;
}

export interface UserDescription {
    [user: string]: LogData;
}
