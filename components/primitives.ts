import { tv } from "tailwind-variants";

export const title = tv({
  base: "tracking-tight inline font-bold",
  variants: {
    color: {
      foreground: "text-foreground",
    },
    size: {
      sm: "text-3xl lg:text-4xl",
      md: "text-[2.3rem] lg:text-5xl",
      lg: "text-4xl lg:text-6xl",
    },
    fullWidth: {
      true: "w-full block",
    },
  },
  defaultVariants: {
    size: "md",
  },
  compoundVariants: [
    {
      color: [
        "foreground",
      ],
      class: "bg-clip-text",
    },
  ],
});

export const subtitle = tv({
  base: "my-2 text-lg lg:text-xl text-default-600",
  variants: {
    fullWidth: {
      true: "!w-full",
    },
  },
  defaultVariants: {
    fullWidth: true,
  },
});

