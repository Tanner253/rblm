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
  { slug: "blank", title: "Blank", src: "/memes/rabbit-lion-mask.png", aspect: 1 },
];

export const TEMPLATE_SRC = "/templates/rabbit-lion-mask.png";

export const TEXT_PLACEHOLDERS = {
  top: "ME ON THE INTERNET",
  bottom: "ME IN REAL LIFE",
} as const;
