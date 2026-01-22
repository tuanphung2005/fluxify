import { useState, useCallback } from "react";

interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

interface UseCloudinaryUploadReturn {
  upload: (file: File) => Promise<UploadResult | null>;
  uploadMultiple: (files: File[]) => Promise<UploadResult[]>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  reset: () => void;
}

/**
 * Hook for uploading images to Cloudinary
 * Can be reused across the app for any image upload needs
 */
export function useCloudinaryUpload(): UseCloudinaryUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setProgress(0);
    setError(null);
  }, []);

  const upload = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        const formData = new FormData();

        formData.append("file", file);

        // Use fetch directly for FormData
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();

          throw new Error(errorData.error || "Upload failed");
        }

        const result = await response.json();

        setProgress(100);

        return result;
      } catch (err: any) {
        const errorMessage = err.message || "Upload failed";

        setError(errorMessage);

        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  const uploadMultiple = useCallback(
    async (files: File[]): Promise<UploadResult[]> => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      const results: UploadResult[] = [];
      const totalFiles = files.length;

      try {
        for (let i = 0; i < files.length; i++) {
          const formData = new FormData();

          formData.append("file", files[i]);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();

            throw new Error(
              errorData.error || `Failed to upload ${files[i].name}`,
            );
          }

          const result = await response.json();

          results.push(result);
          setProgress(Math.round(((i + 1) / totalFiles) * 100));
        }

        return results;
      } catch (err: any) {
        const errorMessage = err.message || "Upload failed";

        setError(errorMessage);

        return results; // Return partial results
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  return {
    upload,
    uploadMultiple,
    isUploading,
    progress,
    error,
    reset,
  };
}
