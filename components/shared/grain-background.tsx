"use client";

import Grainient from "@/components/Grainient";

export function GrainBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 opacity-40">
      <Grainient
        color1="#7c3aed"
        color2="#1a1025"
        color3="#4c1d95"
        grainAmount={0.06}
        grainScale={3.0}
        grainAnimated={false}
        timeSpeed={0.1}
        contrast={1.2}
        saturation={0.8}
        warpStrength={1.0}
        warpFrequency={3.0}
        warpSpeed={0.5}
        warpAmplitude={80.0}
        rotationAmount={200.0}
        zoom={1.0}
      />
    </div>
  );
}
