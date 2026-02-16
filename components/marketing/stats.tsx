"use client";

import { motion } from "motion/react";
import { NumberTicker } from "@/components/ui/number-ticker";

const stats = [
  { value: 10000, suffix: "+", label: "Resumes Optimized" },
  { value: 95, suffix: "%", label: "ATS Pass Rate" },
  { value: 3, suffix: "x", label: "More Interviews" },
  { value: 50, suffix: "%", label: "Time Saved" },
];

export function Stats() {
  return (
    <section className="px-4 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Numbers that speak
            <br />
            <span className="text-primary">for themselves</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">
                <NumberTicker value={stat.value} />
                {stat.suffix}
              </div>
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
