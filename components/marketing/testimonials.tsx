"use client";

import { Marquee } from "@/components/ui/marquee";
import { BlurFade } from "@/components/ui/blur-fade";
import { Star, Quote } from "lucide-react";

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
    <figure className="relative w-72 shrink-0 mx-2 rounded-2xl border border-border/40 bg-card p-5 transition-all duration-300 hover:border-border hover:shadow-md">
      <Quote className="absolute top-4 right-4 h-5 w-5 text-primary/10" />
      <div className="mb-3 flex gap-0.5">
        {Array.from({ length: stars }).map((_, i) => (
          <Star
            key={i}
            className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
          />
        ))}
      </div>
      <blockquote className="mb-4 text-sm leading-relaxed text-muted-foreground">
        {text}
      </blockquote>
      <figcaption className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">{name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {role}, {company}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative overflow-hidden py-24 md:py-32"
    >
      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <BlurFade inView>
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
              Testimonials
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Loved by job seekers
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Join thousands of professionals who landed their dream roles with Hyr.
            </p>
          </div>
        </BlurFade>

        <div className="relative">
          <Marquee pauseOnHover className="[--duration:40s]">
            {testimonials.slice(0, 4).map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </Marquee>
          <Marquee reverse pauseOnHover className="mt-3 [--duration:45s]">
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
