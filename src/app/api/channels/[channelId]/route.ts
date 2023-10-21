import { memberSchema } from "@/database/models";
import {
    deleteChannelById,
    getChannelsByServerId,
    updateChannel,
} from "@/database/models/channel/services";
import { getMembers } from "@/database/models/member/services";
import { currentProfile } from "@/lib/current-profile";
import { serverWithMembersAndProfiles } from "@/lib/server-with-members";
import { withTryCatch } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const DELETE = async (
    req: Request,
    { params }: { params: { channelId: string } },
) => {
    const fallback = (error: Error) => {
        console.log("Channel DELETE error: ", error);
        return new Response("Internal Server Error", { status: 500 });
    };

    const callback = async () => {
        const profile = await currentProfile();
        const { searchParams } = new URL(req.url);
        const serverId = searchParams.get("serverId");
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!params.channelId) {
            return new NextResponse("Channel Id Missing", { status: 400 });
        }

        if (!serverId) {
            return new NextResponse("Server Id Missing", { status: 400 });
        }
        const members = await getMembers(
            and(
                eq(memberSchema.profileId, profile.id),
                eq(memberSchema.serverId, params.channelId),
                eq(memberSchema.role, "GUEST"),
            ),
        );

        if (members.length) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await deleteChannelById(serverId, params.channelId);

        const server = await serverWithMembersAndProfiles(serverId);
        return NextResponse.json(server);
    };

    return withTryCatch(callback, fallback)();
};

export const PATCH = async (
    req: Request,
    { params }: { params: { channelId: string } },
) => {
    const fallback = (error: Error) => {
        console.log("Channel PATCH error: ", error);
        return new Response("Internal Server Error", { status: 500 });
    };

    const callback = async () => {
        const profile = await currentProfile();
        const { searchParams } = new URL(req.url);
        const serverId = searchParams.get("serverId");
        const { name, type } = await req.json();

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!params.channelId) {
            return new NextResponse("Channel Id Missing", { status: 400 });
        }

        if (!serverId) {
            return new NextResponse("Server Id Missing", { status: 400 });
        }

        if (name === "general") {
            return new NextResponse("Name cannot be 'general'", {
                status: 400,
            });
        }
        
        const members = await getMembers(
            and(
                eq(memberSchema.profileId, profile.id),
                eq(memberSchema.serverId, params.channelId),
                eq(memberSchema.role, "GUEST"),
            ),
        );
        if (members.length) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const updatedServerId = await updateChannel(serverId, {
            id: params.channelId,
            name,
            type,
        });

        const server = await serverWithMembersAndProfiles(updatedServerId);

        return NextResponse.json(server);
    };

    return withTryCatch(callback, fallback)();
};
