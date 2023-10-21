import { create } from "zustand";
import { Server } from "@/database/models/server/schema";
import { Channel } from "@/database/models/channel/schema";

export type ModalType =
    | "createServer"
    | "invite"
    | "editServer"
    | "members"
    | "createChannel"
    | "leaveServer"
    | "deleteServer"
    | "deleteChannel"
    | "editChannel";

interface ModalData {
    server?: Server;
    channelType?: Channel["type"];
    channel?: Channel;
}

interface ModalStore {
    type: ModalType | null;
    data: ModalData;
    isOpen: boolean;
    onOpen: (type: ModalType, data?: ModalData) => void;
    onClose: () => void;
}

export const useModal = create<ModalStore>((set) => {
    return {
        type: null,
        data: {},
        isOpen: false,
        onOpen: (type, data = {}) => set({ type, isOpen: true, data }),
        onClose: () => set({ type: null, isOpen: false }),
    };
});
