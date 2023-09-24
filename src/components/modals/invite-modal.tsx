"use client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { Button, Input, Label } from "@/components/ui";
import { Check, Copy, RefreshCw } from "lucide-react";
import { useOrigin } from "@/hooks/use-origin";
import { useState } from "react";
import { withTryCatch } from "@/lib/utils";
import axios from "axios";

export const InviteModal = () => {
    const { isOpen, onClose, type, data, onOpen } = useModal();
    const origin = useOrigin();
    const isModalOpen = isOpen && type === "invite";
    const { server } = data;

    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const inviteLink = `${origin}/invite/${server?.inviteCode}`;

    const onCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 1000);
    };

    const onNew = async () => {
        try {
            setIsLoading(true);
            const response = await axios.patch(
                `/api/servers/${server?.id}/invite-code`,
            );
            onOpen("invite", { server: response.data });
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="overflow-hidden bg-white p-0 text-black">
                <DialogHeader className="px-6 pt-8">
                    <DialogTitle className="text-center text-2xl font-bold">
                        Invite Friends
                    </DialogTitle>
                </DialogHeader>
                <div className="p-6">
                    <Label className="text-xs font-bold uppercase text-zinc-500 dark:text-secondary/70">
                        Server Invite Link
                    </Label>
                    <div className="mt-2 flex items-center gap-x-2">
                        <Input
                            disabled={isLoading}
                            className="border-0 bg-zinc-300/50 text-black focus-visible:ring-0 focus-visible:ring-offset-0"
                            value={inviteLink}
                        />
                        <Button
                            size="icon"
                            onClick={onCopy}
                            disabled={isLoading}
                        >
                            {copied ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                    <Button
                        disabled={isLoading}
                        variant="link"
                        size="sm"
                        className="mt-4 text-xs text-zinc-500"
                        onClick={onNew}
                    >
                        Generate a new link
                        <RefreshCw className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
