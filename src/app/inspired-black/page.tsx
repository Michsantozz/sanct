import Link from "next/link";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { DesignAuraOrb } from "@/components/agents-ui/design-aura-orb";
import { AgentAudioVisualizerAura } from "@/components/agents-ui/agent-audio-visualizer-aura";

const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"] });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["italic"],
});

const navItems = ["How it works", "Privacy", "Voice Session", "About"];
const metrics = [
  { title: "No white coats", subtitle: "No clinical pressure" },
  { title: "No waiting room", subtitle: "Start in your own pace" },
  { title: "No judgment", subtitle: "A safe voice-only space" },
];

export default function InspiredBlackPage() {
  return (
    <div
      className={`${manrope.className} relative min-h-screen overflow-hidden bg-[#050505] text-zinc-100`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_58%,rgba(251,191,36,0.24)_0%,rgba(251,191,36,0.09)_36%,rgba(251,191,36,0)_64%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_72%,rgba(71,49,32,0.18)_0%,rgba(71,49,32,0.07)_34%,rgba(71,49,32,0)_64%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.28)_0%,rgba(0,0,0,0.75)_74%,rgba(0,0,0,0.92)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(228,228,231,0.015)_1px,transparent_1px)] bg-[size:64px_100%] opacity-25" />
      </div>

      <header className="absolute inset-x-0 top-0 z-40 px-4 py-3 md:px-6 md:py-3">
        <div
          className="mx-auto flex w-full max-w-[1320px] items-center justify-between overflow-hidden rounded-full border border-zinc-200/24 bg-[linear-gradient(120deg,rgba(92,92,102,0.3)_0%,rgba(19,19,22,0.44)_46%,rgba(86,86,96,0.28)_100%)] px-4 py-2 shadow-[0_16px_40px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.3)] md:px-7"
          style={{
            backdropFilter: "blur(34px) saturate(180%)",
            WebkitBackdropFilter: "blur(34px) saturate(180%)",
          }}
        >
          <div className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(100deg,rgba(255,255,255,0.11)_0%,rgba(255,255,255,0.03)_34%,rgba(255,255,255,0.03)_68%,rgba(255,255,255,0.11)_100%)]" />

          <Link href="/" className="relative z-10 flex items-center gap-2.5 text-zinc-200">
            <span className="grid size-6 place-items-center rounded-full bg-zinc-100/8 ring-1 ring-zinc-100/28">
              <span className="size-3.5 rounded-full bg-[repeating-linear-gradient(-55deg,#f3ede3_0_1.7px,transparent_1.7px_3.4px)]" />
            </span>
            <span className="text-[18px] font-medium tracking-wide md:text-[21px]">
              ELAH
            </span>
          </Link>

          <nav className="relative z-10 hidden items-center gap-7 text-[13px] font-medium text-zinc-300/90 lg:flex">
            {navItems.map((item) => (
              <a key={item} href="#" className="transition hover:text-zinc-100">
                {item}
              </a>
            ))}
          </nav>

          <div className="relative z-10 flex items-center gap-2.5 text-zinc-300/90 md:gap-4">
            <a href="#" className="hidden text-[13px] font-semibold text-zinc-300 md:inline">
              Quiet mode
            </a>
            <button aria-label="Search" className="hidden md:inline-flex">
              <svg
                viewBox="0 0 24 24"
                className="size-4 stroke-current"
                fill="none"
                strokeWidth="1.75"
              >
                <circle cx="11" cy="11" r="6.8" />
                <path d="m16 16 5 5" strokeLinecap="round" />
              </svg>
            </button>
            <button aria-label="Menu" className="inline-flex">
              <svg
                viewBox="0 0 24 24"
                className="size-[18px] stroke-current"
                fill="none"
                strokeWidth="1.8"
              >
                <path d="M4 8h16M4 16h16" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="pointer-events-none absolute inset-0 z-10 hidden lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,rgba(251,191,36,0.24)_0%,rgba(251,191,36,0.1)_42%,rgba(251,191,36,0)_74%)]" />

        <DesignAuraOrb
          className="absolute inset-0 h-full w-full opacity-72 mix-blend-screen blur-[32px]"
          color="#E7B56F"
          speed={1.26}
          radius={0.255}
          thickness={0.03}
          alpha={1}
          bodyGain={0.06}
          auraGain={2.4}
          centerX={0.75}
          centerY={0.5}
        />

        <div className="absolute left-[75%] top-1/2 h-[min(84vh,1020px)] w-[min(84vh,1020px)] -translate-x-1/2 -translate-y-1/2 opacity-100 mix-blend-screen">
          <AgentAudioVisualizerAura
            className="h-full w-full drop-shadow-[0_0_26px_rgba(251,191,36,0.36)]"
            size="xl"
            state="thinking"
            color="#F4E7CF"
            colorShift={0.2}
            blur={0.04}
            themeMode="dark"
          />
        </div>

        <div className="absolute left-[75%] top-1/2 h-[min(100vh,1240px)] w-[min(100vh,1240px)] -translate-x-1/2 -translate-y-1/2 opacity-72 mix-blend-screen blur-[14px]">
          <AgentAudioVisualizerAura
            className="h-full w-full"
            size="xl"
            state="thinking"
            color="#ECC18A"
            colorShift={0.24}
            blur={0.06}
            themeMode="dark"
          />
        </div>

        <div className="absolute left-[75%] top-1/2 h-[min(120vh,1460px)] w-[min(120vh,1460px)] -translate-x-1/2 -translate-y-1/2 opacity-42 mix-blend-screen blur-[28px]">
          <AgentAudioVisualizerAura
            className="h-full w-full"
            size="xl"
            state="speaking"
            color="#DCA15E"
            colorShift={0.28}
            blur={0.12}
            themeMode="dark"
          />
        </div>

        <DesignAuraOrb
          className="absolute inset-0 h-full w-full opacity-78"
          color="#E7B56F"
          speed={1.08}
          radius={0.252}
          thickness={0.034}
          alpha={1}
          bodyGain={0.72}
          auraGain={0.68}
          centerX={0.75}
          centerY={0.5}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 lg:hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_116%,rgba(251,191,36,0.22)_0%,rgba(251,191,36,0.13)_24%,rgba(251,191,36,0.08)_44%,rgba(251,191,36,0.03)_62%,transparent_86%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(115%_80%_at_50%_86%,rgba(254,243,199,0.14)_0%,rgba(254,243,199,0.08)_34%,rgba(254,243,199,0.03)_58%,transparent_84%)] blur-[18px]" />

        <div className="absolute inset-x-0 bottom-0 h-[70svh] overflow-hidden">
          <DesignAuraOrb
            className="mobile-aura-mask absolute inset-x-[-16vw] bottom-[-64vw] h-[166vw] w-[166vw] opacity-58 mix-blend-screen blur-[34px]"
            color="#E7B56F"
            speed={1.2}
            radius={0.255}
            thickness={0.03}
            alpha={1}
            bodyGain={0.08}
            auraGain={1.9}
            centerX={0.5}
            centerY={0.5}
          />

          <div className="mobile-aura-mask absolute left-1/2 bottom-[-60vw] h-[136vw] w-[136vw] -translate-x-1/2 opacity-100 mix-blend-screen">
            <AgentAudioVisualizerAura
              className="h-full w-full drop-shadow-[0_0_24px_rgba(251,191,36,0.34)]"
              size="xl"
              state="thinking"
              color="#F4E7CF"
              colorShift={0.2}
              blur={0.04}
              themeMode="dark"
            />
          </div>

          <div className="mobile-aura-mask absolute left-1/2 bottom-[-60vw] h-[136vw] w-[136vw] -translate-x-1/2 opacity-70 mix-blend-screen blur-[12px]">
            <AgentAudioVisualizerAura
              className="h-full w-full"
              size="xl"
              state="thinking"
              color="#ECC18A"
              colorShift={0.24}
              blur={0.06}
              themeMode="dark"
            />
          </div>

          <div className="mobile-aura-mask absolute left-1/2 bottom-[-60vw] h-[136vw] w-[136vw] -translate-x-1/2 opacity-34 mix-blend-screen blur-[22px]">
            <AgentAudioVisualizerAura
              className="h-full w-full"
              size="xl"
              state="speaking"
              color="#DCA15E"
              colorShift={0.28}
              blur={0.12}
              themeMode="dark"
            />
          </div>

          <DesignAuraOrb
            className="mobile-aura-mask absolute left-1/2 bottom-[-74vw] h-[156vw] w-[156vw] -translate-x-1/2 opacity-72"
            color="#E7B56F"
            speed={1.08}
            radius={0.252}
            thickness={0.034}
            alpha={1}
            bodyGain={0.7}
            auraGain={0.72}
            centerX={0.5}
            centerY={0.5}
          />
        </div>
      </div>

      <main className="relative z-20 mx-auto h-[100svh] w-full max-w-[1320px] px-6 pb-8 pt-24 md:px-10 md:pb-7 md:pt-24 lg:px-14">
        <div className="grid h-full w-full grid-rows-[auto_1fr] gap-3 md:grid-rows-[minmax(0,1fr)_auto] md:gap-5">
          <section className="grid min-h-0 items-start gap-6 pt-6 md:items-center md:pt-0">
            <div className="mx-auto max-w-[720px] space-y-3 text-center md:mx-0 md:space-y-7 md:text-left">
              <h1
                className={`${cormorant.className} text-[44px] leading-[0.92] tracking-tight text-zinc-200 md:text-[92px]`}
              >
                <span className="block whitespace-nowrap">Take a breath.</span>
                <span className="block whitespace-nowrap text-zinc-300">Nobody is watching.</span>
              </h1>

              <p className="max-w-[670px] text-[14px] leading-[1.4] text-[#b7afa2] md:text-[24px]">
                <span className="block">I know the white coats make you anxious.</span>
                <span className="block">You don&apos;t have to be brave here.</span>
                <span className="block">I&apos;m Elah.</span>
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-1 md:justify-start">
                <Link
                  href="/"
                  className="elah-aura-button"
                >
                  <span className="elah-aura-ring" />
                  <span className="elah-aura-core" />
                  <span className="elah-aura-label">Iniciar com ELAH</span>
                </Link>
                <p className="mt-2 hidden text-[11px] tracking-[0.12em] text-[#8f8779] md:block">
                  Aqui, sua voz encontra abrigo.
                </p>
              </div>
            </div>
          </section>

          <section className="hidden w-full flex-wrap gap-x-6 gap-y-3 text-zinc-100 md:flex lg:justify-end">
            {metrics.map((metric, index) => (
              <div
                key={metric.title}
                className={`${index > 0 ? "lg:border-l lg:border-[#8a6a45]/40 lg:pl-7" : ""}`}
              >
                <p className="text-[16px] leading-none font-semibold md:text-[21px]">
                  {metric.title}
                </p>
                <p className="mt-1.5 text-[11px] text-zinc-300/85 md:text-[14px]">
                  {metric.subtitle}
                </p>
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
