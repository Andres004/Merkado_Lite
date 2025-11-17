import { AppDataSource } from './data-source'; // Asegúrate de que la ruta a data-source sea correcta

async function resetDatabase() {
    try {
        console.log('Conectando a la base de datos...');
        await AppDataSource.initialize();
        
        const queryRunner = AppDataSource.createQueryRunner();
        
        console.log('Limpiando datos...');
        
        // 1. Desactivar protección de llaves foráneas
        await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
        
        // 2. Obtener todas las tablas registradas en tus entidades
        const entities = AppDataSource.entityMetadatas;
        
        for (const entity of entities) {
            const tableName = entity.tableName;
            console.log(`   - Vaciando tabla: ${tableName}`);
            // Usamos TRUNCATE para reiniciar los IDs a 1
            await queryRunner.query(`TRUNCATE TABLE \`${tableName}\``);
        }
        
        // 3. Reactivar protección de llaves foráneas
        await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
        
        console.log('Base de datos limpiada correctamente (Tablas mantenidas, IDs reiniciados).');
        
        await AppDataSource.destroy();
        process.exit(0);
        
    } catch (error) {
        console.error('Error al limpiar la base de datos:', error);
        process.exit(1);
    }
}

resetDatabase();