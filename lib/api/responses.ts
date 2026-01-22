import { NextResponse } from "next/server";

/**
 * Creates a standardized error response
 * @param message - The error message to return
 * @param status - HTTP status code (default: 500)
 * @param error - Optional error object to log
 * @returns NextResponse with error JSON
 */
export function errorResponse(
  message: string,
  status: number = 500,
  error?: any,
) {
  if (error) {
    console.error(message, error);
  }

  return NextResponse.json({ error: message }, { status });
}

/**
 * Creates a standardized success response
 * @param data - The data to return
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with data JSON
 */
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Checks if a result is an error response
 * @param result - The result to check
 * @returns True if the result has an error property
 */
export function isErrorResult(
  result: any,
): result is { error: string; status: number } {
  return (
    result &&
    typeof result === "object" &&
    "error" in result &&
    "status" in result
  );
}
