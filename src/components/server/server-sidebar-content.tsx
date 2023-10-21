"use client";
import React, { useEffect, useState } from "react";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    ScrollArea,
    Separator,
} from "@/components/ui";
import { Search } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Channel } from "@/database/models/channel/schema";
import ServerSection from "./server-section";
import { Member } from "@/database/models/member/schema";
import ServerChannel from "./server-channel";
import { Profile } from "@/database/models/profile/schema";
import { ServerWithMembersWithProfile } from "@/types";
import ServerMember from "./server-member";

type Props = {
    searchData: {
        label: string;
        type: "channel" | "member";
        data:
            | {
                  icon: React.ReactNode;
                  name: string;
                  id: string;
              }[]
            | undefined;
    }[];
    channels: {
        textChannels: Channel[];
        audioChannels: Channel[];
        videoChannels: Channel[];
    };
    role?: Member["role"];
    server: ServerWithMembersWithProfile;
    members: (Member & {
        profile: Profile;
    })[];
};

export default function ServerSidebarContent({
    searchData,
    channels: { audioChannels, textChannels, videoChannels },
    role,
    server,
    members,
}: Props) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        };
        document.addEventListener("keydown", down);
        return () => {
            document.removeEventListener("keydown", down);
        };
    }, []);

    const onClick = ({
        id,
        type,
    }: {
        id: string;
        type: "channel" | "member";
    }) => {
        setOpen(false);
        if (type === "member") {
            router.push(`/servers/${params?.serverId}/conversations/${id}`);
        } else {
            router.push(`/servers/${params?.serverId}/channels/${id}`);
        }
    };

    return (
        <ScrollArea className="flex-1 px-3">
            <div className="mt-2">
                <button
                    className="group flex w-full items-center gap-x-2 rounded-md p-2 transition hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50"
                    onClick={() => setOpen(true)}
                >
                    <Search className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                    <p className="text-sm font-semibold text-zinc-500 transition group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300">
                        Search
                    </p>
                    <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                        <span className="text-xs">CTRL + K</span>
                    </kbd>
                </button>
                <CommandDialog open={open} onOpenChange={setOpen}>
                    <CommandInput placeholder="Search all channels and members" />
                    <CommandList>
                        <CommandEmpty>No Result Found</CommandEmpty>
                        {searchData.map(({ data, label, type }) => {
                            if (!data?.length) return null;

                            return (
                                <CommandGroup key={label} heading={label}>
                                    {data.map(({ icon, name, id }) => {
                                        return (
                                            <CommandItem
                                                key={id}
                                                onSelect={() => {
                                                    onClick({ id, type });
                                                }}
                                            >
                                                {icon}
                                                <span>{name}</span>
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            );
                        })}
                    </CommandList>
                </CommandDialog>
            </div>
            <Separator className="my-2 rounded-md bg-zinc-200 dark:bg-zinc-700" />
            {!!textChannels.length && (
                <div className="mb-2">
                    <ServerSection
                        sectionType="channels"
                        channelType="TEXT"
                        role={role}
                        label="Text Channels"
                    />
                    <div className="space-y-[2px]">
                        {textChannels.map((channel) => {
                            return (
                                <ServerChannel
                                    key={channel.id}
                                    channel={channel}
                                    server={server}
                                    role={role}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
            {!!audioChannels.length && (
                <div className="mb-2">
                    <ServerSection
                        sectionType="channels"
                        channelType="AUDIO"
                        role={role}
                        label="Voice Channels"
                    />
                    <div className="space-y-[2px]">
                        {audioChannels.map((channel) => {
                            return (
                                <ServerChannel
                                    key={channel.id}
                                    channel={channel}
                                    server={server}
                                    role={role}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
            {!!videoChannels.length && (
                <div className="mb-2">
                    <ServerSection
                        sectionType="channels"
                        channelType="VIDEO"
                        role={role}
                        label="Video Channels"
                    />
                    <div className="space-y-[2px]">
                        {videoChannels.map((channel) => {
                            return (
                                <ServerChannel
                                    key={channel.id}
                                    channel={channel}
                                    server={server}
                                    role={role}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
            {!!members.length && (
                <div className="mb-2">
                    <ServerSection
                        sectionType="members"
                        role={role}
                        label="Members"
                        server={server}
                    />
                    <div className="space-y-[2px]">
                        {members.map((member) => {
                            return (
                                <ServerMember
                                    key={member.id}
                                    member={member}
                                    server={server}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </ScrollArea>
    );
}
