import { eq, sql } from "drizzle-orm";
import { profile } from "./schema";
import { db } from "../../db";
import { withTryCatch, createFallback } from "@/lib/utils";
import type { NewProfile } from "./schema";

const preparedSelectProfileByUserId = db
    .select()
    .from(profile)
    .where(eq(profile.userId, sql.placeholder("userId")))
    .limit(1);

export function getProfilesByUserId(userId: string) {
    const profileQuery = () =>
        preparedSelectProfileByUserId.execute({ userId });
    const fallback = (error: Error) => {
        console.log("Error getting profile by user id:", error);
    };

    return withTryCatch(profileQuery, fallback)();
}

export async function createProfile(userProfile: NewProfile) {
    const insertQuery = () => db.insert(profile).values(userProfile);
    const insertFallback = createFallback("Error creating profile:");
    await withTryCatch(insertQuery, insertFallback)();

    const selectQuery = async () =>
        (
            await preparedSelectProfileByUserId.execute({
                userId: userProfile.userId,
            })
        )[0];
    const selectFallback = createFallback("Error selecting profile:");
    return withTryCatch(selectQuery, selectFallback)()!;
}
