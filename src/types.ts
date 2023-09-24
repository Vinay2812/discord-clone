import { Channel } from "./database/models/channel/schema";
import { Member } from "./database/models/member/schema";
import { Profile } from "./database/models/profile/schema";
import { Server } from "./database/models/server/schema";

export type ServerWithMembersWithProfile = Server & {
    members: (Member & {
        profile: Profile;
    })[];
    channels: Channel[];
};
