"use client";

import { Marquee } from "@/components/ui/marquee";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DotPattern } from "@/components/ui/dot-pattern";
import { BlurFade } from "@/components/ui/blur-fade";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer",
    company: "Google",
    text: "Hyr completely transformed my job search. I went from zero callbacks to 5 interviews in two weeks. The ATS optimizer alone is worth it.",
    stars: 5,
  },
  {
    name: "Marcus Williams",
    role: "Product Manager",
    company: "Stripe",
    text: "The resume tailoring feature is magic. Every application I sent was perfectly matched to the job description. Landed my dream role!",
    stars: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Data Scientist",
    company: "Meta",
    text: "I was spending hours customizing resumes for each application. Hyr does it in seconds and the results are better than what I wrote manually.",
    stars: 5,
  },
  {
    name: "David Park",
    role: "Frontend Developer",
    company: "Vercel",
    text: "The auto-apply feature saved me so much time. I set my preferences and Hyr handled the rest. Got 3 offers in my first month.",
    stars: 5,
  },
  {
    name: "Priya Sharma",
    role: "ML Engineer",
    company: "OpenAI",
    text: "Best investment in my career. The ATS score went from 45% to 97% with Hyr's suggestions. Every job seeker needs this tool.",
    stars: 5,
  },
  {
    name: "James Liu",
    role: "DevOps Engineer",
    company: "Netflix",
    text: "Clean interface, smart suggestions, and it actually works. Went from struggling to get past ATS to receiving interview requests weekly.",
    stars: 5,
  },
  {
    name: "Aisha Patel",
    role: "UX Designer",
    company: "Figma",
    text: "As a designer, I appreciate how clean and polished Hyr's interface is. But more importantly, it helped me land a role at my dream company.",
    stars: 5,
  },
  {
    name: "Tom Anderson",
    role: "Backend Engineer",
    company: "Shopify",
    text: "The keyword matching is incredibly smart. It doesn't just stuff keywords — it naturally weaves them into your experience. Highly recommend!",
    stars: 5,
  },
];

function TestimonialCard({
  name,
  role,
  company,
  text,
  stars,
}: (typeof testimonials)[number]) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Card className="w-80 shrink-0 mx-3 border-border/40 bg-card/60 backdrop-blur-sm transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="p-6">
        <div className="mb-3 flex gap-0.5">
          {Array.from({ length: stars }).map((_, i) => (
            <Star
              key={i}
              className="h-4 w-4 fill-amber-400 text-amber-400"
            />
          ))}
        </div>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          &ldquo;{text}&rdquo;
        </p>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-primary/10">
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
    <section
      id="testimonials"
      className="relative overflow-hidden px-4 py-24 md:py-32"
    >
      {/* Dot pattern */}
      <DotPattern
        width={28}
        height={28}
        cr={0.6}
        className="opacity-15 dark:opacity-10 [mask-image:radial-gradient(ellipse_at_center,white_20%,transparent_70%)]"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-transparent to-muted/30" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <BlurFade inView>
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
              Testimonials
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Loved by job seekers
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                everywhere
              </span>
            </h2>
          </div>
        </BlurFade>

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
          <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent" />
        </div>
      </div>
    </section>
  );
}
