import { NextRequest, NextResponse } from "next/server";

import { uploadToCloudinary } from "@/lib/cloudinary";
import { getAuthenticatedUser } from "@/lib/api/auth-helpers";
import { isErrorResult, errorResponse } from "@/lib/api/responses";

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: NextRequest) {
  const authResult = await getAuthenticatedUser();

  if (isErrorResult(authResult)) {
    return errorResponse(authResult.error, authResult.status);
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Sai định dạng tệp. Chỉ JPEG, PNG, WebP và GIF được phép.",
        },
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File quá lớn. Kích thước tối đa là 10MB." },
        { status: 400 },
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer);

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Tải lên thất bại" },
      { status: 500 },
    );
  }
}

// Route segment config for App Router
export const dynamic = "force-dynamic";
export const maxDuration = 60;
