import React from "react";
import { currentProfile } from "@/lib/current-profile";
import { redirectToSignIn } from "@clerk/nextjs";
import { db } from "@/database/db";
import { memberSchema, serverSchema } from "@/database/models";
import { eq, sql } from "drizzle-orm";
import { createFallback, withTryCatch } from "@/lib/utils";
import { redirect } from "next/navigation";
import ServerSidebar from "@/components/server/server-sidebar";

type Props = {
    children: React.ReactNode;
    params: {
        serverId: string;
    };
};

const serverOfUserPreparedQuery = db
    .select()
    .from(serverSchema)
    .where(eq(serverSchema.id, sql.placeholder("serverId")))
    .leftJoin(memberSchema, eq(serverSchema.id, memberSchema.serverId))
    .where(eq(memberSchema.profileId, sql.placeholder("profileId")))
    .limit(1)
    .prepare();

function getUserServer(serverId: string, profileId: string) {
    const fallback = createFallback(`Failed to get server`);
    const callback = async () => {
        return (
            await serverOfUserPreparedQuery.execute({
                profileId,
                serverId,
            })
        )[0];
    };
    return withTryCatch(callback, fallback)();
}

export default async function ServerIdLayout({ children, params }: Props) {
    const profile = await currentProfile();
    if (!profile) {
        return redirectToSignIn();
    }
    const server = await getUserServer(params.serverId, profile.id);

    if (!server) {
        return redirect("/");
    }

    return (
        <div className="h-full">
            <div className="fixed inset-y-0 z-20 hidden h-full w-60 flex-col md:flex">
                <ServerSidebar serverId={params.serverId} />
            </div>
            <main className="h-full md:pl-60">{children}</main>
        </div>
    );
}
