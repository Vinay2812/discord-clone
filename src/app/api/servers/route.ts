import { v4 as uuidv4 } from "uuid";
import { currentProfile } from "@/lib/current-profile";
import { uniqueId, withTryCatch } from "@/lib/utils";
import { NextResponse } from "next/server";
import { createServer } from "@/database/models/server/services";
import { createChannel } from "@/database/models/channel/services";
import { createMember } from "@/database/models/member/services";

export async function POST(req: Request) {
    const fallback = (error: Error) => {
        console.log(["SERVER_POST", error]);
        return new NextResponse("Internal Server Error", { status: 500 });
    };

    const callback = async () => {
        const { name, imageUrl } = await req.json();
        const profile = await currentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const server = await createServer({
            id: uniqueId(),
            profileId: profile.id,
            name,
            imageUrl,
            inviteCode: uuidv4(),
        });

        const channel = await createChannel({
            id: uniqueId(),
            serverId: server.id,
            name: "general",
            profileId: profile.id,
        });

        const member = await createMember({
            id: uniqueId(),
            profileId: profile.id,
            serverId: server.id,
            role: "ADMIN",
        });

        return NextResponse.json({
            server,
            channel,
            member,
        });
    };

    return withTryCatch(callback, fallback)();
}
