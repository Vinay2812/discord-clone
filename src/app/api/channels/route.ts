import { memberSchema } from "@/database/models";
import {
    createChannel,
} from "@/database/models/channel/services";
import { getMembers } from "@/database/models/member/services";
import { currentProfile } from "@/lib/current-profile";
import { serverWithMembersAndProfiles } from "@/lib/server-with-members";
import { uniqueId, withTryCatch } from "@/lib/utils";
import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const fallback = (error: Error) => {
        console.log("Channel POST error: ", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    };

    const callback = async () => {
        const profile = await currentProfile();
        const { name, type } = await req.json();
        const { searchParams } = new URL(req.url);
        const serverId = searchParams.get("serverId");

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!serverId) {
            return new NextResponse("Server Id Missing", { status: 400 });
        }

        if (name === "general") {
            return new NextResponse("Invalid Channel Name", { status: 400 });
        }

        const members = await getMembers(
            and(
                eq(memberSchema.serverId, serverId),
                eq(memberSchema.profileId, profile.id),
                inArray(memberSchema.role, ["ADMIN", "MODERATOR"]),
            ),
        );

        if (!members.length) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await createChannel({
            id: uniqueId(),
            name,
            type,
            serverId,
            profileId: profile.id,
        });
        const server = await serverWithMembersAndProfiles(serverId);
        return NextResponse.json(server);
    };
    return withTryCatch(callback, fallback)();
}
