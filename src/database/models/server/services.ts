import { createFallback, withTryCatch } from "@/lib/utils";
import { NewServer, Server, server as serverSchema } from "./schema";
import { db } from "../../db";
import { SQL, and, eq, sql } from "drizzle-orm";

const preparedSelectServerByIdQuery = db
    .select()
    .from(serverSchema)
    .where(eq(serverSchema.id, sql.placeholder("serverId")))
    .limit(1)
    .prepare();

const preparedSelectServerByInviteCodeQuery = db
    .select()
    .from(serverSchema)
    .where(eq(serverSchema.inviteCode, sql.placeholder("inviteCode")))
    .limit(1)
    .prepare();

export const createServer = async (server: NewServer) => {
    const insertQuery = () => db.insert(serverSchema).values(server);
    const insertFallback = createFallback("Error creating server:");

    await withTryCatch(insertQuery, insertFallback)();

    const selectQuery = async () =>
        (
            await preparedSelectServerByIdQuery.execute({ serverId: server.id })
        )[0];
    const selectFallback = createFallback("Error selecting server:");
    return withTryCatch(selectQuery, selectFallback)()!;
};

export const getServerById = async (serverId: string) => {
    const fallback = createFallback("Error selecting server:");
    const selectQuery = async () =>
        (await preparedSelectServerByIdQuery.execute({ serverId }))[0];
    return withTryCatch(selectQuery, fallback)()!;
};

export const getServerByInviteCode = async (inviteCode: string) => {
    const fallback = createFallback("Error selecting server:");
    const selectQuery = async () =>
        (
            await preparedSelectServerByInviteCodeQuery.execute({ inviteCode })
        )[0];
    return withTryCatch(selectQuery, fallback)()!;
};

export const getServer = async (whereQuery: SQL<unknown> | undefined) => {
    const fallback = createFallback("Error selecting server:");
    const selectQuery = async () =>
        (await db.select().from(serverSchema).where(whereQuery).execute())[0];
    return withTryCatch(selectQuery, fallback)()!;
};

export const updateServer = async (
    server: Partial<Server>,
    whereQuery: SQL<unknown> | undefined,
    serverId: string,
) => {
    const updateFallback = createFallback("Error updating server:");
    const updateQuery = () =>
        db.update(serverSchema).set(server).where(whereQuery);

    await withTryCatch(updateQuery, updateFallback)();
    const selectQuery = async () =>
        (await preparedSelectServerByIdQuery.execute({ serverId }))[0];
    const selectFallback = createFallback("Error selecting server:");
    return withTryCatch(selectQuery, selectFallback)()!;
};

export const deleteServer = async (serverId: string, profileId: string) => {
    const deleteQuery = () =>
        db
            .delete(serverSchema)
            .where(
                and(
                    eq(serverSchema.id, serverId),
                    eq(serverSchema.profileId, profileId),
                ),
            );
    const deleteFallback = createFallback("Error deleting server:");
    return await withTryCatch(deleteQuery, deleteFallback)();
};
