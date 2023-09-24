import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

if (!process.env.DATABASE_URL) {
    throw new Error("Database url not found");
}

export default {
    schema: "src/database/models/**/schema.ts",
    out: "src/database/migrations",
    driver: "mysql2",
    dbCredentials: {
        connectionString: process.env.DATABASE_URL,
    },
} satisfies Config;
