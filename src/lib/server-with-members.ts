import { getChannelsByServerId } from "@/database/models/channel/services";
import { getMembersByServerIdWithProfile } from "@/database/models/member/services";
import { getServerById } from "@/database/models/server/services";

export const serverWithMembersAndProfiles = async (serverId: string) => {
    console.time("serverWithMembersAndProfiles")
    const [server, members, channels] = await Promise.all([
        getServerById(serverId),
        getMembersByServerIdWithProfile(serverId),
        getChannelsByServerId(serverId),
    ]);
    console.timeEnd("serverWithMembersAndProfiles")
    return {
        ...server,
        members,
        channels,
    };
};
