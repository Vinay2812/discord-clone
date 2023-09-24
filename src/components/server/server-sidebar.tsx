import React from "react";
import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";
import { db } from "@/database/db";
import {
    channelSchema,
    memberSchema,
    profileSchema,
    serverSchema,
} from "@/database/models";
import { Channel } from "@/database/models/channel/schema";
import { eq, sql } from "drizzle-orm";
import { createFallback, withTryCatch } from "@/lib/utils";
import ServerHeader from "./server-header";

type Props = {
    serverId: string;
};

const serverPreparedQuery = db
    .select()
    .from(serverSchema)
    .where(eq(serverSchema.id, sql.placeholder("serverId")))
    .limit(1)
    .prepare();

const channelPreparedQuery = db
    .select()
    .from(channelSchema)
    .where(eq(channelSchema.serverId, sql.placeholder("serverId")))
    .orderBy(channelSchema.createdAt)
    .prepare();

const memberWithProfilePreparedQuery = db
    .select({
        id: memberSchema.id,
        role: memberSchema.role,
        profileId: memberSchema.profileId,
        serverId: memberSchema.serverId,
        createdAt: memberSchema.createdAt,
        updatedAt: memberSchema.updatedAt,
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
    .orderBy(memberSchema.role)
    .prepare();

function getServer(serverId: string) {
    const fallback = createFallback(`Failed to get server`);
    const callback = async () => {
        const server = (await serverPreparedQuery.execute({ serverId }))[0];
        if (!server) {
            return null;
        }
        const channels = await channelPreparedQuery.execute({ serverId });
        const members = await memberWithProfilePreparedQuery.execute({
            serverId,
        });
        return {
            ...server,
            channels,
            members,
        };
    };
    return withTryCatch(callback, fallback)();
}

export default async function ServerSidebar({ serverId }: Props) {
    const profile = await currentProfile();

    if (!profile) {
        return redirect("/");
    }

    const server = await getServer(serverId);

    if (!server) {
        return redirect("/");
    }

    const { textChannels, audioChannels, videoChannels } =
        server.channels.reduce(
            (acc, channel) => {
                if (channel.type === "TEXT") {
                    acc.textChannels.push(channel);
                } else if (channel.type === "AUDIO") {
                    acc.audioChannels.push(channel);
                } else if (channel.type === "VIDEO") {
                    acc.videoChannels.push(channel);
                }
                return acc;
            },
            {
                textChannels: [] as Channel[],
                audioChannels: [] as Channel[],
                videoChannels: [] as Channel[],
            },
        );

    const members = server.members.filter(
        (member) => member.profileId !== profile.id,
    );
    const role = server.members.find(
        (member) => member.profileId === profile.id,
    )?.role;

    return (
        <div className="flex h-full w-full flex-col bg-[#F2F3F5] text-primary dark:bg-[#2B2B31]">
            <ServerHeader server={server} role={role} />
        </div>
    );
}
