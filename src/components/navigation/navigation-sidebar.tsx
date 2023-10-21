import React from "react";
import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";
import { db } from "@/database/db";
import { memberSchema, serverSchema } from "@/database/models";
import { eq, sql } from "drizzle-orm";
import NavigationAction from "./navigation-action";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { NavigationItem } from "./navigation-item";
import { ModeToggle } from "../mode-toggle";
import { UserButton } from "@clerk/nextjs";

type Props = {};

const serverOfUserPreparedQuery = db
    .select({
        id: serverSchema.id,
        name: serverSchema.name,
        imageUrl: serverSchema.imageUrl,
        inviteCode: serverSchema.inviteCode,
        profileId: serverSchema.profileId,
        createdAt: serverSchema.createdAt,
        updatedAt: serverSchema.updatedAt,
    })
    .from(serverSchema)
    .leftJoin(memberSchema, eq(memberSchema.serverId, serverSchema.id))
    .where(eq(memberSchema.profileId, sql.placeholder("profileId")));

async function getUserServers(profileId: string) {
    const servers = await serverOfUserPreparedQuery.execute({
        profileId,
    });
    return servers;
}

export default async function NavigationSidebar({}: Props) {
    const profile = await currentProfile();
    if (!profile) {
        return redirect("/");
    }

    const servers = await getUserServers(profile.id);

    return (
        <div className="flex h-full w-full flex-col items-center space-y-4 bg-[#e3e5e8] py-3 text-primary dark:bg-[#1E1F22]">
            <NavigationAction />
            <Separator className="mx-auto h-[2px] w-10 rounded-md bg-zinc-300 dark:bg-zinc-700" />
            <ScrollArea className="w-full flex-1">
                {servers.map((server) => {
                    return (
                        <div key={server.id} className="mb-4">
                            <NavigationItem
                                id={server.id}
                                imageUrl={server.imageUrl}
                                name={server.name}
                            />
                        </div>
                    );
                })}
            </ScrollArea>
            <div className="mt-auto flex flex-col items-center gap-y-4 pb-3">
                <ModeToggle />
                <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                        elements: {
                            avatarBox: "h-[48px] w-[48px]",
                        },
                    }}
                />
            </div>
        </div>
    );
}
