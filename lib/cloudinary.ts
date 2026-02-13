import { v2 as cloudinary } from "cloudinary";

// Validate required Cloudinary environment variables
const CLOUDINARY_REQUIRED_VARS = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
] as const;

const missingCloudinaryVars = CLOUDINARY_REQUIRED_VARS.filter(
  (v) => !process.env[v]
);

if (missingCloudinaryVars.length > 0) {
  const message = `Missing required Cloudinary environment variables: ${missingCloudinaryVars.join(", ")}`;
  if (process.env.NODE_ENV === "production") {
    throw new Error(message);
  } else {
    console.warn(`[Cloudinary] ${message}`);
  }
}

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Upload a file buffer to Cloudinary
 * @param buffer - The file buffer to upload
 * @param folder - Optional folder to organize uploads
 * @returns Upload result with image URL
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = "fluxify/products",
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [{ quality: "auto:good" }, { fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes,
            });
          } else {
            reject(new Error("No result from Cloudinary"));
          }
        },
      )
      .end(buffer);
  });
}

/**
 * Delete an image from Cloudinary by public_id
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
