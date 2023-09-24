import {
    mysqlEnum,
    mysqlTable,
    timestamp,
    uniqueIndex,
    varchar,
} from "drizzle-orm/mysql-core";
import { profile } from "../profile/schema";
import { relations, sql } from "drizzle-orm";
import { server } from "../server/schema";

export const channelType = mysqlEnum("DiscordChannelType", [
    "TEXT",
    "AUDIO",
    "VIDEO",
]);

export const channel = mysqlTable(
    "DiscordChannel",
    {
        id: varchar("id", { length: 32 }).primaryKey(),
        name: varchar("name", { length: 255 }).notNull(),
        type: channelType.default("TEXT").notNull(),

        profileId: varchar("profile_id", { length: 32 }).notNull(),
        serverId: varchar("server_id", { length: 32 }).notNull(),
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

export const channelRelations = relations(channel, ({ one }) => ({
    profile: one(profile, {
        fields: [channel.profileId],
        references: [profile.id],
    }),
    server: one(server, {
        fields: [channel.serverId],
        references: [server.id],
    }),
}));

export type Channel = typeof channel.$inferSelect;
export type NewChannel = typeof channel.$inferInsert;
