"use client";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";

interface ActionTooltipProps {
    label: string;
    children: React.ReactNode;
    side?: "left" | "right" | "top" | "bottom";
    align?: "start" | "center" | "end";
}

export default function ActionTooltip({
    label,
    children,
    side = "bottom",
    align = "center",
}: ActionTooltipProps) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={50}>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent side={side} align={align}>
                    <p className="text-sm font-semibold capitalize">
                        {label.toLowerCase()}
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
