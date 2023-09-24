"use client";

import { useEffect, useState } from "react";
import {
    CreateServerModal,
    EditServerModal,
    InviteModal,
    MembersModal,
} from "@/components/modals";

export const ModalProvider = () => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);
    if (!isMounted) return null;
    return (
        <>
            <CreateServerModal />
            <InviteModal />
            <EditServerModal />
            <MembersModal />
        </>
    );
};
