import { subtitle, title } from "@/components/primitives";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <p className={title()}>Welcome to Fluxify</p>
      <p className={subtitle()}>
        Start shopping now.
      </p>

      <p>This is base text.</p>
    </section>
  );
}
