"use client";

import { motion } from "motion/react";
import { Marquee } from "@/components/ui/marquee";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer",
    company: "Google",
    text: "Hyr completely transformed my job search. I went from zero callbacks to 5 interviews in two weeks. The ATS optimizer alone is worth it.",
  },
  {
    name: "Marcus Williams",
    role: "Product Manager",
    company: "Stripe",
    text: "The resume tailoring feature is magic. Every application I sent was perfectly matched to the job description. Landed my dream role!",
  },
  {
    name: "Emily Rodriguez",
    role: "Data Scientist",
    company: "Meta",
    text: "I was spending hours customizing resumes for each application. Hyr does it in seconds and the results are better than what I wrote manually.",
  },
  {
    name: "David Park",
    role: "Frontend Developer",
    company: "Vercel",
    text: "The auto-apply feature saved me so much time. I set my preferences and Hyr handled the rest. Got 3 offers in my first month.",
  },
  {
    name: "Priya Sharma",
    role: "ML Engineer",
    company: "OpenAI",
    text: "Best investment in my career. The ATS score went from 45% to 97% with Hyr's suggestions. Every job seeker needs this tool.",
  },
  {
    name: "James Liu",
    role: "DevOps Engineer",
    company: "Netflix",
    text: "Clean interface, smart suggestions, and it actually works. Went from struggling to get past ATS to receiving interview requests weekly.",
  },
  {
    name: "Aisha Patel",
    role: "UX Designer",
    company: "Figma",
    text: "As a designer, I appreciate how clean and polished Hyr's interface is. But more importantly, it helped me land a role at my dream company.",
  },
  {
    name: "Tom Anderson",
    role: "Backend Engineer",
    company: "Shopify",
    text: "The keyword matching is incredibly smart. It doesn't just stuff keywords — it naturally weaves them into your experience. Highly recommend!",
  },
];

function TestimonialCard({
  name,
  role,
  company,
  text,
}: (typeof testimonials)[number]) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Card className="w-80 shrink-0 mx-3 border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          &ldquo;{text}&rdquo;
        </p>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">{name}</p>
            <p className="text-xs text-muted-foreground">
              {role} at {company}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-muted/30 px-4 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            Testimonials
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Loved by job seekers
            <br />
            <span className="text-primary">everywhere</span>
          </h2>
        </motion.div>

        <div className="relative">
          <Marquee pauseOnHover className="[--duration:40s]">
            {testimonials.slice(0, 4).map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </Marquee>
          <Marquee reverse pauseOnHover className="mt-4 [--duration:45s]">
            {testimonials.slice(4).map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </Marquee>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
        </div>
      </div>
    </section>
  );
}
