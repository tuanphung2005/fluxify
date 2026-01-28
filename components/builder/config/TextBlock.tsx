import RichTextEditor from "@/components/common/RichTextEditor";
import { BaseComponentConfigProps } from "@/types/shop-components";
import { TextBlockConfig as TextBlockConfigType } from "@/types/shop";

export default function TextBlock({
  config,
  onUpdate,
}: BaseComponentConfigProps<TextBlockConfigType>) {
  return (
    <RichTextEditor
      content={config.content || ""}
      onChange={(html) => onUpdate("content", html)}
    />
  );
}
