"use client";

import { Card, CardBody } from "@heroui/card";
import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: React.ReactNode;
  color?: "primary" | "secondary" | "success" | "warning" | "default";
  className?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  subtext,
  color = "primary",
  className,
}: StatsCardProps) {
  const colorStyles = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary bg-secondary/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
    default: "text-default-500 bg-default-100",
  };

  return (
    <Card className={clsx("border-none shadow-md", className)}>
      <CardBody className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-default-600 uppercase tracking-wider">
              {title}
            </p>
            <h3 className="text-4xl font-bold mt-2">{value}</h3>
          </div>
          <div
            className={clsx(
              "p-3 rounded-xl",
              colorStyles[color] || colorStyles.default,
            )}
          >
            <Icon size={24} />
          </div>
        </div>
        {subtext && (
          <div className="mt-4 text-sm text-default-400">{subtext}</div>
        )}
      </CardBody>
    </Card>
  );
}
