import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from './data-source';

async function bootstrap() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    console.log('DataSource inicializado correctamente');
  } catch (error) {
    console.error('Error fatal al conectar la Base de Datos:', error);
    process.exit(1); 
  }

  const app = await NestFactory.create(AppModule);

  app.enableCors(); 
  app.enableShutdownHooks(); 

  const port = process.env.PORT ?? 3005;
  await app.listen(port);
  console.log(`Servidor corriendo en: http://localhost:${port}`);
}

bootstrap();