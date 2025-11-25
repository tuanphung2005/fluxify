"use client";

import { Button } from "@heroui/button";
import { Save, Eye, Upload } from "lucide-react";

interface BuilderToolbarProps {
    templateName: string;
    isPublished: boolean;
    isSaving: boolean;
    hasUnsavedChanges: boolean;
    onSave: () => void;
    onPublish: () => void;
    onPreview: () => void;
}

export default function BuilderToolbar({
    templateName,
    isPublished,
    isSaving,
    hasUnsavedChanges,
    onSave,
    onPublish,
    onPreview,
}: BuilderToolbarProps) {
    return (
        <div className="h-16 bg-content1 border-b border-divider px-6 flex items-center justify-between">
            <div>
                <h2 className="text-xl font-bold">{templateName}</h2>
                <p className="text-xs text-default-500">
                    {isPublished ? "Published" : "Draft"}
                    {hasUnsavedChanges && (
                        <span className="ml-2 text-warning">• Unsaved changes</span>
                    )}
                </p>
            </div>
            <div className="flex gap-3">
                <Button
                    variant="flat"
                    startContent={<Eye className="w-4 h-4" />}
                    onPress={onPreview}
                >
                    Preview
                </Button>
                <Button
                    color="primary"
                    variant="flat"
                    startContent={<Save className="w-4 h-4" />}
                    onPress={onSave}
                    isLoading={isSaving}
                    isDisabled={!hasUnsavedChanges}
                >
                    {hasUnsavedChanges ? "Save" : "Saved"}
                </Button>
                <Button
                    color="success"
                    startContent={<Upload className="w-4 h-4" />}
                    onPress={onPublish}
                    isDisabled={isSaving}
                >
                    {isPublished ? "Update" : "Publish"}
                </Button>
            </div>
        </div>
    );
}
