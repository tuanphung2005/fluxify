"use client";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { motion } from "framer-motion";

interface SalesData {
  month: string;
  sales: number;
}

interface SalesChartProps {
  data: SalesData[];
}

export default function SalesChart({ data }: SalesChartProps) {
  const maxSales = Math.max(...data.map((d) => d.sales), 100);

  return (
    <Card className="w-full border-none shadow-md h-full">
      <CardHeader className="flex flex-col items-start px-6 pt-6 pb-0">
        <h4 className="text-xl font-bold">Revenue Overview</h4>
        <p className="text-sm text-default-500">Monthly sales performance</p>
      </CardHeader>
      <CardBody className="px-6 py-6">
        <div className="flex items-end justify-between h-64 gap-4 w-full mt-4">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-3 flex-1 h-full justify-end group"
            >
              <div className="relative w-full flex justify-center h-full items-end">
                <motion.div
                  animate={{ height: `${(item.sales / maxSales) * 100}%` }}
                  className="w-full max-w-[40px] bg-primary rounded-t-xl opacity-80 group-hover:opacity-100 transition-all duration-300 relative hover:shadow-lg hover:shadow-primary/30"
                  initial={{ height: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.1,
                    type: "spring",
                  }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-content1 px-3 py-1.5 rounded-lg shadow-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-10 border border-divider transform translate-y-2 group-hover:translate-y-0">
                    ${item.sales.toLocaleString()}
                  </div>
                </motion.div>
              </div>
              <span className="text-xs text-default-500 font-medium uppercase tracking-wider">
                {item.month}
              </span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
