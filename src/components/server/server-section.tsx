"use client";

import { Channel } from "@/database/models/channel/schema";
import { Member } from "@/database/models/member/schema";
import { ServerWithMembersWithProfile } from "@/types";
import React from "react";
import ActionTooltip from "@/components/action-tooltip";
import { Plus, Settings } from "lucide-react";
import { useModal } from "@/hooks/use-modal-store";

type Props = {
    label: string;
    role?: Member["role"];
    sectionType: "channels" | "members";
    channelType?: Channel["type"];
    server?: ServerWithMembersWithProfile;
};

export default function ServerSection({
    label,
    role,
    sectionType,
    channelType,
    server,
}: Props) {
    const { onOpen } = useModal();

    return (
        <div className="flex items-center justify-between py-2">
            <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                {label}
            </p>
            {role !== "GUEST" && sectionType === "channels" && (
                <ActionTooltip label="Create Channel" side="top">
                    <button
                        className="text-zinc-500 transition hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
                        onClick={() => onOpen("createChannel", { channelType })}
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </ActionTooltip>
            )}
            {role === "ADMIN" && sectionType === "members" && (
                <ActionTooltip label="Manage Members" side="top">
                    <button
                        className="text-zinc-500 transition hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
                        onClick={() => onOpen("members", { server })}
                    >
                        <Settings className="h-4 w-4" />
                    </button>
                </ActionTooltip>
            )}
        </div>
    );
}
