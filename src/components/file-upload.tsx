"use client";

import { X } from "lucide-react";
import Image from "next/image";

import { UploadDropzone } from "@/lib/uploadthing";
import "@uploadthing/react/styles.css";

type FileUploadProps = {
    onChange: (url?: string) => void;
    value: string;
    endpoint: "serverImage" | "messageFile";
};
export const FileUpload = ({ onChange, endpoint, value }: FileUploadProps) => {
    const fileType = value?.split(".").pop();

    if (value && fileType !== "pdf") {
        return (
            <div className="relative h-20 w-20">
                <Image fill src={value} className="rounded-full" alt="Upload" />
                <button
                    onClick={() => {
                        onChange("");
                    }}
                    className="absolute right-0 top-0 rounded-full bg-rose-500 p-1 text-white shadow-sm"
                    type="button"
                >
                    <X />
                </button>
            </div>
        );
    }

    return (
        <UploadDropzone
            endpoint={endpoint}
            onClientUploadComplete={(res) => {
                onChange(res?.[0].url);
            }}
            onUploadError={(err: Error) => {
                console.log(err);
            }}
        />
    );
};
