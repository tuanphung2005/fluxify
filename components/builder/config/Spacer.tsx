import { Input } from "@heroui/input";
import { BaseComponentConfigProps } from "@/types/shop-components";
import { SpacerConfig as SpacerConfigType } from "@/types/shop";

export default function Spacer({ config, onUpdate }: BaseComponentConfigProps<SpacerConfigType>) {
    return (
        <Input
            type="number"
            label="Height (px)"
            value={String(config.height || 50)}
            onValueChange={(value) => onUpdate("height", Number(value) || 50)}
        />
    );
}
