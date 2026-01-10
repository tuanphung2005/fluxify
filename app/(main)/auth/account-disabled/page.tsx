"use client";

import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import { Ban } from "lucide-react";
import { signOut } from "next-auth/react";

export default function AccountDisabledPage() {
    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/" });
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <Card className="w-full max-w-md">
                <CardHeader className="flex flex-col gap-1 items-center">
                    <Ban className="w-12 h-12 text-danger mb-2" />
                    <h1 className="text-2xl font-bold">Account Disabled</h1>
                </CardHeader>
                <CardBody className="text-center space-y-4">
                    <p className="text-default-500">
                        Your account has been disabled. If you believe this is a mistake,
                        please contact our support team for assistance.
                    </p>
                    <div className="flex gap-2 justify-center">
                        <Button color="primary" onPress={handleSignOut}>
                            Sign Out
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
