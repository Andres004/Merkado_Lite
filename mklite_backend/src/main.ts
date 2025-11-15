import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from './data-source';

async function bootstrap() {
  try {
    await AppDataSource.initialize(); // espera que la conexión esté lista
    console.log('DataSource inicializado');
  } catch (error) {
    console.error('Error inicializando DataSource', error);
    process.exit(1); // aborta la app si no puede conectarse
  }

  const app = await NestFactory.create(AppModule, { cors: true });
  await app.listen(process.env.PORT ?? 3005);
  console.log(`Servidor corriendo en puerto ${process.env.PORT ?? 3005}`);
}

bootstrap();
