import { createFallback, withTryCatch } from "@/lib/utils";
import { Member, NewMember } from "./schema";
import { db } from "@/database/db";
import { memberSchema, profileSchema, serverSchema } from "@/database/models";
import { eq, sql, and, ne } from "drizzle-orm";

const preparedSelectMemberQuery = db
    .select()
    .from(memberSchema)
    .where(eq(memberSchema.id, sql.placeholder("memberId")))
    .limit(1);

const serverExistsPreparedQuery = db
    .selectDistinct({
        serverId: serverSchema.id,
    })
    .from(serverSchema)
    .where(
        and(
            eq(serverSchema.id, sql.placeholder("serverId")),
            eq(serverSchema.profileId, sql.placeholder("profileId")),
        ),
    )
    .limit(1);

const selectMembersByServerIdWithProfileQuery = db
    .select({
        member: {
            id: memberSchema.id,
            role: memberSchema.role,
            createdAt: memberSchema.createdAt,
            updatedAt: memberSchema.updatedAt,
            serverId: memberSchema.serverId,
            profileId: memberSchema.profileId,
        },
        profile: {
            id: profileSchema.id,
            userId: profileSchema.userId,
            name: profileSchema.name,
            imageUrl: profileSchema.imageUrl,
            email: profileSchema.email,
            createdAt: profileSchema.createdAt,
            updatedAt: profileSchema.updatedAt,
        },
    })
    .from(memberSchema)
    .where(eq(memberSchema.serverId, sql.placeholder("serverId")))
    .innerJoin(profileSchema, eq(memberSchema.profileId, profileSchema.id))
    .orderBy(memberSchema.role);

const deleteMemberPreparedQuery = db
    .delete(memberSchema)
    .where(
        and(
            eq(memberSchema.id, sql.placeholder("memberId")),
            ne(memberSchema.profileId, sql.placeholder("profileId")),
            eq(memberSchema.serverId, sql.placeholder("serverId")),
        ),
    );

export const createMember = async (member: NewMember) => {
    const insertFallback = createFallback("Error creating member:");
    const insertQuery = () => db.insert(memberSchema).values(member);

    await withTryCatch(insertQuery, insertFallback)();
    const selectQuery = async () =>
        (await preparedSelectMemberQuery.execute({ memberId: member.id }))[0];
    const selectFallback = createFallback("Error selecting member:");
    return withTryCatch(selectQuery, selectFallback)();
};

export const getMembersByServerIdWithProfile = async (serverId: string) => {
    const selectQuery = async () =>
        await selectMembersByServerIdWithProfileQuery.execute({ serverId });
    const selectFallback = createFallback("Error selecting members:");
    return withTryCatch(selectQuery, selectFallback)();
};

export const updateServerMemberRole = async (
    memberId: string,
    serverId: string,
    profileId: string,
    role: Member["role"],
) => {
    const updateFallback = createFallback("Error updating member:");
    const updateQuery = async () => {
        const server = await serverExistsPreparedQuery.execute({
            serverId,
            profileId,
        });
        if (!server.length) {
            throw new Error("Server does not exist");
        }

        await db
            .update(memberSchema)
            .set({ role })
            .where(
                and(
                    eq(memberSchema.id, memberId),
                    ne(memberSchema.profileId, profileId),
                    eq(memberSchema.serverId, serverId),
                ),
            );
        return server[0].serverId;
    };

    return withTryCatch(updateQuery, updateFallback)();
};

export const deleteMember = async (
    memberId: string,
    serverId: string,
    profileId: string,
) => {
    const fallback = createFallback("Error deleting member:");

    const callback = async () => {
        const server = await serverExistsPreparedQuery.execute({
            serverId,
            profileId,
        });
        if (!server.length) {
            throw new Error("Server does not exist");
        }

        await deleteMemberPreparedQuery.execute({
            memberId,
            profileId,
            serverId,
        });
        return server[0].serverId;
    };

    return withTryCatch(callback, fallback)();
};
