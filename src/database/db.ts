import { drizzle } from "drizzle-orm/planetscale-serverless";
import { connect } from "@planetscale/database";
import { withTryCatch } from "../lib/utils";

function createDbConnection() {
    const fallback = (err: Error) => {
        console.log("❌ [mysql]: failed to connect");
        throw err;
    };
    const connectDb = () => {
        const connection = connect({
            url: process.env.DATABASE_URL,
        });
        console.log("✅ [mysql]: connected");
        return connection;
    };
    return withTryCatch(connectDb, fallback)()
}

export const db = drizzle(createDbConnection());
