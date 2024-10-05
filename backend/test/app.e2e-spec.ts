import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';

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
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    // Clean up the test user
    await prisma.user.deleteMany({
      where: {
        email: 'unique-test@example.com',
      },
    });
    await prisma.$disconnect();
    await app.close();
  });

  it('/auth/register (POST)', async () => {
    const registerData = {
      email: 'unique-test@example.com', // Ensure uniqueness
      password: 'password123',
      name: 'Test User',
      role: 'admin',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerData)
      .expect(201);

    expect(response.body.email).toBe(registerData.email);
    expect(response.body.role).toBe('admin');
  });

  it('/auth/login (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'unique-test@example.com',
        password: 'password123',
      })
      .expect(201);

    accessToken = response.body.access_token;
    expect(accessToken).toBeDefined();

    const decodedToken = jwt.decode(accessToken);
    expect(decodedToken).toHaveProperty('role', 'admin');
  });

  it('/users (GET) - authorized', async () => {
    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    // Verify that at least the seeded admin and the test user exist
    expect(response.body.length).toBeGreaterThanOrEqual(2);
    const testUser = response.body.find((user) => user.email === 'unique-test@example.com');
    expect(testUser).toBeDefined();
    expect(testUser.email).toBe('unique-test@example.com');
  });

  it('/users (GET) - unauthorized', async () => {
    await request(app.getHttpServer()).get('/users').expect(401);
  });
});
