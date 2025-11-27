"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
import { motion } from "framer-motion";

interface SalesData {
    month: string;
    sales: number;
}

const data: SalesData[] = [
    { month: "Jan", sales: 4000 },
    { month: "Feb", sales: 3000 },
    { month: "Mar", sales: 2000 },
    { month: "Apr", sales: 2780 },
    { month: "May", sales: 1890 },
    { month: "Jun", sales: 2390 },
    { month: "Jul", sales: 3490 },
];

export default function SalesChart() {
    const maxSales = Math.max(...data.map((d) => d.sales));

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-col items-start px-6 pt-6 pb-0">
                <h4 className="text-large font-bold">Monthly Sales</h4>
                <p className="text-small text-default-500">Revenue over the last 7 months</p>
            </CardHeader>
            <CardBody className="px-6 py-6">
                <div className="flex items-end justify-between h-64 gap-2 w-full">
                    {data.map((item, index) => (
                        <div key={index} className="flex flex-col items-center gap-2 flex-1 h-full justify-end group">
                            <div className="relative w-full flex justify-center h-full items-end">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(item.sales / maxSales) * 100}%` }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="w-full max-w-[40px] bg-primary rounded-t-lg opacity-80 group-hover:opacity-100 transition-opacity relative"
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-content1 px-2 py-1 rounded shadow-sm text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        ${item.sales}
                                    </div>
                                </motion.div>
                            </div>
                            <span className="text-xs text-default-500 font-medium">{item.month}</span>
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    );
}
