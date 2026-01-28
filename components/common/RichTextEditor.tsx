"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Link as LinkIcon,
    Unlink,
} from "lucide-react";
import { useCallback, useEffect } from "react";

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({
    content,
    onChange,
    placeholder = "Start typing...",
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    target: "_blank",
                    rel: "noopener noreferrer",
                },
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Underline,
        ],
        content,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class:
                    "prose prose-sm max-w-none min-h-[200px] p-3 focus:outline-none",
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    const setLink = useCallback(() => {
        if (!editor) return;

        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("URL", previousUrl);

        if (url === null) return;

        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }, [editor]);

    if (!editor) {
        return (
            <div className="border border-default-200 rounded-lg p-4 min-h-[280px] bg-default-50">
                Loading editor...
            </div>
        );
    }

    const ToolbarButton = ({
        onClick,
        isActive,
        children,
        title,
    }: {
        onClick: () => void;
        isActive?: boolean;
        children: React.ReactNode;
        title: string;
    }) => (
        <Button
            isIconOnly
            size="sm"
            title={title}
            variant={isActive ? "flat" : "light"}
            onPress={onClick}
        >
            {children}
        </Button>
    );

    return (
        <div className="border border-default-200 rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 p-2 bg-default-50 border-b border-default-200">
                {/* Text formatting */}
                <ToolbarButton
                    isActive={editor.isActive("bold")}
                    title="Bold"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <Bold size={16} />
                </ToolbarButton>
                <ToolbarButton
                    isActive={editor.isActive("italic")}
                    title="Italic"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <Italic size={16} />
                </ToolbarButton>
                <ToolbarButton
                    isActive={editor.isActive("underline")}
                    title="Underline"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                    <UnderlineIcon size={16} />
                </ToolbarButton>
                <ToolbarButton
                    isActive={editor.isActive("strike")}
                    title="Strikethrough"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                    <Strikethrough size={16} />
                </ToolbarButton>

                <Divider className="h-6 mx-1" orientation="vertical" />

                {/* Headings */}
                <ToolbarButton
                    isActive={editor.isActive("heading", { level: 1 })}
                    title="Heading 1"
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 1 }).run()
                    }
                >
                    <Heading1 size={16} />
                </ToolbarButton>
                <ToolbarButton
                    isActive={editor.isActive("heading", { level: 2 })}
                    title="Heading 2"
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                >
                    <Heading2 size={16} />
                </ToolbarButton>
                <ToolbarButton
                    isActive={editor.isActive("heading", { level: 3 })}
                    title="Heading 3"
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                    }
                >
                    <Heading3 size={16} />
                </ToolbarButton>

                <Divider className="h-6 mx-1" orientation="vertical" />

                {/* Lists */}
                <ToolbarButton
                    isActive={editor.isActive("bulletList")}
                    title="Bullet List"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    <List size={16} />
                </ToolbarButton>
                <ToolbarButton
                    isActive={editor.isActive("orderedList")}
                    title="Numbered List"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    <ListOrdered size={16} />
                </ToolbarButton>

                <Divider className="h-6 mx-1" orientation="vertical" />

                {/* Alignment */}
                <ToolbarButton
                    isActive={editor.isActive({ textAlign: "left" })}
                    title="Align Left"
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                >
                    <AlignLeft size={16} />
                </ToolbarButton>
                <ToolbarButton
                    isActive={editor.isActive({ textAlign: "center" })}
                    title="Align Center"
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                >
                    <AlignCenter size={16} />
                </ToolbarButton>
                <ToolbarButton
                    isActive={editor.isActive({ textAlign: "right" })}
                    title="Align Right"
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                >
                    <AlignRight size={16} />
                </ToolbarButton>

                <Divider className="h-6 mx-1" orientation="vertical" />

                {/* Links */}
                <ToolbarButton
                    isActive={editor.isActive("link")}
                    title="Add Link"
                    onClick={setLink}
                >
                    <LinkIcon size={16} />
                </ToolbarButton>
                <ToolbarButton
                    title="Remove Link"
                    onClick={() => editor.chain().focus().unsetLink().run()}
                >
                    <Unlink size={16} />
                </ToolbarButton>
            </div>

            {/* Editor content */}
            <EditorContent editor={editor} />
        </div>
    );
}
