import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from './data-source';

async function bootstrap() {
  try {
    // 1. Conectar a la base de datos
    await AppDataSource.initialize();
    console.log('✅ BD conectada');
  } catch (err) {
    console.error('❌ Error al conectar BD:', err);
    process.exit(1); // si falla, se cierra la app
  }

  // 2. Levantar Nest
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
