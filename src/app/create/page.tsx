import type { Metadata } from "next";
import { MemeMakerPageShell } from "@/components/maker/MemeMaker";

export const metadata: Metadata = {
  title: "Meme Maker — RBLM",
  description: "Make your own rabbit-lion meme. Drag text, copy or download.",
};

export default function CreatePage() {
  return <MemeMakerPageShell />;
}
