import { create } from "zustand";
import { Server } from "@/database/models/server/schema";

export type ModalType =
    | "createServer"
    | "invite"
    | "editServer"
    | "members"
    | "createChannel"
    | "leaveServer"
    | "deleteServer";

interface ModalData {
    server?: Server;
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
