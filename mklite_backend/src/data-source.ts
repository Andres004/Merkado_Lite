import { DataSource } from "typeorm";
import { join } from 'path';

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "merkado_admin",
    password: "Merkado2025!", //Password local, no me dejo crear usuario con password 123
    database: "mklite",
    synchronize: true,
    logging: true,
    entities: [join(__dirname, '**', '*.entity{.js,.ts}')],
    subscribers: [],
    migrations: [],
})