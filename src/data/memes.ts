export type Meme = {
  slug: string;
  title: string;
  src: string;
  caption?: string;
  /** width / height */
  aspect: number;
};

const memesChronological: Meme[] = [
  {
    slug: "rabbit-lion-mask",
    title: "Rabbit behind the lion mask",
    src: "/memes/rabbit-lion-mask.png",
    caption:
      "Me on Twitter vs me in real life.\n\nSmall rabbit. Big roar. $RBLM",
    aspect: 1,
  },
];

export const memes: Meme[] = [...memesChronological].reverse();

export const memeTemplates = [
  {
    slug: "rabbit-lion-mask",
    title: "Rabbit · Lion mask",
    src: "/templates/rabbit-lion-mask.png",
    aspect: 1,
    defaultLayers: [
      { text: "ME ON THE INTERNET", y: 8, scale: 0.085 },
      { text: "ME IN REAL LIFE", y: 92, scale: 0.075 },
    ],
  },
] as const;
