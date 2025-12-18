import { DataSource } from "typeorm";
import { join } from 'path';

export const AppDataSource = new DataSource({
    type: "mysql",
    
    // URL de Railway 
    url: process.env.DATABASE_URL,

    // Variables individuales (Fallbacks)
    host: process.env.MYSQLHOST || "localhost",
    port: Number(process.env.MYSQLPORT) || 3306,
    username: process.env.MYSQLUSER || "merkado_admin",
    password: process.env.MYSQLPASSWORD || "123",
    database: process.env.MYSQLDATABASE || "mklite",

    synchronize: process.env.SYNCHRONIZE === 'true', 
    
    logging: true,
    entities: [join(__dirname, '**', '*.entity{.js,.ts}')],
    subscribers: [],
    migrations: [],
});