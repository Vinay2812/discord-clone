import {
    deleteMember,
    deleteMemberByMemberId,
    getMemberByProfileIdAndServerId,
    getMembersByServerId,
} from "@/database/models/member/services";
import { getServerById } from "@/database/models/server/services";
import { currentProfile } from "@/lib/current-profile";
import { withTryCatch } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    {
        params,
    }: {
        params: {
            serverId: string;
        };
    },
) {
    const fallback = (error: Error) => {
        console.log("SERVER_ID_LEAVE", error);
        return new NextResponse(error.message, { status: 500 });
    };

    const callback = async () => {
        const profile = await currentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        if (!params.serverId) {
            return new NextResponse("Missing serverId", { status: 400 });
        }

        const server = await getServerById(params.serverId);
        if (!server) {
            return new NextResponse("Server not found", { status: 404 });
        }
        if (server.profileId === profile.id) {
            return new NextResponse("Action Not Allowed", { status: 401 });
        }

        const members = await getMembersByServerId(params.serverId);

        const isMember = members.find(
            (member) => member.profileId === profile.id,
        );

        if (!isMember) {
            return new NextResponse("Member not found", { status: 404 });
        }

        await deleteMemberByMemberId(members[0].id);

        const filteredMembers = members.filter(
            (member) => member.profileId !== profile.id,
        );

        return NextResponse.json({
            ...server,
            members: filteredMembers,
        });
    };

    return withTryCatch(callback, fallback)();
}
