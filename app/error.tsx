"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  minimal?: boolean;
  className?: string;
}

/**
 * Report error to external service
 * Replace with actual error reporting service in production
 */
function reportError(error: Error & { digest?: string }): void {
  // In production, send to error tracking service like Sentry
  // Example: Sentry.captureException(error);

  const errorReport = {
    message: error.message,
    stack: error.stack,
    digest: error.digest,
    timestamp: new Date().toISOString(),
    url: typeof window !== "undefined" ? window.location.href : "unknown",
  };

  // Log structured error for debugging
  console.error("[Error Boundary]", errorReport);

  // TODO: Replace with Sentry or some shit
  // fetch("/api/errors", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(errorReport),
  // }).catch(() => {});
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}

export default function Error(props: ErrorProps) {
  const { error, reset } = props;
  const errorProps = props; // Alias for closure access if needed

  useEffect(() => {
    reportError(error);
  }, [error]);

  const isMinimal = errorProps.minimal;

  if (isMinimal) {
    return (
      <div className={`text-center py-8 ${errorProps.className || ''}`}>
        <div className="text-danger mb-4">
          <AlertIcon className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-default-900 mb-2">
          Hỏng rồi...
        </h3>
        <p className="text-default-500 mb-4 text-sm">
          {error.message || "Đã xảy ra lỗi khi tải dữ liệu."}
        </p>
        <button
          className="text-sm bg-primary text-white font-medium py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors"
          onClick={reset}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4 flex justify-center">
            <AlertIcon className="w-16 h-16" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Hỏng rồi...
          </h2>
          <p className="text-gray-600 mb-6">
            Chúng tôi đã nhận được lỗi và đang cố gắng sửa, bạn đợi nhé!
          </p>
          {error.digest && (
            <p className="text-xs text-gray-400 mb-4">ID lỗi: {error.digest}</p>
          )}
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            onClick={reset}
          >
            Thử lại
          </button>
        </div>
      </div>
    </div>
  );
}
