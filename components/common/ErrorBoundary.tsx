"use client";

import React, { Component, ReactNode } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Card className="w-full max-w-lg mx-auto my-8">
                    <CardBody className="text-center py-12 space-y-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-danger-100 rounded-full mx-auto">
                            <AlertTriangle size={32} className="text-danger" />
                        </div>
                        <h3 className="text-xl font-semibold">Something went wrong</h3>
                        <p className="text-default-500 max-w-sm mx-auto">
                            An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
                        </p>
                        {process.env.NODE_ENV === "development" && this.state.error && (
                            <details className="text-left bg-default-100 p-4 rounded-lg text-sm">
                                <summary className="cursor-pointer font-medium text-danger">
                                    Error Details (dev only)
                                </summary>
                                <pre className="mt-2 overflow-auto text-xs">
                                    {this.state.error.message}
                                    {"\n\n"}
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}
                        <div className="flex gap-3 justify-center pt-4">
                            <Button
                                color="primary"
                                startContent={<RefreshCw size={18} />}
                                onPress={this.handleRetry}
                            >
                                Try Again
                            </Button>
                            <Button
                                variant="flat"
                                onPress={() => window.location.reload()}
                            >
                                Reload Page
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            );
        }

        return this.props.children;
    }
}

// ============================================
// Functional wrapper for easier use
// ============================================
interface WithErrorBoundaryProps {
    children: ReactNode;
    fallbackMessage?: string;
}

export function WithErrorBoundary({ children, fallbackMessage }: WithErrorBoundaryProps) {
    return (
        <ErrorBoundary
            fallback={
                fallbackMessage ? (
                    <div className="text-center py-8 text-default-500">
                        <AlertTriangle size={40} className="mx-auto mb-3 opacity-50" />
                        <p>{fallbackMessage}</p>
                    </div>
                ) : undefined
            }
        >
            {children}
        </ErrorBoundary>
    );
}

// ============================================
// Section-level error boundary with minimal UI
// ============================================
export function SectionErrorBoundary({ children }: { children: ReactNode }) {
    return (
        <ErrorBoundary
            fallback={
                <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger text-center">
                    <p>Failed to load this section. Please refresh the page.</p>
                </div>
            }
        >
            {children}
        </ErrorBoundary>
    );
}

export default ErrorBoundary;
