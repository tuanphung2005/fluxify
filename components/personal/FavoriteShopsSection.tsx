"use client";

import { Card, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { Heart, HeartOff, Store, ExternalLink } from "lucide-react";
import Link from "next/link";
import { FavoriteShop } from "./types";

interface FavoriteShopsSectionProps {
    shops: FavoriteShop[];
    removingShopId: string | null;
    onRemove: (vendorId: string) => void;
}

export default function FavoriteShopsSection({
    shops,
    removingShopId,
    onRemove
}: FavoriteShopsSectionProps) {
    return (
        <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Heart size={20} className="text-danger" />
                Favorite Shops
            </h2>
            {shops.length > 0 ? (
                <div className="space-y-3">
                    {shops.map((shop) => (
                        <Card key={shop.id} className="border-none shadow-md">
                            <CardBody className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-default-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        {shop.vendor.favicon ? (
                                            <Image
                                                src={shop.vendor.favicon}
                                                alt={shop.vendor.storeName}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        ) : (
                                            <Store size={24} className="text-default-400" />
                                        )}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <h3 className="font-semibold truncate">{shop.vendor.storeName}</h3>
                                        <p className="text-sm text-default-500 line-clamp-1">
                                            {shop.vendor.description || "No description"}
                                        </p>
                                        <p className="text-xs text-default-400 mt-1">
                                            {shop.vendor.productCount} products
                                        </p>
                                    </div>
                                </div>
                            </CardBody>
                            <CardFooter className="pt-0 gap-2">
                                <Button
                                    as={Link}
                                    href={`/shop/${shop.vendor.id}`}
                                    size="sm"
                                    variant="flat"
                                    color="primary"
                                    startContent={<ExternalLink size={14} />}
                                    className="flex-1"
                                >
                                    Visit Shop
                                </Button>
                                <Button
                                    size="sm"
                                    variant="flat"
                                    color="danger"
                                    isIconOnly
                                    isLoading={removingShopId === shop.vendor.id}
                                    onPress={() => onRemove(shop.vendor.id)}
                                >
                                    <HeartOff size={16} />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="border-none shadow-sm h-full">
                    <CardBody className="text-center py-8 flex flex-col items-center justify-center">
                        <Heart size={40} className="mx-auto mb-3 text-default-300" />
                        <p className="text-default-500">No favorite shops yet</p>
                        <p className="text-sm text-default-400">
                            Visit shops and add them to your favorites!
                        </p>
                    </CardBody>
                </Card>
            )}
        </section>
    );
}
