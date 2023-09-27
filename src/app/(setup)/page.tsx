import { initialProfile } from "@/lib/initial-profile";
import { db } from "@/database/db";
import { memberSchema, serverSchema } from "@/database/models";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { InitialModal } from "../../components/modals";
import { createFallback, withTryCatch } from "../../lib/utils";

const userServersPreparedQuery = db
    .select({
        id: serverSchema.id,
    })
    .from(serverSchema)
    .leftJoin(memberSchema, eq(memberSchema.serverId, serverSchema.id))
    .where(eq(memberSchema.profileId, sql.placeholder("profileId")))
    .limit(1)
    .prepare();

function getUserServers(profileId: string) {
    const fallback = createFallback(`Failed to get servers`);
    const callback = () => {
        return userServersPreparedQuery.execute({
            profileId,
        });
    };
    return withTryCatch(callback, fallback)();
}

const SetupPage = async () => {
    const profile = await initialProfile();
    const servers = await getUserServers(profile.id);
    if (servers.length > 0) {
        const serverId = servers[0].id;
        return redirect(`/servers/${serverId}`);
    }

    return <InitialModal />;
};

export default SetupPage;
