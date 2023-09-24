import { serverSchema } from "@/database/models";
import { updateServer } from "@/database/models/server/services";
import { currentProfile } from "@/lib/current-profile";
import { withTryCatch } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function PATCH(
    req: Request,
    { params }: { params: { serverId: string } },
) {
    const fallback = (error: Error) => {
        console.log("[SERVER_ID]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    };

    const callback = async () => {
        const profile = await currentProfile();
        if (!profile) return new NextResponse("Unauthorized", { status: 401 });

        if (!params.serverId)
            return new NextResponse("Server Id Missing", { status: 404 });
        const server = await updateServer(
            {
                inviteCode: uuidv4(),
            },
            and(
                eq(serverSchema.id, params.serverId),
                eq(serverSchema.profileId, profile.id),
            ),
            params.serverId,
        );

        return NextResponse.json(server);
    };

    return withTryCatch(callback, fallback)();
}
