import { memberSchema } from "@/database/models";
import {
    createChannel,
    getChannelsByServerId,
} from "@/database/models/channel/services";
import { getMembers } from "@/database/models/member/services";
import { getServerById } from "@/database/models/server/services";
import { currentProfile } from "@/lib/current-profile";
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

        const server = await getServerById(serverId);
        const channels = await getChannelsByServerId(serverId);

        return NextResponse.json({
            ...server,
            channels,
            members,
        });
    };
    return withTryCatch(callback, fallback)();
}
