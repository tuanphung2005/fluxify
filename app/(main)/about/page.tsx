import type { Metadata } from "next";

import { title } from "@/components/primitives";

export const metadata: Metadata = {
  title: "Về chúng tôi",
  description: "Tìm hiểu thêm về Fluxify",
};

export default function AboutPage() {
  return (
    <div>
      <h1 className={title()}>About</h1>
    </div>
  );
}
