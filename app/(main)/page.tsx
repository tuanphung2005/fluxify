"use client";
import { Button } from "@heroui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  MousePointer2,
  Palette,
  Layers,
  Eye,
  Rocket,
  Grip,
  Type,
  Image,
  ShoppingCart,
  Star,
  CreditCard,
  Shield,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LazyMotion,
  domAnimation,
  m,
  useInView,
} from "framer-motion";

// --------------- ANIMATED BUILDER MOCKUP ---------------
function BuilderMockup() {
  return (
    <div className="relative w-full max-w-[540px] mx-auto">
      {/* Browser chrome */}
      <div
        className="rounded-2xl overflow-hidden shadow-2xl border border-default-200"
        style={{
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,240,245,0.9))",
        }}
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-default-200 bg-default-50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 rounded-md bg-default-100 text-xs text-default-500 font-mono">
              fluxify.shop/my-store
            </div>
          </div>
        </div>

        {/* Builder workspace */}
        <div className="p-4 space-y-3 min-h-[320px]">
          {/* Block 1: Hero banner */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              animation: "block-assemble-1 0.8s ease-out 0.3s both",
            }}
          >
            <div
              className="h-24 rounded-xl flex items-center justify-center relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, #f43f5e 0%, #f97316 50%, #fbbf24 100%)",
              }}
            >
              <div className="text-white/90 text-center">
                <p className="font-bold text-lg">Cửa hàng của bạn</p>
                <p className="text-xs text-white/70">
                  Thiết kế bởi chính bạn ✨
                </p>
              </div>
              {/* Shimmer overlay */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 3s ease-in-out infinite",
                }}
              />
            </div>
          </div>

          {/* Block 2: Product grid */}
          <div
            className="rounded-xl"
            style={{
              animation: "block-assemble-2 0.8s ease-out 0.7s both",
            }}
          >
            <div className="grid grid-cols-3 gap-2">
              {[
                { color: "#fbbf24", label: "SP 1" },
                { color: "#34d399", label: "SP 2" },
                { color: "#60a5fa", label: "SP 3" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-lg p-3 text-center"
                  style={{
                    background: `${item.color}20`,
                    border: `1px solid ${item.color}40`,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-md mx-auto mb-1.5"
                    style={{ background: `${item.color}60` }}
                  />
                  <p className="text-[10px] text-default-600 font-medium">
                    {item.label}
                  </p>
                  <p
                    className="text-[10px] font-bold"
                    style={{ color: item.color }}
                  >
                    100k
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Block 3: Text content */}
          <div
            className="rounded-xl bg-default-100 p-4"
            style={{
              animation: "block-assemble-3 0.8s ease-out 1.1s both",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Type className="w-3 h-3 text-default-400" />
              <div className="h-2 w-24 bg-default-300 rounded-full" />
            </div>
            <div className="space-y-1.5">
              <div className="h-1.5 w-full bg-default-200 rounded-full" />
              <div className="h-1.5 w-4/5 bg-default-200 rounded-full" />
              <div className="h-1.5 w-3/5 bg-default-200 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating cursor */}
      <div
        className="absolute -right-2 top-1/3"
        style={{
          animation: "float-gentle 3s ease-in-out infinite",
        }}
      >
        <div className="relative">
          <MousePointer2 className="w-6 h-6 text-primary drop-shadow-lg" />
          <div className="absolute -top-8 left-4 px-2 py-1 rounded-md bg-primary text-white text-[10px] font-medium whitespace-nowrap shadow-lg">
            Kéo thả ở đây
          </div>
        </div>
      </div>

      {/* Floating component palette */}
      <div
        className="absolute -left-16 top-1/4 flex flex-col gap-2"
        style={{
          animation: "float-in-left 0.6s ease-out 1.5s both",
        }}
      >
        {[
          { icon: Image, color: "#f43f5e" },
          { icon: Type, color: "#f97316" },
          { icon: ShoppingCart, color: "#fbbf24" },
        ].map((item, i) => {
          const Icon = item.icon;

          return (
            <div
              key={i}
              className="w-10 h-10 rounded-xl bg-white shadow-lg border border-default-200 flex items-center justify-center hover:scale-110 transition-transform"
              style={{
                animation: `float-gentle 4s ease-in-out ${i * 0.5}s infinite`,
              }}
            >
              <Icon className="w-4 h-4" style={{ color: item.color }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --------------- ANIMATED FEATURE CARD ---------------
function FeatureShowcase({
  icon: Icon,
  title,
  description,
  gradient,
  visual,
  index,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  visual: React.ReactNode;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <m.div
      ref={ref}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      className="group relative"
      initial={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
    >
      <div
        className="relative rounded-3xl overflow-hidden border border-default-200 hover:border-primary/40 transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.6))",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Visual preview area */}
        <div
          className="h-40 relative overflow-hidden flex items-center justify-center"
          style={{ background: gradient }}
        >
          <div className="relative z-10 opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500">
            {visual}
          </div>
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        {/* Text content */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-default-100 flex items-center justify-center">
              <Icon className="w-5 h-5 text-default-700" />
            </div>
            <h3 className="text-lg font-bold">{title}</h3>
          </div>
          <p className="text-default-500 text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </m.div>
  );
}

// --------------- MINI ILLUSTRATIONS ---------------
function DragDropVisual() {
  return (
    <div className="flex gap-3 items-center">
      <div className="flex flex-col gap-1.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-14 h-8 rounded-lg bg-white/60 border border-white/40 flex items-center justify-center"
          >
            <Grip className="w-3 h-3 text-white/80" />
          </div>
        ))}
      </div>
      <ArrowRight className="w-5 h-5 text-white/60" />
      <div className="w-20 h-28 rounded-xl bg-white/20 border-2 border-dashed border-white/40 flex items-center justify-center">
        <Layers className="w-6 h-6 text-white/60" />
      </div>
    </div>
  );
}

function CustomizeVisual() {
  return (
    <div className="flex gap-2">
      {["#f43f5e", "#f97316", "#fbbf24", "#10b981"].map((color, i) => (
        <div
          key={i}
          className="w-10 h-10 rounded-xl border-2 border-white/40 hover:scale-110 transition-transform cursor-pointer"
          style={{ background: color }}
        />
      ))}
    </div>
  );
}

function PreviewVisual() {
  return (
    <div className="w-32 h-20 rounded-xl bg-white/20 border border-white/30 overflow-hidden">
      <div className="h-6 bg-white/20 border-b border-white/20 flex items-center px-2">
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
        </div>
      </div>
      <div className="p-1.5 space-y-1">
        <div className="h-1 w-full bg-white/30 rounded-full" />
        <div className="h-1 w-3/4 bg-white/20 rounded-full" />
        <div className="grid grid-cols-3 gap-0.5 mt-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-3 rounded-sm bg-white/20" />
          ))}
        </div>
      </div>
    </div>
  );
}

function PublishVisual() {
  return (
    <div className="relative">
      <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center">
        <Rocket className="w-6 h-6 text-white" />
      </div>
      <div
        className="absolute -inset-2 rounded-full border-2 border-white/30"
        style={{ animation: "pulse-ring 2s ease-in-out infinite" }}
      />
    </div>
  );
}

// --------------- STEP COMPONENT ---------------
function BuilderStep({
  step,
  title,
  desc,
  visual,
  index,
}: {
  step: string;
  title: string;
  desc: string;
  visual: React.ReactNode;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <m.div
      ref={ref}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
      className="flex items-start gap-6"
      initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
    >
      {/* Timeline line & dot */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary font-bold text-lg">
          {step}
        </div>
        {index < 3 && (
          <div className="w-0.5 h-16 bg-gradient-to-b from-primary/30 to-transparent mt-2" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-default-500 text-sm mb-4 leading-relaxed">
          {desc}
        </p>
        <div className="inline-block">{visual}</div>
      </div>
    </m.div>
  );
}

// ===================== MAIN PAGE =====================
export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const openRegister = () => router.push("?modal=register", { scroll: false });
  const openLogin = () => router.push("?modal=login", { scroll: false });

  return (
    <LazyMotion features={domAnimation}>
      <div className="flex flex-col">
        {/* ============ HERO SECTION ============ */}
        <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at 30% 20%, rgba(244,63,94,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(249,115,22,0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(251,191,36,0.04) 0%, transparent 70%)",
              }}
            />
            {/* Subtle dot grid */}
            <div
              className="absolute inset-0 opacity-[0.15]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, hsl(var(--heroui-default-400)) 0.5px, transparent 0)",
                backgroundSize: "32px 32px",
              }}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text content */}
            <m.div
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              className="text-center lg:text-left"
              initial={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-6">
                <Palette className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Thiết kế của bạn, cửa hàng của bạn
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                <span className="text-foreground">Không chỉ bán hàng,</span>
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, #f43f5e, #f97316, #fbbf24)",
                    backgroundSize: "200% 200%",
                    animation: "gradient-shift 4s ease infinite",
                  }}
                >
                  xây dựng thương hiệu.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-default-500 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
                Kéo, thả, tuỳ chỉnh — tạo cửa hàng trực tuyến với thiết kế
                hoàn toàn theo phong cách riêng của bạn. Không cần code.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start items-center">
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
                    className="px-8 py-6 text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                    color="primary"
                    endContent={<ArrowRight className="w-5 h-5" />}
                    size="lg"
                    onPress={openRegister}
                  >
                    Bắt đầu xây dựng
                  </Button>
                )}
                {!session?.user && (
                  <Button
                    className="px-8 py-6 text-lg font-semibold"
                    size="lg"
                    variant="bordered"
                    onPress={openLogin}
                  >
                    Đăng nhập
                  </Button>
                )}
              </div>

              {/* Trust */}
              <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-6 text-default-400 text-sm">
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  <span>Miễn phí</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  <span>Bảo mật</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  <span>5 phút cài đặt</span>
                </div>
              </div>
            </m.div>

            {/* Right: Animated builder mockup */}
            <m.div
              animate={mounted ? { opacity: 1, scale: 1 } : {}}
              className="hidden lg:block"
              initial={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <BuilderMockup />
            </m.div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-default-400">
            <span className="text-xs">Xem thêm</span>
            <div className="w-5 h-8 rounded-full border-2 border-default-300 flex justify-center pt-1">
              <m.div
                animate={{ y: [0, 8, 0] }}
                className="w-1 h-1 rounded-full bg-default-400"
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </div>
        </section>

        {/* ============ WHAT MAKES US DIFFERENT ============ */}
        <section className="py-24 px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-16">
              <m.div
                initial={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-3">
                  Không giống ai
                </p>
                <h2 className="text-3xl md:text-5xl font-bold mb-4">
                  Cửa hàng mang dấu ấn{" "}
                  <span className="text-primary">của bạn</span>
                </h2>
                <p className="text-default-500 text-lg max-w-2xl mx-auto">
                  Không phải template có sẵn. Bạn thiết kế, bạn quyết định mọi
                  thứ — từ layout đến màu sắc.
                </p>
              </m.div>
            </div>

            {/* Feature cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <FeatureShowcase
                description="Thêm, sắp xếp, xoá các block — từ banner, sản phẩm, đến video. Chỉ cần kéo thả, không cần viết code."
                gradient="linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)"
                icon={Layers}
                index={0}
                title="Kéo thả trực quan"
                visual={<DragDropVisual />}
              />
              <FeatureShowcase
                description="Chọn màu sắc, font chữ, hình ảnh theo phong cách riêng. Mỗi cửa hàng là duy nhất."
                gradient="linear-gradient(135deg, #f97316 0%, #fb923c 100%)"
                icon={Palette}
                index={1}
                title="Tuỳ chỉnh mọi thứ"
                visual={<CustomizeVisual />}
              />
              <FeatureShowcase
                description="Xem trước cửa hàng của bạn theo thời gian thực. Thay đổi ở đâu, thấy ngay tại đó."
                gradient="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
                icon={Eye}
                index={2}
                title="Preview real-time"
                visual={<PreviewVisual />}
              />
              <FeatureShowcase
                description="Một click để xuất bản. Cửa hàng của bạn lên sóng ngay lập tức, sẵn sàng bán hàng."
                gradient="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
                icon={Rocket}
                index={3}
                title="Xuất bản tức thì"
                visual={<PublishVisual />}
              />
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS — VISUAL TIMELINE ============ */}
        <section className="py-24 px-6 bg-default-50/50">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <m.div
                initial={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-3">
                  Quy trình đơn giản
                </p>
                <h2 className="text-3xl md:text-5xl font-bold mb-4">
                  4 bước tạo cửa hàng
                </h2>
                <p className="text-default-500 text-lg">
                  Từ ý tưởng đến cửa hàng hoạt động — nhanh hơn bạn nghĩ.
                </p>
              </m.div>
            </div>

            <div className="space-y-2">
              <BuilderStep
                desc="Đăng ký miễn phí, chỉ cần email. Không thẻ tín dụng, không cam kết."
                index={0}
                step="1"
                title="Tạo tài khoản"
                visual={
                  <div className="flex gap-2">
                    <div className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium">
                      Email
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-medium flex items-center gap-1">
                      <Star className="w-3 h-3" /> Xác thực
                    </div>
                  </div>
                }
              />
              <BuilderStep
                desc="Mở Shop Builder, kéo thả các block: banner, sản phẩm, text, video, gallery..."
                index={1}
                step="2"
                title="Thiết kế cửa hàng"
                visual={
                  <div className="flex gap-1.5">
                    {["Banner", "Sản phẩm", "Text"].map((label) => (
                      <div
                        key={label}
                        className="px-2.5 py-1.5 rounded-lg bg-secondary/10 text-secondary text-xs font-medium border border-secondary/20"
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                }
              />
              <BuilderStep
                desc="Thêm sản phẩm, đặt giá, upload ảnh. Quản lý tồn kho ngay trên builder."
                index={2}
                step="3"
                title="Thêm sản phẩm"
                visual={
                  <div className="flex gap-2 items-center">
                    <div className="w-8 h-8 rounded-lg bg-warning/20 border border-warning/30 flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 text-warning" />
                    </div>
                    <div className="text-xs text-default-500">
                      <span className="font-semibold text-foreground">
                        120+
                      </span>{" "}
                      sản phẩm đã thêm
                    </div>
                  </div>
                }
              />
              <BuilderStep
                desc="Nhấn Xuất bản và cửa hàng online ngay. Chia sẻ link cho khách hàng."
                index={3}
                step="4"
                title="Xuất bản & bán hàng"
                visual={
                  <div className="flex gap-2 items-center">
                    <div className="px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-bold border border-success/20 flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      Đang hoạt động
                    </div>
                  </div>
                }
              />
            </div>
          </div>
        </section>

        {/* ============ CTA — BUILDER TEASER ============ */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <m.div
              initial={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div
                className="relative rounded-3xl overflow-hidden p-12 md:p-16"
                style={{
                  background:
                    "linear-gradient(135deg, #f43f5e 0%, #f97316 40%, #fbbf24 100%)",
                }}
              >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                    backgroundSize: "40px 40px",
                  }}
                />

                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                    <Palette className="w-4 h-4 text-white" />
                    <span className="text-sm font-medium text-white/90">
                      Bắt đầu thiết kế ngay
                    </span>
                  </div>

                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                    Sẵn sàng xây dựng
                    <br />
                    cửa hàng của riêng bạn?
                  </h2>
                  <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
                    Hàng trăm người bán đã tạo cửa hàng với thiết kế riêng. Bạn
                    sẽ là người tiếp theo?
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {session?.user?.role === "VENDOR" ? (
                      <Button
                        as={Link}
                        className="bg-white text-primary px-10 py-6 text-lg font-semibold hover:bg-white/90 transition-colors shadow-xl"
                        endContent={<ArrowRight className="w-5 h-5" />}
                        href="/vendor/shop-builder"
                        size="lg"
                      >
                        Mở Shop Builder
                      </Button>
                    ) : (
                      <Button
                        className="bg-white text-primary px-10 py-6 text-lg font-semibold hover:bg-white/90 transition-colors shadow-xl"
                        endContent={<ArrowRight className="w-5 h-5" />}
                        size="lg"
                        onPress={openRegister}
                      >
                        Tạo cửa hàng miễn phí
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </m.div>
          </div>
        </section>

        {/* ============ FOOTER ============ */}
        <footer className="py-12 px-6 border-t border-divider">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #f43f5e, #f97316)",
                }}
              >
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="font-bold text-lg">Fluxify</span>
            </div>
            <div className="flex gap-6 text-default-500 text-sm">
              <Link
                className="hover:text-foreground transition-colors"
                href="/about"
              >
                Giới thiệu
              </Link>
              <Link className="hover:text-foreground transition-colors" href="#">
                Quyền riêng tư
              </Link>
              <Link className="hover:text-foreground transition-colors" href="#">
                Điều khoản
              </Link>
              <Link className="hover:text-foreground transition-colors" href="#">
                Liên hệ
              </Link>
            </div>
            <p className="text-default-400 text-sm">
              © {new Date().getFullYear()} Fluxify. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </LazyMotion>
  );
}
