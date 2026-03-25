import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedsService } from './modules/seeds/seeds.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedsService = app.get(SeedsService);

  try {
    await seedsService.run();
    console.log('Seeding process finished.');
  } catch (error) {
    console.error('Seeding process failed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
