"use client";

import { Card, CardBody } from "@heroui/card";
import { ShoppingBag, DollarSign, Calendar } from "lucide-react";
import { formatDate } from "./types";

interface StatsCardsProps {
    totalOrders: number;
    totalSpent: number;
    memberSince: string;
}

export default function StatsCards({ totalOrders, totalSpent, memberSince }: StatsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-none shadow-md bg-gradient-to-br from-primary-50 to-background">
                <CardBody className="flex flex-row items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <ShoppingBag className="text-primary" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-default-500">Total Orders</p>
                        <p className="text-2xl font-bold">{totalOrders}</p>
                    </div>
                </CardBody>
            </Card>

            <Card className="border-none shadow-md bg-gradient-to-br from-success-50 to-background">
                <CardBody className="flex flex-row items-center gap-4">
                    <div className="p-3 bg-success/10 rounded-xl">
                        <DollarSign className="text-success" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-default-500">Total Spent</p>
                        <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
                    </div>
                </CardBody>
            </Card>

            <Card className="border-none shadow-md bg-gradient-to-br from-secondary-50 to-background">
                <CardBody className="flex flex-row items-center gap-4">
                    <div className="p-3 bg-secondary/10 rounded-xl">
                        <Calendar className="text-secondary" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-default-500">Member Since</p>
                        <p className="text-lg font-semibold">{formatDate(memberSince)}</p>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
