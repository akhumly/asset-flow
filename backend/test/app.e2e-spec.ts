// test/app.e2e-spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.$transaction([
      prisma.user.deleteMany(),
      // Add other models if needed
    ]);
    await app.close();
  });

  it('/auth/register (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'admin', // Add this line
      })
      .expect(201);

    expect(response.body.email).toBe('test@example.com');
    expect(response.body.role).toBe('admin'); // Add this assertion
  });

  it('/auth/login (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(201);

    expect(response.body).toHaveProperty('access_token');
    accessToken = response.body.access_token;
  });

  it('/users (GET) - authorized', async () => {
    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].email).toBe('test@example.com');
  });

  it('/users (GET) - unauthorized', async () => {
    await request(app.getHttpServer()).get('/users').expect(401);
  });
});
