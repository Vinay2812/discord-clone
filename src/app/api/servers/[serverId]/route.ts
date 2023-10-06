import { serverSchema } from "@/database/models";
import { deleteServer, updateServer } from "@/database/models/server/services";
import { currentProfile } from "@/lib/current-profile";
import { withTryCatch } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export function PATCH(
    req: Request,
    { params }: { params: { serverId: string } },
) {
    const fallback = (err: Error) => {
        console.log("[SERVER_ID_PATCH]", err);
        return new NextResponse(err.message, { status: 500 });
    };

    const callback = async () => {
        const profile = await currentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        const { name, imageUrl } = await req.json();
        const server = await updateServer(
            {
                name,
                imageUrl,
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

export function DELETE(
    req: Request,
    { params }: { params: { serverId: string } },
) {
    const fallback = (err: Error) => {
        console.log("[SERVER_ID_DELETE]", err);
        return new NextResponse(err.message, { status: 500 });
    };

    const callback = async () => {
        const profile = await currentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        deleteServer(params.serverId, profile.id);
        return NextResponse.json({ success: true });
    };

    return withTryCatch(callback, fallback)();
}
