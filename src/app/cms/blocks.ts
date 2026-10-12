// The CMS content model, as TypeScript (≈ a Sanity schema + the generated types from `sanity typegen`).
// `_type` is the discriminant: TypeScript (and Angular's @switch) narrow a Block to the right shape by it.

export type Span = { text: string; mark?: 'strong' | 'em'; href?: string };

export type HeroBlock = { _type: 'hero'; _key: string; kicker: string; heading: string; intro: string; image: string };
export type RichTextBlock = { _type: 'richText'; _key: string; paragraphs: Span[][] };
export type StatsBlock = { _type: 'stats'; _key: string; items: { value: string; label: string }[]; source?: string };
export type QuoteBlock = { _type: 'quote'; _key: string; text: string; author: string; role?: string };
export type ChartBlock = { _type: 'chart'; _key: string; title: string; unit: string; bars: { label: string; value: number }[] };
export type CtaBlock = { _type: 'cta'; _key: string; heading: string; label: string; href: string };

export type Block = HeroBlock | RichTextBlock | StatsBlock | QuoteBlock | ChartBlock | CtaBlock;

export type CmsPage = { _id: string; slug: string; title: string; description: string; blocks: Block[] };
