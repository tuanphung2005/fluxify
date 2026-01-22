"use client";

import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 items-center">
          <AlertCircle className="w-12 h-12 text-danger mb-2" />
          <h1 className="text-2xl font-bold">Authentication Error</h1>
        </CardHeader>
        <CardBody className="text-center space-y-4">
          <p className="text-default-500">
            Something went wrong during authentication.
          </p>
          <div className="flex gap-2 justify-center">
            <Link href="/auth/login">
              <Button color="primary">Try Again</Button>
            </Link>
            <Link href="/">
              <Button variant="bordered">Go Home</Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
