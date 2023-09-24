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

export const memberRole = mysqlEnum("DiscordMemberRole", [
    "ADMIN",
    "MODERATOR",
    "GUEST",
]);

export const member = mysqlTable(
    "DiscordMember",
    {
        id: varchar("id", { length: 32 }).primaryKey(),
        role: memberRole.default("GUEST").notNull(),

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
    (table) => ({
        idIdx: uniqueIndex("id_idx").on(table.id),
    }),
);

export const memberRelations = relations(member, ({ one }) => ({
    profile: one(profile, {
        fields: [member.profileId],
        references: [profile.id],
    }),
    server: one(server, {
        fields: [member.serverId],
        references: [server.id],
    }),
}));

export type Member = typeof member.$inferSelect;
export type NewMember = typeof member.$inferInsert;
