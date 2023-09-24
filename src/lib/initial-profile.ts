import { currentUser, redirectToSignIn } from "@clerk/nextjs";
import {
    createProfile,
    getProfilesByUserId,
} from "../database/models/profile/services";
import { NewProfile } from "../database/models/profile/schema";
import { uniqueId } from "./utils";

export const initialProfile = async () => {
    try {
        const user = await currentUser();

        if (!user) {
            return redirectToSignIn();
        }
        let userProfile = await getProfilesByUserId(user.id);

        if (userProfile?.length) {
            return userProfile[0];
        }

        const newProfile: NewProfile = {
            id: uniqueId(),
            userId: user.id,
            name: `${user.firstName} ${user.lastName}`,
            imageUrl: user.imageUrl,
            email: user.emailAddresses[0].emailAddress,
        };

        const insertedValues = await createProfile(newProfile);
        return insertedValues;
    } catch (err) {
        console.error(err);
    }
};
