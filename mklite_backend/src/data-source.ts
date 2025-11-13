import { DataSource } from "typeorm";
import { User } from "./entity/user.entity";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "merkado_admin",
    password: "123456789",
    database: 'merkado_lite',
    synchronize: true,
    logging: true,
    entities: [User],
    subscribers: [],
    migrations: [],
})