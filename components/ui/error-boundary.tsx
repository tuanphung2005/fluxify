"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@heroui/react";
import { AlertCircle } from "lucide-react";

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReload = () => {
        this.setState({ hasError: false, error: undefined });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-4 text-center">
                    <div className="bg-danger-50 p-4 rounded-full mb-4">
                        <AlertCircle className="w-12 h-12 text-danger" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
                    <p className="text-default-500 mb-6 max-w-md">
                        {this.state.error?.message || "An unexpected error occurred. Please try again."}
                    </p>
                    <Button color="primary" onPress={this.handleReload}>
                        Reload Page
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
