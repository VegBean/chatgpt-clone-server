import { drizzle } from "drizzle-orm/neon-http";

const db = drizzle(
  "postgresql://neondb_owner:npg_vzL6ukdsA7Nc@ep-flat-haze-ai7caisw-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
);

export default db;
