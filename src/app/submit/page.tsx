import type { Metadata } from "next";
import SubmitForm from "@/components/SubmitForm";

export const metadata: Metadata = {
  title: "Komponente hochladen",
  description: "Teile deine eigene UI-Komponente mit der Elementa-Community.",
};

export default function SubmitPage() {
  return <SubmitForm />;
}
