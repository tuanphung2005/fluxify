"use client";

import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";

export function AuthButtons() {
    const router = useRouter();

    const openLogin = () => router.push("?modal=login", { scroll: false });
    const openRegister = () => router.push("?modal=register", { scroll: false });

    return (
        <>
            <Button variant="flat" onPress={openLogin}>
                login
            </Button>
            <Button color="primary" onPress={openRegister}>
                sign up
            </Button>
        </>
    );
}
