import { auth } from "@clerk/nextjs";
import { getProfilesByUserId } from "@/database/models/profile/services";

export const currentProfile = async () => {
    const { userId } = auth();
    if (!userId) {
        return null;
    }

    const profiles = await getProfilesByUserId(userId);
    if (!profiles?.length) {
        return null;
    }
    return profiles[0];
};
