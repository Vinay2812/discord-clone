import {
    mysqlTable,
    text,
    timestamp,
    uniqueIndex,
    varchar,
} from "drizzle-orm/mysql-core";
import { server } from "../server/schema";
import { relations, sql } from "drizzle-orm";
import { member } from "../member/schema";
import { channel } from "../channel/schema";

export const profile = mysqlTable(
    "DiscordProfile",
    {
        id: varchar("id", { length: 32 }).primaryKey(),
        userId: varchar("user_id", { length: 255 }).notNull().unique(),
        name: text("name").notNull(),
        imageUrl: text("image_url").notNull(),
        email: text("email").notNull(),
        createdAt: timestamp("created_at")
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp("updated_at")
            .onUpdateNow()
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    (table) => {
        return {
            idIdx: uniqueIndex("id_idx").on(table.id),
            userIdIdx: uniqueIndex("user_id_idx").on(table.userId),
        };
    },
);

export const profileRelations = relations(profile, ({ many }) => ({
    servers: many(server),
    members: many(member),
    channels: many(channel),
}));

export type Profile = typeof profile.$inferSelect;
export type NewProfile = typeof profile.$inferInsert;
