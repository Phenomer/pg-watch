import React, { useEffect, useState } from 'react';
import './UserQueryStatus.css';

interface UserQuery {
    timestamp: string;
    database: string;
    message: string;
    query: string;
    success: boolean;
}

interface UserQueryData {
    [user: string]: UserQuery;
}

// UTC時刻をJST時刻に変換しstringで返す
const convertToJST = (utcTimestamp: string): string => {
    const utcDate = new Date(utcTimestamp);
    const jstOffset = 9 * 60;
    const jstDate = new Date(utcDate.getTime() + jstOffset * 60 * 1000);
    return jstDate.toISOString().replace('T', ' ').substring(0, 19);
};

const UserQueryStatus: React.FC = () => {
    const [data, setData] = useState<UserQueryData>({});

    // データを取得
    const fetchUserQueryStatus = async () => {
        try {
            const response = await fetch('/api/user_description.json');
            const result: UserQueryData = await response.json();
            setData(result);
        } catch (error) {
            console.error('Error fetching user query status:', error);
        }
    };

    // 初回データ取得と定期更新
    useEffect(() => {
        fetchUserQueryStatus();
        // 1秒ごとにデータを更新
        const interval = setInterval(fetchUserQueryStatus, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div id="user-query-status-container">
            {Object.keys(data).map((user) => {
                const item = data[user];
                return (
                    <React.Fragment key={user}>
                        <div className="timestamp">{convertToJST(item.timestamp)}</div>
                        <div className="user">{user}</div>
                        <div className="database">{item.database}</div>
                        <div className="message">{item.message}</div>
                        <div className="query">{item.query}</div>
                        <div className="status">{item.success ? 'Success' : 'Error'}</div>
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default UserQueryStatus;
