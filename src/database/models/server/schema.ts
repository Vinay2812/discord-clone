import {
    mysqlTable,
    text,
    timestamp,
    uniqueIndex,
    varchar,
} from "drizzle-orm/mysql-core";
import { profile } from "../profile/schema";
import { relations, sql } from "drizzle-orm";
import { member } from "../member/schema";
import { channel } from "../channel/schema";

export const server = mysqlTable(
    "DiscordServer",
    {
        id: varchar("id", { length: 32 }).primaryKey(),
        name: text("name").notNull(),
        imageUrl: text("image_url").notNull(),
        inviteCode: varchar("invite_code", { length: 100 }).notNull().unique(),
        profileId: varchar("profile_id", { length: 32 }).notNull(),
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
        };
    },
);

export const serverRelations = relations(server, ({ one, many }) => ({
    profile: one(profile, {
        fields: [server.profileId],
        references: [profile.id],
    }),
    members: many(member),
    channels: many(channel),
}));

export type Server = typeof server.$inferSelect;
export type NewServer = typeof server.$inferInsert;
