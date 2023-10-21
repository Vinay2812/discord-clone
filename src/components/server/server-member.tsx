"use client";

import { Member } from "@/database/models/member/schema";
import { Profile } from "@/database/models/profile/schema";
import { Server } from "@/database/models/server/schema";
import { cn } from "@/lib/utils";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import UserAvatar from "../user-avatar";

type Props = {
    member: Member & {
        profile: Profile;
    };
    server: Server;
};

const roleIconMap = {
    GUEST: null,
    MODERATOR: <ShieldCheck className="ml-2 h-4 w-4 text-indigo-500" />,
    ADMIN: <ShieldAlert className="ml-2 h-4 w-4 text-rose-500" />,
};

export default function ServerMember({ member, server }: Props) {
    const params = useParams();
    const router = useRouter();

    const icon = roleIconMap[member.role];

    return (
        <button
            className={cn(
                "group mb-1 flex w-full items-center gap-x-2 rounded-md px-2 py-2 transition hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50",
                params?.memberId === member.id &&
                    "bg-zinc-700/20 dark:bg-zinc-700",
            )}
        >
            <UserAvatar
                src={member.profile.imageUrl}
                className="h-8 w-8 md:h-8 md:w-8"
            />
            <p
                className={cn(
                    "group-hover:text-zinc-600 text-sm font-semibold text-zinc-500 transition dark:text-zinc-400 dark:group-hover:text-zinc-300",
                    params?.memberId === member.id &&
                        "text-primary dark:text-zinc-200 dark:group-hover:text-white",
                )}
            >
                {member.profile.name}
            </p>
            {icon}
        </button>
    );
}
