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
// import { ScrollArea } from "@/components/ui";
import ServerSidebarContent from "./server-sidebar-content";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";

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

const iconMap = {
    TEXT: <Hash className="mr-2 h-4 w-4" />,
    AUDIO: <Mic className="mr-2 h-4 w-4" />,
    VIDEO: <Video className="mr-2 h-4 w-4" />,
};

const roleIconMap = {
    GUEST: null,
    MODERATOR: <ShieldCheck className="mr-2 h-4 w-4 text-indigo-500" />,
    ADMIN: <ShieldAlert className="mr-2 h-4 w-4 text-rose-500" />,
};

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
            <ServerSidebarContent
                searchData={[
                    {
                        label: "Text Channels",
                        type: "channel",
                        data: textChannels.map((channel) => ({
                            icon: iconMap[channel.type],
                            name: channel.name,
                            id: channel.id,
                        })),
                    },
                    {
                        label: "Voice Channels",
                        type: "channel",
                        data: audioChannels.map((channel) => ({
                            icon: iconMap[channel.type],
                            name: channel.name,
                            id: channel.id,
                        })),
                    },
                    {
                        label: "Video Channels",
                        type: "channel",
                        data: videoChannels.map((channel) => ({
                            icon: iconMap[channel.type],
                            name: channel.name,
                            id: channel.id,
                        })),
                    },
                    {
                        label: "Members",
                        type: "member",
                        data: members.map((member) => ({
                            icon: roleIconMap[member.role],
                            name: member.profile.name,
                            id: member.id,
                        })),
                    },
                ]}
                channels={{
                    audioChannels,
                    textChannels,
                    videoChannels,
                }}
                role={role}
                server={server}
                members={members}
            />
        </div>
    );
}
