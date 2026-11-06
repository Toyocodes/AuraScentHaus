const PILLARS = [
  { title: "Rare ingredients", body: "Agarwood, Turkish rose and sandalwood, chosen for depth and lasting power." },
  { title: "Made to linger", body: "Scent for you and your home, composed to stay with you through the day." },
  { title: "Effortless shopping", body: "Sign in with just your email. Your bag follows you on every device." },
] as const;

/** Dark espresso band with the brand promise. */
export function BrandStory() {
  return (
    <section className="bg-espresso text-espresso-foreground">
      <div className="container-page grid gap-14 py-24 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
        <div className="space-y-6">
          <p className="eyebrow text-gold">Our philosophy</p>
          <h2 className="text-4xl leading-tight md:text-6xl">
            A fragrance should whisper, <em className="text-gold">never shout.</em>
          </h2>
        </div>
        <div className="grid gap-10 sm:grid-cols-3 lg:gap-8">
          {PILLARS.map((p, i) => (
            <div key={p.title} className="space-y-3 border-t border-espresso-foreground/15 pt-6">
              <p className="font-heading text-3xl text-gold">0{i + 1}</p>
              <h3 className="text-xl">{p.title}</h3>
              <p className="text-sm leading-relaxed text-espresso-foreground/70">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
