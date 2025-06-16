import mysql from 'mysql2/promise';
export interface DatabaseConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    connectionLimit: number;
}
export declare const dbConfig: DatabaseConfig;
export declare const pool: mysql.Pool;
export declare const testConnection: () => Promise<void>;
export declare const query: (sql: string, params?: any[]) => Promise<any>;
export default pool;
