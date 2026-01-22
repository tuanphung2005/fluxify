"use client";

import { SpacerConfig } from "@/types/shop";
import { BaseComponentProps } from "@/types/shop-components";

export default function Spacer({ config }: BaseComponentProps<SpacerConfig>) {
  const { height = 50 } = config as SpacerConfig;

  return <div style={{ height: `${height}px` }} />;
}
