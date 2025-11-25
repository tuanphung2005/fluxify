"use client";

import { Button } from "@heroui/button";
import { Save, Eye, Upload, Undo2 } from "lucide-react";

interface BuilderToolbarProps {
    templateName: string;
    isPublished: boolean;
    isOperating: boolean;
    hasUnsavedChanges: boolean;
    onSave: () => void;
    onPublish: () => void;
    onUnpublish: () => void;
    onPreview: () => void;
}

export default function BuilderToolbar({
    templateName,
    isPublished,
    isOperating,
    hasUnsavedChanges,
    onSave,
    onPublish,
    onUnpublish,
    onPreview,
}: BuilderToolbarProps) {
    return (
        <div className="h-16 bg-content1 border-b border-divider px-6 flex items-center justify-between">
            <div>
                <h2 className="text-xl font-bold">{templateName}</h2>
                <p className="text-xs text-default-500">
                    {isPublished ? "published" : "draft"}
                    {hasUnsavedChanges && (
                        <span className="ml-2 text-warning">• unsaved changes</span>
                    )}
                </p>
            </div>
            <div className="flex gap-3">
                <Button
                    variant="flat"
                    startContent={<Eye />}
                    onPress={onPreview}
                    radius="none"
                >
                    preview
                </Button>
                <Button
                    color="primary"
                    variant="flat"
                    startContent={<Save />}
                    onPress={onSave}
                    isLoading={isOperating}
                    isDisabled={!hasUnsavedChanges}
                    radius="none"
                >
                    {hasUnsavedChanges ? "save" : "saved"}
                </Button>
                <Button
                    color="success"
                    startContent={<Upload />}
                    onPress={onPublish}
                    isLoading={isOperating}
                    isDisabled={isOperating}
                    radius="none"
                >
                    {isPublished ? "update" : "publish"}
                </Button>
                {isPublished && (
                    <Button
                        color="warning"
                        variant="flat"
                        onPress={onUnpublish}
                        isLoading={isOperating}
                        isDisabled={isOperating}
                        radius="none"
                        startContent={<Undo2 />}
                    >
                        unpublish
                    </Button>
                )}
            </div>
        </div>
    );
}
