import type { Metadata } from "next";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "About",
  description: "What tro is and why it exists.",
};

export default function AboutPage() {
  return <AboutContent />;
}
