import { DataSource } from "typeorm";
import { join } from "path"; // Importante para arreglar rutas

// 1. IMPORTAMOS MANUALMENTE LAS ENTIDADES CONFLICTIVAS
import { User } from "./entity/user.entity";
import { Role } from "./entity/role.entity";
import { UserRole } from "./entity/userrole.entity";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "merkado_admin",
  password: "123",
  database: "mklite",
  synchronize: true,
  logging: true,
  entities: [
    // 2. LAS PONEMOS PRIMERO EN LA LISTA
    User, 
    Role, 
    UserRole, 
    // 3. LUEGO CARGAMOS EL RESTO AUTOMÁTICAMENTE
    join(__dirname, "**", "*.entity.{ts,js}"),
  ],
  subscribers: [],
  migrations: [],
});