import { Card, CardBody, CardHeader } from "@heroui/card";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">welcome</h2>
        <p className="text-default-500 mt-2">
          manage your entire Fluxify platform from here
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">total users</h3>
          </CardHeader>
          <CardBody>
            <p className="text-4xl font-bold">0</p>
            <p className="text-sm text-default-500 mt-2">registered users</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">total vendors</h3>
          </CardHeader>
          <CardBody>
            <p className="text-4xl font-bold">0</p>
            <p className="text-sm text-default-500 mt-2">active vendors</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">total orders</h3>
          </CardHeader>
          <CardBody>
            <p className="text-4xl font-bold">0</p>
            <p className="text-sm text-default-500 mt-2">all-time orders</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">quick actions</h3>
        </CardHeader>
        <CardBody>
          <p className="text-default-500">
            admin dashboard features coming soon...
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
