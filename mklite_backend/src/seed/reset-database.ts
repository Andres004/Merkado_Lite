// src/seed/reset-database.ts
import 'reflect-metadata';
import { AppDataSource } from '../data-source';

async function resetDatabase() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    console.log('🔄 Limpiando TODAS las tablas de la base de datos...');

    // Desactivar claves foráneas
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0');

    // Obtener todas las tablas del schema actual (mklite)
    const tables: { TABLE_NAME?: string; table_name?: string }[] = await AppDataSource.query(`
      SELECT table_name AS TABLE_NAME
      FROM information_schema.tables
      WHERE table_schema = DATABASE();
    `);

    for (const row of tables) {
      const tableName = row.TABLE_NAME || row.table_name;
      if (!tableName) continue;

      console.log(`🗑️  TRUNCATE TABLE \`${tableName}\``);
      await AppDataSource.query(`TRUNCATE TABLE \`${tableName}\``);
    }

    // Reactivar claves foráneas
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log(' Base de datos limpiada. Ahora, al hacer npm run start:dev se volverán a insertar los datos del seed.');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error(' Error al limpiar la base de datos:', error);
    process.exit(1);
  }
}

resetDatabase();
