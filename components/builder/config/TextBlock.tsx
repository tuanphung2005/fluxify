import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { BaseComponentConfigProps } from "@/types/shop-components";
import { TextBlockConfig as TextBlockConfigType } from "@/types/shop";

export default function TextBlock({
    config,
    onUpdate,
}: BaseComponentConfigProps<TextBlockConfigType>) {
    return (
        <>
            <Textarea
                label="Content (HTML - sanitized for security)"
                placeholder="<p>Your content here...</p>"
                description="Only safe HTML tags allowed (p, h1-h6, strong, em, ul, ol, li, a)"
                value={config.content || ""}
                onValueChange={(value) => onUpdate("content", value)}
                minRows={6}
            />
            <Select
                label="Alignment"
                selectedKeys={[config.alignment || "left"]}
                onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0];
                    onUpdate("alignment", value);
                }}
            >
                <SelectItem key="left">Left</SelectItem>
                <SelectItem key="center">Center</SelectItem>
                <SelectItem key="right">Right</SelectItem>
            </Select>
            <Select
                label="Padding"
                selectedKeys={[config.padding || "medium"]}
                onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0];
                    onUpdate("padding", value);
                }}
            >
                <SelectItem key="small">Small</SelectItem>
                <SelectItem key="medium">Medium</SelectItem>
                <SelectItem key="large">Large</SelectItem>
            </Select>
        </>
    );
}
