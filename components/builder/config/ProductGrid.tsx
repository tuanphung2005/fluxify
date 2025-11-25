import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { BaseComponentConfigProps } from "@/types/shop-components";
import { ProductGridConfig as ProductGridConfigType } from "@/types/shop";

export default function ProductGrid({
    config,
    onUpdate,
}: BaseComponentConfigProps<ProductGridConfigType>) {
    return (
        <>
            <Input
                label="Section Title (Optional)"
                value={config.title || ""}
                onValueChange={(value) => onUpdate("title", value)}
            />
            <Select
                label="Columns"
                selectedKeys={[String(config.columns || 3)]}
                onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0];
                    onUpdate("columns", Number(value));
                }}
            >
                <SelectItem key="2">2 Columns</SelectItem>
                <SelectItem key="3">3 Columns</SelectItem>
                <SelectItem key="4">4 Columns</SelectItem>
            </Select>
            <Switch
                isSelected={config.showAddToCart ?? true}
                onValueChange={(value) => onUpdate("showAddToCart", value)}
            >
                Show Add to Cart Button
            </Switch>
            <Switch
                isSelected={config.showAllProducts ?? true}
                onValueChange={(value) => onUpdate("showAllProducts", value)}
            >
                Show All Products
            </Switch>
            <p className="text-xs text-default-500">
                Custom product selection coming soon...
            </p>
        </>
    );
}
