import { createFallback, withTryCatch } from "@/lib/utils";
import { NewChannel } from "./schema";
import { db } from "../../db";
import { channelSchema } from "..";
import { eq, sql } from "drizzle-orm";

const preparedSelectChannelQuery = db
    .select()
    .from(channelSchema)
    .where(eq(channelSchema.id, sql.placeholder("channelId")))
    .limit(1)
    .prepare();

const selectChannelByServerIdQuery = db
    .select()
    .from(channelSchema)
    .where(eq(channelSchema.serverId, sql.placeholder("serverId")))
    .prepare();

export const createChannel = async (channel: NewChannel) => {
    const insertFallback = createFallback("Error creating channel:");
    const insertQuery = () => db.insert(channelSchema).values(channel);

    await withTryCatch(insertQuery, insertFallback)();
    const selectQuery = async () =>
        (
            await preparedSelectChannelQuery.execute({ channelId: channel.id })
        )[0];

    const selectFallback = createFallback("Error selecting channel:");
    return withTryCatch(selectQuery, selectFallback)();
};

export const getChannelsByServerId = async (serverId: string) => {
    const selectQuery = async () =>
        await selectChannelByServerIdQuery.execute({ serverId });

    const selectFallback = createFallback("Error selecting channel:");
    return withTryCatch(selectQuery, selectFallback)();
};
