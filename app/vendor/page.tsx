import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Plus, Edit } from "lucide-react";

export default function VendorPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">mystore</h2>
          <p className="text-default-500 mt-2">
            manage your products and orders
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            color="secondary"
            variant="flat"
            href="/vendor/shop-builder"
            as="a"
            startContent={<Edit />}
            radius="none"
          >
            customize shop
          </Button>
          <Button color="primary" startContent={<Plus />} radius="none">
            add product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card radius="none">
          <CardHeader>
            <h3 className="text-xl font-semibold">products</h3>
          </CardHeader>
          <CardBody>
            <p className="text-4xl font-bold">0</p>
            <p className="text-sm text-default-500 mt-2">listed products</p>
          </CardBody>
        </Card>

        <Card radius="none">
          <CardHeader>
            <h3 className="text-xl font-semibold">pending orders</h3>
          </CardHeader>
          <CardBody>
            <p className="text-4xl font-bold">0</p>
            <p className="text-sm text-default-500 mt-2">awaiting processing</p>
          </CardBody>
        </Card>

        <Card radius="none">
          <CardHeader>
            <h3 className="text-xl font-semibold">total revenue</h3>
          </CardHeader>
          <CardBody>
            <p className="text-4xl font-bold">$0</p>
            <p className="text-sm text-default-500 mt-2">all-time earnings</p>
          </CardBody>
        </Card>
      </div>

      <Card radius="none">
        <CardHeader>
          <h3 className="text-xl font-semibold">recent products</h3>
        </CardHeader>
        <CardBody>
          <p className="text-default-500">
            no products yet. start by adding your first product!
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
