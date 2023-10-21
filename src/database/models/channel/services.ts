import { createFallback, withTryCatch } from "@/lib/utils";
import { Channel, NewChannel } from "./schema";
import { db } from "@/database/db";
import { channelSchema } from "@/database/models";
import { and, eq, ne, sql } from "drizzle-orm";

const selectChannelByIdQuery = db
    .select()
    .from(channelSchema)
    .where(eq(channelSchema.id, sql.placeholder("channelId")))
    .limit(1)
    .prepare();

const selectChannelsByServerIdQuery = db
    .select()
    .from(channelSchema)
    .where(eq(channelSchema.serverId, sql.placeholder("serverId")))
    .prepare();

export const createChannel = async (channel: NewChannel) => {
    const insertFallback = createFallback("Error creating channel:");
    const insertQuery = () => db.insert(channelSchema).values(channel);

    await withTryCatch(insertQuery, insertFallback)();
    const selectQuery = async () =>
        (await selectChannelByIdQuery.execute({ channelId: channel.id }))[0];

    const selectFallback = createFallback("Error selecting channel:");
    return withTryCatch(selectQuery, selectFallback)();
};

export const getChannelsByServerId = async (serverId: string) => {
    const selectQuery = async () =>
        await selectChannelsByServerIdQuery.execute({ serverId });

    const selectFallback = createFallback("Error selecting channel:");
    return withTryCatch(selectQuery, selectFallback)();
};

export const updateChannel = async (
    serverId: string,
    channel: {
        id: string;
        name: string;
        type: Channel["type"];
    },
) => {
    const updateQuery = async () => {
        await db
            .update(channelSchema)
            .set({
                name: channel.name,
                type: channel.type,
            })
            .where(
                and(
                    eq(channelSchema.id, channel.id),
                    eq(channelSchema.serverId, serverId),
                    ne(channelSchema.name, "general"),
                ),
            );
        return serverId;
    };

    const updateFallback = createFallback("Error updating channel:");
    return withTryCatch(updateQuery, updateFallback)();
};

export const deleteChannelById = async (
    serverId: string,
    channelId: string,
) => {
    const deleteQuery = () =>
        db
            .delete(channelSchema)
            .where(
                and(
                    eq(channelSchema.id, channelId),
                    eq(channelSchema.serverId, serverId),
                    ne(channelSchema.name, "general"),
                ),
            );

    const deleteFallback = createFallback("Error deleting channel:");
    return withTryCatch(deleteQuery, deleteFallback)();
};
