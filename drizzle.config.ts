import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://neondb_owner:npg_vzL6ukdsA7Nc@ep-flat-haze-ai7caisw-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  },
});
