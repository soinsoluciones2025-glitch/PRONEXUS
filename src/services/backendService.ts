import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, increment } from "./firebase";
import type { User } from '../types';

/**
 * Deducts a specified amount of credits from a user's account.
 * Checks if the user has enough credits before attempting deduction.
 * @param userId The ID of the user.
 * @param amount The number of credits to deduct.
 * @returns A promise that resolves to true if credits were deducted, false otherwise.
 */
export const deductCredits = async (userId: string, amount: number): Promise<boolean> => {
    if (amount <= 0) {
        return true; // Deducting zero or negative credits is always "successful".
    }

    const userDocRef = doc(db, "users", userId);

    try {
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            console.error("User not found for credit deduction.");
            return false;
        }

        const userData = userDoc.data() as User;
        if (userData.credits < amount) {
            console.warn("Insufficient credits for deduction.");
            return false;
        }

        await updateDoc(userDocRef, {
            credits: increment(-amount)
        });

        console.log(`Successfully deducted ${amount} credits from user ${userId}.`);
        return true;

    } catch (error) {
        console.error("Error deducting credits:", error);
        throw new Error("Failed to update user credits.");
    }
};