import { use } from "react";
import GalerieClient from "./GalerieClient";

// Required for static export
export function generateStaticParams() {
  return [];
}

export default function GaleriePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  return <GalerieClient eventId={eventId} />;
}
