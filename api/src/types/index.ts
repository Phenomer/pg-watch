export interface LogData {
    user: string;
    database: string;
    query: string;
    message: string;
    success: boolean;
    timestamp: string;
}

export interface UserDescription {
    [user: string]: LogData;
}
