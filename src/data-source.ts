import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'admin',
  database: 'webbee_backend_hackathon',
  synchronize: false, // careful with this
  logging: true,
  entities: ['build/entity/**/*.{js,ts}'],
  migrations: ['build/migration/**/*.{js,ts}'],
  subscribers: [],
});
