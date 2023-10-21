import {
    deleteMember,
    getMembersByServerIdWithProfile,
    updateServerMemberRole,
} from "@/database/models/member/services";
import { getServerById } from "@/database/models/server/services";
import { currentProfile } from "@/lib/current-profile";
import { serverWithMembersAndProfiles } from "@/lib/server-with-members";
import { withTryCatch } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: { params: { memberId: string } },
) {
    const fallback = (error: Error) => {
        console.log("[MEMBERS_ID PATCH]", error);
        return new NextResponse("Internal server error", { status: 500 });
    };

    const callback = async () => {
        const profile = await currentProfile();
        const { searchParams } = new URL(req.url);
        const { role } = await req.json();

        const serverId = searchParams.get("serverId");

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!serverId) {
            return new NextResponse("Server Id missing", { status: 400 });
        }

        if (!params.memberId) {
            return new NextResponse("Member Id missing", { status: 400 });
        }

        const updatedServerId = await updateServerMemberRole(
            params.memberId,
            serverId,
            profile.id,
            role,
        );

        // const server = await getServerById(updatedServerId);
        // const membersWithProfiles =
        //     await getMembersByServerIdWithProfile(updatedServerId);

        // const membersWithProfile = membersAndProfiles.map((member) => {
        //     return {
        //         ...member.member,
        //         profile: member.profile,
        //     };
        // });

        const server = await serverWithMembersAndProfiles(updatedServerId);

        return NextResponse.json(server);
    };

    return withTryCatch(callback, fallback)();
}

export async function DELETE(
    req: Request,
    { params }: { params: { memberId: string } },
) {
    const fallback = (error: Error) => {
        console.log("[MEMBERS_ID DELETE]", error);
        return new NextResponse("Internal server error", { status: 500 });
    };

    const callback = async () => {
        const profile = await currentProfile();
        const { searchParams } = new URL(req.url);

        const serverId = searchParams.get("serverId");

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!serverId) {
            return new NextResponse("Server Id missing", { status: 400 });
        }

        if (!params.memberId) {
            return new NextResponse("Member Id missing", { status: 400 });
        }

        const updatedServerId = await deleteMember(
            params.memberId,
            serverId,
            profile.id,
        );

        // const server = await getServerById(updatedServerId);
        // const membersWithProfiles =
        //     await getMembersByServerIdWithProfile(updatedServerId);

        // const membersWithProfile = membersAndProfiles.map((member) => {
        //     return {
        //         ...member.member,
        //         profile: member.profile,
        //     };
        // });

        const server = await serverWithMembersAndProfiles(updatedServerId);

        return NextResponse.json(server);
    };

    return withTryCatch(callback, fallback)();
}
