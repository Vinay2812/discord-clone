"use client";

import { Plus } from "lucide-react";
import React from "react";
import ActionTooltip from "../action-tooltip";
import { useModal } from "../../hooks/use-modal-store";

type Props = {};

export default function NavigationAction({}: Props) {
    const { onOpen } = useModal();

    const onClick = () => {
        onOpen("createServer");
    };
    return (
        <div>
            <ActionTooltip side="right" align="center" label="Add a server">
                <button className="group flex items-center" onClick={onClick}>
                    <div className="mx-3 flex h-[48px] w-[48px] items-center justify-center overflow-hidden rounded-[24px] bg-background transition-all group-hover:rounded-[16px] group-hover:bg-emerald-500 dark:bg-neutral-700">
                        <Plus
                            className="text-emerald-500 transition group-hover:text-white"
                            size={25}
                        />
                    </div>
                </button>
            </ActionTooltip>
        </div>
    );
}
