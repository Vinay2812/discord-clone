import { type ClassValue, clsx } from "clsx";
import { nanoid } from "nanoid";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function uniqueId() {
    return nanoid(32);
}

export type BooleanType<T> = {
    [K in keyof T]?: boolean;
};

type CallbackFunction<T extends any[] = any[], U = any> = (...args: T) => U;
type FallbackFunction<T extends any[] = any[]> = (
    error: Error,
    ...args: T
) => any;

export function withTryCatch<T extends any[] = any[], U = any>(
    callback: CallbackFunction<T, U>,
    fallback: FallbackFunction<T> = (error: Error, ...args: T) => undefined,
) {
    return (...args: T): U => {
        try {
            return callback(...args);
        } catch (error: any) {
            console.log("An error occurred:", error);
            if (typeof fallback === "function") {
                return fallback(error, ...args);
            } else {
                console.error("Fallback is not a function.");
                throw error;
            }
        }
    };
}

export function createFallback(message: string) {
    return (error: Error) => {
        console.log(message, error);
        return undefined;
    };
}

export function getReturnValuesObject<T>(returnValues: BooleanType<T> | null) {
    return returnValues
        ? Object.entries(returnValues)
              .filter(([, v]) => v === true)
              .reduce((acc, [k]) => {
                  acc[k] = k;
                  return acc;
              }, {} as any)
        : null;
}
