"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "fluid";
  style?: React.CSSProperties;
}

export function AdUnit({ slot, format = "auto", style }: Props) {
  const adRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || process.env.NODE_ENV !== "production") return;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {}
  }, [mounted, slot]);

  if (!mounted || process.env.NODE_ENV !== "production") {
    return (
      <div style={{
        background: "var(--surface-2)", border: "1px dashed var(--border)",
        borderRadius: 10, padding: "14px 16px", textAlign: "center",
        fontSize: 11, color: "var(--text-tertiary)", fontWeight: 600,
        minHeight: format === "horizontal" ? 90 : 100,
        display: "flex", alignItems: "center", justifyContent: "center",
        ...style,
      }}>
        AD · {slot}
      </div>
    );
  }

  return (
    <div ref={adRef} style={{ minHeight: format === "horizontal" ? 90 : 100, overflow: "hidden", ...style }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
