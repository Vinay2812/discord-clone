"use client";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Button,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import qs from "query-string";

import type { Channel } from "@/database/models/channel/schema";

const channelTypes: ["TEXT", "VIDEO", "AUDIO"] = ["TEXT", "VIDEO", "AUDIO"];

const formSchema = z.object({
    name: z
        .string()
        .min(1, {
            message: "Server name is required",
        })
        .max(100)
        .refine(
            (name) => {
                return name !== "general";
            },
            {
                message: "Channel name cannot be 'general'",
            },
        ),
    type: z.enum(channelTypes),
});

export const CreateChannelModal = () => {
    const { isOpen, onClose, type } = useModal();

    const router = useRouter();
    const params = useParams();

    const isModalOpen = isOpen && type === "createChannel";

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: "TEXT" as Channel["type"],
        },
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const url = qs.stringifyUrl({
                url: "/api/channels",
                query: {
                    serverId: params?.serverId,
                },
            });
            await axios.post(url, values);
            form.reset();
            router.refresh();
            onClose();
        } catch (err) {
            console.log(err);
        }
    };

    const handleClose = () => {
        form.reset();
        onClose();
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className="overflow-hidden bg-white p-0 text-black">
                <DialogHeader className="px-6 pt-8">
                    <DialogTitle className="text-center text-2xl font-bold">
                        Create Channel
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                    >
                        <div className="space-y-8 px-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => {
                                    return (
                                        <FormItem>
                                            <FormLabel className="text-z text-xs font-bold uppercase">
                                                Channel name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled={isLoading}
                                                    className="border-0 bg-zinc-300/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                                                    placeholder="Enter channel name"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => {
                                    return (
                                        <FormItem>
                                            <FormLabel className="text-z text-xs font-bold uppercase">
                                                Channel type
                                            </FormLabel>
                                            <Select
                                                disabled={isLoading}
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="border-0 bg-zinc-300/50 capitalize text-black outline-none ring-offset-0 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                                                        <SelectValue placeholder="Select a channel type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {channelTypes.map(
                                                        (channelType) => {
                                                            return (
                                                                <SelectItem
                                                                    key={
                                                                        channelType
                                                                    }
                                                                    value={
                                                                        channelType
                                                                    }
                                                                    className="capitalize"
                                                                >
                                                                    {channelType.toLowerCase()}
                                                                </SelectItem>
                                                            );
                                                        },
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />
                        </div>
                        <DialogFooter className="bg-gray-100 px-6 py-4">
                            <Button disabled={isLoading} variant="primary">
                                Create
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
