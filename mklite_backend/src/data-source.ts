import { DataSource } from "typeorm";
import { join } from 'path';

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "merkado_admin",
<<<<<<< HEAD
    password: "123",
=======
    password: "Merkado2025!", //Password local, no me dejo crear usuario con password 123
>>>>>>> 41d5472282f84790036fd5dd0821eff019cba2df
    database: "mklite",
    synchronize: true,
    logging: true,
    entities: [join(__dirname, '**', '*.entity{.js,.ts}')],
    subscribers: [],
    migrations: [],
})