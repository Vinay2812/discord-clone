import { db } from "@/database/db";
import { memberSchema, serverSchema } from "@/database/models";
import { NewMember } from "@/database/models/member/schema";
import { createMember } from "@/database/models/member/services";
import { getServerByInviteCode } from "@/database/models/server/services";
import { currentProfile } from "@/lib/current-profile";
import { uniqueId } from "@/lib/utils";
import { redirectToSignIn } from "@clerk/nextjs";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

type Props = {
    params: {
        inviteCode: string;
    };
};

const preparedUserExistQuery = db
    .select({
        serverId: serverSchema.id,
    })
    .from(serverSchema)
    .where(eq(serverSchema.inviteCode, sql.placeholder("inviteCode")))
    .innerJoin(memberSchema, eq(serverSchema.id, memberSchema.serverId))
    .where(eq(memberSchema.profileId, sql.placeholder("profileId")))
    .limit(1);

async function checkUserExistsInServer(inviteCode: string, profileId: string) {
    return (
        await preparedUserExistQuery.execute({
            inviteCode,
            profileId,
        })
    )[0];
}

async function insertMemberToServer(
    inviteCode: string,
    member: Omit<NewMember, "serverId">,
) {
    const server = await getServerByInviteCode(inviteCode);
    if (!server.id) {
        return null;
    }

    await createMember({
        ...member,
        serverId: server.id,
    });
    return server.id;
}

export default async function InviteCodePage({ params }: Props) {
    const profile = await currentProfile();
    if (!profile) {
        return redirectToSignIn();
    }

    if (!params.inviteCode) {
        return redirect("/");
    }

    const existingServer = await checkUserExistsInServer(
        params.inviteCode,
        profile.id,
    );

    if (existingServer?.serverId) {
        return redirect(`/servers/${existingServer.serverId}`);
    }

    const serverId = await insertMemberToServer(params.inviteCode, {
        id: uniqueId(),
        profileId: profile.id,
    });

    if (serverId) {
        return redirect(`/servers/${serverId}`);
    }

    return null;
}
