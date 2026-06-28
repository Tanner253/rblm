export type Meme = {
  slug: string;
  title: string;
  src: string;
  aspect: number;
};

export const memes: Meme[] = [
  { slug: "100x-vs-2x", title: "100x vs 2x", src: "/memes/photo_2026-06-27_10-47-00.jpg", aspect: 1 },
  { slug: "exit-liquidity", title: "Exit liquidity", src: "/memes/photo_2026-06-27_10-47-04.jpg", aspect: 1 },
  { slug: "until-millions", title: "Until millions", src: "/memes/photo_2026-06-27_10-47-07.jpg", aspect: 1 },
  { slug: "change-lives", title: "Change lives", src: "/memes/photo_2026-06-27_10-47-10.jpg", aspect: 1 },
  { slug: "generational-wealth", title: "Gen wealth", src: "/memes/photo_2026-06-27_10-47-15.jpg", aspect: 1 },
  { slug: "no-emotions", title: "No emotions", src: "/memes/photo_2026-06-27_10-47-18.jpg", aspect: 1 },
  { slug: "seven-figures", title: "7 figures", src: "/memes/photo_2026-06-27_10-47-20.jpg", aspect: 1 },
  { slug: "call-channel", title: "Call channel", src: "/memes/photo_2026-06-27_10-47-23.jpg", aspect: 1 },
  { slug: "whale-posted", title: "Whale posted", src: "/memes/photo_2026-06-27_10-47-25.jpg", aspect: 1 },
  { slug: "flex-vs-fold", title: "Flex vs fold", src: "/memes/larp.jpg", aspect: 1 },
  { slug: "dark-mode", title: "Dark mode", src: "/memes/tf.jpg", aspect: 1 },
  { slug: "quiet-typing", title: "Quiet typing", src: "/memes/lingiga.jpg", aspect: 1 },
  { slug: "wtf", title: "WTF", src: "/memes/wtf.jpg", aspect: 1 },
  { slug: "bag-sleeper", title: "Bag sleeper", src: "/memes/HL3og_VaQAANOCz.jpeg", aspect: 1 },
  { slug: "bond-and-dump", title: "Bond & dump", src: "/memes/HL1k5GpXsAAn-vq.jpeg", aspect: 1 },
  { slug: "internet-vs-irl", title: "Internet vs IRL", src: "/memes/HL1_zhRbAAASlFo.png", aspect: 1 },
  { slug: "real-deal", title: "Real deal", src: "/memes/HL27sCaa0AAY256.png", aspect: 1 },
  { slug: "asleep-by-8", title: "Asleep by 8", src: "/memes/HL3EzigWwAA5w4i.jpeg", aspect: 1 },
  { slug: "return-to-memes", title: "Return to memes", src: "/memes/HL7A_VzXgAAyJX_.jpeg", aspect: 1 },
  { slug: "fullstack-2x", title: "Fullstack at 2x", src: "/memes/HL6pvdBWEAA9Zhh.jpeg", aspect: 1 },
  { slug: "so-fucked", title: "So fucked", src: "/memes/HL7AsMfXcAAPBFH.jpeg", aspect: 1 },
  { slug: "careful-lil-bro", title: "Careful lil bro", src: "/memes/HL2gEuxasAAsi35.png", aspect: 1 },
  { slug: "dear-alon", title: "Dear Alon", src: "/memes/HL3CQkya0AAKNGu.png", aspect: 1 },
  { slug: "mcdonalds-bag", title: "McDonald's bag", src: "/memes/HL2VeUNXYAE1PWm.jpeg", aspect: 1 },
  { slug: "dad-owns-roblox", title: "Dad owns Roblox", src: "/memes/HL2Hzf_bIAAOyS3.png", aspect: 1 },
  { slug: "six-foot-one", title: "6 foot 1", src: "/memes/HL6LFRzbgAAmUWE.png", aspect: 1 },
  { slug: "crunch-you", title: "Crunch you", src: "/memes/HL2AXI3aUAAhJ5A.png", aspect: 1 },
  { slug: "sold-all-bags", title: "Sold all bags", src: "/memes/HL3B6qya0AAKvrT.png", aspect: 1 },
  { slug: "point-one-sol", title: ".1 SOL whale", src: "/memes/HL2FE_TbEAAAkmu.jpeg", aspect: 1 },
  { slug: "two-sol-port", title: "2 SOL port", src: "/memes/HL2RebiaIAAfhZY.png", aspect: 1 },
  { slug: "rugged-x3", title: "Rugged x3", src: "/memes/HL17YMsXYAACHSl.png", aspect: 1 },
  { slug: "starting-with-mine", title: "Starting with mine", src: "/memes/HL2219ubAAEX7mB.jpeg", aspect: 1 },
  { slug: "sold-at-1-2x", title: "Sold at 1.2x", src: "/memes/HL2QZ3Ba4AAoOAP.png", aspect: 1 },
  { slug: "paper-hands", title: "Paper hands", src: "/memes/HL2ZEaVbMAAmuXD.jpeg", aspect: 1 },
  { slug: "blank", title: "Blank", src: "/memes/rabbit-lion-mask.png", aspect: 1 },
];

/** Catalog order: newest first. Append new memes to `memes`; blank stays pinned last. */
export const catalogMemes: Meme[] = (() => {
  const pinned = memes.filter((m) => m.slug === "blank");
  const rest = memes.filter((m) => m.slug !== "blank");
  return [...rest].reverse().concat(pinned);
})();

export const TEMPLATE_SRC = "/templates/rabbit-lion-mask.png";

export const TEXT_PLACEHOLDERS = {
  top: "ME ON THE INTERNET",
  bottom: "ME IN REAL LIFE",
} as const;
