import React from "react";
import { ThemeProvider } from "./theme-provider";
import { ModalProvider } from "./modal-provider";

type Props = {
    children: React.ReactNode;
};

export default function Providers({ children }: Props) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            storageKey="discord-theme"
        >
            <ModalProvider />
            {children}
        </ThemeProvider>
    );
}
