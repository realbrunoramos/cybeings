import { Hero } from "@/components/hero/Hero";

const layers = [
  {
    index: "01",
    title: "Identity",
    desc: "Each Cybeing is generated from a unique seed — its look, personality, and on-chain rarity are reproducible and one of a kind.",
  },
  {
    index: "02",
    title: "Ability",
    desc: "Every Cybeing carries one real functional ability — writing, code, analysis, translation, and more. Value comes from skill, not looks.",
  },
  {
    index: "03",
    title: "Economy",
    desc: "Rent, trade, breed, and stake your Cybeings in tournaments. Settle them on islands across an infinite world map.",
  },
  {
    index: "04",
    title: "Community",
    desc: "Form guilds, climb leaderboards, and compete in weekly and monthly tournaments judged by AI and the community.",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />

      <section id="abilities" className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--cyan)]">
            <span className="h-px w-6 bg-[var(--cyan)]" />
            The four layers
          </div>
          <h2 className="mb-14 max-w-2xl font-display text-3xl font-extrabold tracking-[-0.03em] md:text-4xl">
            Not an NFT. Not a game. Not a tool. All three.
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {layers.map((layer) => (
              <article key={layer.index} className="layer-card">
                <div className="mb-4 font-mono text-xs tracking-widest text-[var(--text-3)]">
                  {layer.index}
                </div>
                <h3 className="mb-3 font-display text-lg font-bold text-[var(--text-1)]">
                  {layer.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--text-2)]">
                  {layer.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 font-mono text-[11px] uppercase tracking-wider text-[var(--text-3)] sm:flex-row">
          <span className="text-gradient font-display text-sm font-extrabold normal-case tracking-tight">
            Cybeings
          </span>
          <span>Phase 0 · Foundations · 2026</span>
        </div>
      </footer>
    </>
  );
}
