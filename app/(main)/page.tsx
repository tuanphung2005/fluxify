"use client";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ShoppingBag,
  Zap,
  Shield,
  Store,
  CreditCard,
  Users,
  ArrowRight,
  Sparkles,
  BarChart3,
  Package,
} from "lucide-react";

const FEATURES = [
  {
    icon: Store,
    title: "Đỉnh của đẹp",
    description: "Tạo cửa hàng đẹp như tranh, chỉ cần kéo thả, không cần code",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Zap,
    title: "Nhanh như chớp",
    description:
      "Đã được tối ưu để bán hàng. Khách hàng không nên đợi, bạn cũng vậy.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    icon: Shield,
    title: "Bảo mật tốt",
    description: "Bảo mật tốt.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: BarChart3,
    title: "Dashboard phân tích",
    description: "Theo dõi đơn hàng, phân tích xu hướng.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: Package,
    title: "Quản lý sản phẩm",
    description: "Quản lý sản phẩm, loại sản phẩm, và tồn kho ở một trang.",
    color: "text-danger",
    bg: "bg-danger/10",
  },
  {
    icon: Users,
    title: "Hỗ trợ nhiều shop",
    description: "Hỗ trợ nhiều shop ở cùng một nền tảng.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

const STATS = [
  { value: "10K+", label: "Active Vendors" },
  { value: "1M+", label: "Products Sold" },
  { value: "99.9%", label: "Uptime" },
  { value: "$50M+", label: "Total GMV" },
];

export default function Home() {
  const { data: session } = useSession();
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--heroui-default-300)) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>


        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Thiết lập ngay hôm nay
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              Bán hàng là
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Dễ
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-default-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Nền tảng giúp bạn xây dựng, phát triển và mở rộng cửa hàng trực tuyến của mình trong vài phút, không phải vài tháng/năm.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {session?.user?.role === "VENDOR" ? (
              <Button
                as={Link}
                className="px-8 py-6 text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                color="primary"
                endContent={<ArrowRight className="w-5 h-5" />}
                href="/vendor"
                size="lg"
              >
                Tới dashboard
              </Button>
            ) : (
              <Button
                as={Link}
                className="px-8 py-6 text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                color="primary"
                endContent={<ArrowRight className="w-5 h-5" />}
                href="/auth/register"
                size="lg"
              >
                Bán hàng ngay
              </Button>
            )}
            {!session?.user && (
              <Button
                as={Link}
                className="px-8 py-6 text-lg font-semibold"
                href="/auth/login"
                size="lg"
                variant="bordered"
              >
                Đăng nhập
              </Button>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-default-400">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              <span className="text-sm">Không yêu cầu thẻ tín dụng</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Miễn phí mãi mãi</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span className="text-sm">Cài đặt trong 5 phút</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-default-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-default-500 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-default-500 max-w-2xl mx-auto">
              Powerful tools designed to help vendors thrive in the digital
              marketplace
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <Card
                  key={index}
                  className="border border-divider hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <CardBody className="p-6">
                    <div
                      className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}
                    >
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-default-500">{feature.description}</p>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-gradient-to-b from-default-50 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Launch in 3 Simple Steps
            </h2>
            <p className="text-xl text-default-500">
              From idea to income in just a few clicks
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Create Account",
                desc: "Sign up free and set up your vendor profile in seconds",
              },
              {
                step: "02",
                title: "Build Your Shop",
                desc: "Use our visual builder to create a stunning storefront",
              },
              {
                step: "03",
                title: "Start Selling",
                desc: "Add products, set prices, and watch the orders roll in",
              },
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                <div className="text-8xl font-bold text-default-100 absolute -top-4 left-1/2 -translate-x-1/2">
                  {item.step}
                </div>
                <div className="relative z-10 pt-12">
                  <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-default-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-primary to-secondary overflow-hidden">
            <CardBody className="p-12 md:p-16 text-center relative">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10">
                <ShoppingBag className="w-16 h-16 text-white/90 mx-auto mb-6" />
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                  Ready to Transform Your Business?
                </h2>
                <p className="text-xl text-white/80 mb-8 max-w-xl mx-auto">
                  Join thousands of vendors who have already discovered the
                  easier way to sell online.
                </p>
                <Button
                  as={Link}
                  className="bg-white text-primary px-10 py-6 text-lg font-semibold hover:bg-white/90 transition-colors"
                  endContent={<ArrowRight className="w-5 h-5" />}
                  href="/auth/register"
                  size="lg"
                >
                  Get Started Now — It's Free
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-divider">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">F</span>
            </div>
            <span className="font-bold text-lg">Fluxify</span>
          </div>
          <div className="flex gap-6 text-default-500 text-sm">
            <Link
              className="hover:text-foreground transition-colors"
              href="/about"
            >
              About
            </Link>
            <Link className="hover:text-foreground transition-colors" href="#">
              Privacy
            </Link>
            <Link className="hover:text-foreground transition-colors" href="#">
              Terms
            </Link>
            <Link className="hover:text-foreground transition-colors" href="#">
              Contact
            </Link>
          </div>
          <p className="text-default-400 text-sm">
            © {new Date().getFullYear()} Fluxify. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
