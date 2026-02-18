import {
  Document,
  Page,
  Text,
  View,
  Image,
  Canvas,
} from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";
import type { Resume } from "@/lib/resume/types";
import {
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  LinkedInIcon,
  GlobeIcon,
} from "./pdf-icons";

// ── Tailwind-like styling (following Invoicely pattern) ──
const tw = createTw({
  theme: {
    fontFamily: {
      sans: ["Geist"],
      mono: ["GeistMono"],
    },
    extend: {
      colors: {
        black: "#0a0a0a",
        dark: "#171717",
        muted: "#525252",
        light: "#a3a3a3",
        border: "#e5e5e5",
        accent: "#4f46e5",
      },
      fontSize: {
        "2xs": "0.625rem",
        "3xs": "0.5rem",
      },
    },
  },
});

// ── Color palette (for Canvas paint functions) ──
const c = {
  black: "#0a0a0a",
  dark: "#171717",
  muted: "#525252",
  light: "#a3a3a3",
  border: "#e5e5e5",
  accent: "#4f46e5",
};

// LETTER page = 612 x 792 pt
const PAGE_W = 612;
const PAGE_H = 792;

// ── Seeded RNG for deterministic dot placement ──
function seededRng(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++)
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return () => {
    h = ((h ^ (h >>> 16)) * 0x45d9f3b) | 0;
    h = ((h ^ (h >>> 16)) * 0x45d9f3b) | 0;
    h = h ^ (h >>> 16);
    return (h >>> 0) / 0xffffffff;
  };
}

// ── Section heading with accent bar ──
function SectionHeading({
  title,
  first = false,
}: {
  title: string;
  first?: boolean;
}) {
  return (
    <>
      {!first && (
        <View
          style={{
            height: 0.5,
            backgroundColor: c.border,
            marginBottom: 5,
          }}
        />
      )}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 3,
        }}
      >
        <View
          style={{
            width: 14,
            height: 1.5,
            backgroundColor: c.accent,
            marginRight: 5,
            opacity: 0.85,
          }}
        />
        <Text
          style={{
            fontSize: 8.5,
            fontWeight: 700,
            color: c.light,
            letterSpacing: 1.2,
            textTransform: "uppercase",
          }}
        >
          {title}
        </Text>
      </View>
    </>
  );
}

// ── Contact item with icon ──
function ContactItem({
  icon,
  text,
  isFirst,
}: {
  icon: React.ReactNode;
  text: string;
  isFirst?: boolean;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {!isFirst && (
        <Text
          style={{
            fontSize: 8,
            color: c.light,
            marginHorizontal: 4,
          }}
        >
          {"\u00B7"}
        </Text>
      )}
      <View style={{ marginRight: 2 }}>{icon}</View>
      <Text style={{ fontSize: 8.5, color: c.muted }}>{text}</Text>
    </View>
  );
}

// ── Main Component ──
interface ResumePDFProps {
  resume: Resume;
  fontFamily?: string;
  monoFamily?: string;
  ditherImage?: string;
  ditherSeed?: string;
}

export function ResumePDF({
  resume,
  fontFamily = "Helvetica",
  monoFamily,
  ditherImage,
  ditherSeed,
}: ResumePDFProps) {
  const mono = monoFamily ?? fontFamily;

  const hasSummary = Boolean(resume.summary);
  const hasExp = resume.experience.length > 0;
  const hasEdu = resume.education.length > 0;
  const hasSkills = resume.skills.length > 0;
  const hasCerts = resume.certifications.length > 0;

  let firstSection:
    | "summary"
    | "experience"
    | "education"
    | "skills"
    | "certs"
    | null = null;
  if (hasSummary) firstSection = "summary";
  else if (hasExp) firstSection = "experience";
  else if (hasEdu) firstSection = "education";
  else if (hasSkills) firstSection = "skills";
  else if (hasCerts) firstSection = "certs";

  // Corner decoration dimensions
  const DECO_W = 200;
  const DECO_H = 180;
  // Bottom-left decoration (smaller, subtler)
  const DECO_BL_W = 120;
  const DECO_BL_H = 100;

  // Contact items with icons
  const iconSize = 7.5;
  const iconColor = c.accent;

  const contactEntries: { icon: React.ReactNode; text: string }[] = [
    {
      icon: <MailIcon size={iconSize} color={iconColor} />,
      text: resume.contact.email,
    },
    {
      icon: <PhoneIcon size={iconSize} color={iconColor} />,
      text: resume.contact.phone,
    },
    {
      icon: <MapPinIcon size={iconSize} color={iconColor} />,
      text: resume.contact.location,
    },
    ...(resume.contact.linkedin
      ? [
          {
            icon: <LinkedInIcon size={iconSize} color={iconColor} />,
            text: resume.contact.linkedin,
          },
        ]
      : []),
    ...(resume.contact.website
      ? [
          {
            icon: <GlobeIcon size={iconSize} color={iconColor} />,
            text: resume.contact.website,
          },
        ]
      : []),
  ];

  return (
    <Document>
      <Page
        size="LETTER"
        style={{
          paddingTop: 28,
          paddingBottom: 28,
          paddingHorizontal: 36,
          fontSize: 9,
          color: c.dark,
          lineHeight: 1.3,
          backgroundColor: "#ffffff",
          fontFamily,
        }}
      >
        {/* ── Layer 0: Full-page dithered dot background ── */}
        <Canvas
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: PAGE_W,
            height: PAGE_H,
          }}
          paint={(painter: any): null => {
            const rng = seededRng(ditherSeed || "default-seed");
            const DOT_COUNT = 600;

            painter.save();
            for (let i = 0; i < DOT_COUNT; i++) {
              const x = rng() * PAGE_W;
              const y = rng() * PAGE_H;
              const r = 0.3 + rng() * 0.5;
              const opacity = 0.015 + rng() * 0.025;

              painter
                .circle(x, y, r)
                .fillColor(c.accent)
                .fillOpacity(opacity)
                .fill();
            }
            painter.restore();
            return null;
          }}
        />

        {/* ── Layer 1: Dither image watermark (larger, more subtle) ── */}
        {ditherImage && (
          <Image
            src={ditherImage}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 200,
              height: 200,
              opacity: 0.04,
            }}
          />
        )}

        {/* ── Layer 2: Top-right corner decoration with gradient fade ── */}
        <Canvas
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: DECO_W,
            height: DECO_H,
          }}
          paint={(painter: any): null => {
            const STEP = 14;
            painter.save();

            // Fade function: opacity decreases with distance from top-right corner
            const fade = (x: number, y: number) => {
              const dx = (DECO_W - x) / DECO_W;
              const dy = y / DECO_H;
              const dist = Math.sqrt(dx * dx + dy * dy);
              return Math.max(0, 1 - dist * 1.2);
            };

            // Grid lines with per-segment fading
            painter.lineWidth(0.35);
            for (let x = 0; x <= DECO_W; x += STEP) {
              for (let y = 0; y < DECO_H; y += STEP) {
                const opacity = fade(x, y + STEP / 2) * 0.07;
                if (opacity > 0.001) {
                  painter
                    .moveTo(x, y)
                    .lineTo(x, Math.min(y + STEP, DECO_H))
                    .strokeColor(c.accent)
                    .strokeOpacity(opacity)
                    .stroke();
                }
              }
            }
            for (let y = 0; y <= DECO_H; y += STEP) {
              for (let x = 0; x < DECO_W; x += STEP) {
                const opacity = fade(x + STEP / 2, y) * 0.07;
                if (opacity > 0.001) {
                  painter
                    .moveTo(x, y)
                    .lineTo(Math.min(x + STEP, DECO_W), y)
                    .strokeColor(c.accent)
                    .strokeOpacity(opacity)
                    .stroke();
                }
              }
            }

            // Cross markers with fading
            const crosses = [
              [STEP * 2, STEP * 2],
              [STEP * 5, STEP * 1],
              [STEP * 8, STEP * 3],
              [STEP * 10, STEP * 1],
              [STEP * 4, STEP * 5],
              [STEP * 7, STEP * 6],
              [STEP * 12, STEP * 2],
            ];
            painter.lineWidth(0.6);
            for (const [cx, cy] of crosses) {
              const opacity = fade(cx, cy) * 0.2;
              if (opacity > 0.005) {
                painter
                  .moveTo(cx - 3, cy)
                  .lineTo(cx + 3, cy)
                  .strokeColor(c.accent)
                  .strokeOpacity(opacity)
                  .stroke();
                painter
                  .moveTo(cx, cy - 3)
                  .lineTo(cx, cy + 3)
                  .strokeColor(c.accent)
                  .strokeOpacity(opacity)
                  .stroke();
              }
            }

            // Seeded dots with fading
            if (ditherSeed) {
              const rng = seededRng(ditherSeed);
              for (let i = 0; i < 20; i++) {
                const x = rng() * DECO_W;
                const y = rng() * DECO_H;
                const r = 0.6 + rng() * 1.0;
                const opacity = fade(x, y) * 0.15;
                if (opacity > 0.005) {
                  painter
                    .circle(x, y, r)
                    .fillColor(c.accent)
                    .fillOpacity(opacity)
                    .fill();
                }
              }
            }

            painter.restore();
            return null;
          }}
        />

        {/* ── Layer 3: Bottom-left corner decoration (subtle mirror) ── */}
        <Canvas
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: DECO_BL_W,
            height: DECO_BL_H,
          }}
          paint={(painter: any): null => {
            const STEP = 14;
            painter.save();

            // Fade from bottom-left corner (0, DECO_BL_H)
            const fade = (x: number, y: number) => {
              const dx = x / DECO_BL_W;
              const dy = (DECO_BL_H - y) / DECO_BL_H;
              const dist = Math.sqrt(dx * dx + dy * dy);
              return Math.max(0, 1 - dist * 1.3) * 0.5; // Half opacity scale
            };

            // Grid lines
            painter.lineWidth(0.3);
            for (let x = 0; x <= DECO_BL_W; x += STEP) {
              for (let y = 0; y < DECO_BL_H; y += STEP) {
                const opacity = fade(x, y + STEP / 2) * 0.07;
                if (opacity > 0.001) {
                  painter
                    .moveTo(x, y)
                    .lineTo(x, Math.min(y + STEP, DECO_BL_H))
                    .strokeColor(c.accent)
                    .strokeOpacity(opacity)
                    .stroke();
                }
              }
            }
            for (let y = 0; y <= DECO_BL_H; y += STEP) {
              for (let x = 0; x < DECO_BL_W; x += STEP) {
                const opacity = fade(x + STEP / 2, y) * 0.07;
                if (opacity > 0.001) {
                  painter
                    .moveTo(x, y)
                    .lineTo(Math.min(x + STEP, DECO_BL_W), y)
                    .strokeColor(c.accent)
                    .strokeOpacity(opacity)
                    .stroke();
                }
              }
            }

            // A few seeded dots
            if (ditherSeed) {
              const rng = seededRng(ditherSeed + "-bl");
              for (let i = 0; i < 10; i++) {
                const x = rng() * DECO_BL_W;
                const y = rng() * DECO_BL_H;
                const r = 0.5 + rng() * 0.8;
                const opacity = fade(x, y) * 0.12;
                if (opacity > 0.003) {
                  painter
                    .circle(x, y, r)
                    .fillColor(c.accent)
                    .fillOpacity(opacity)
                    .fill();
                }
              }
            }

            painter.restore();
            return null;
          }}
        />

        {/* ── Header ── */}
        <View style={{ marginBottom: 6 }}>
          {/* Name */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: c.black,
              lineHeight: 1.2,
              marginBottom: 3,
            }}
          >
            {resume.contact.name}
          </Text>

          {/* Job title (italic, compact) */}
          {resume.experience[0]?.title && (
            <Text
              style={{
                fontSize: 10,
                fontWeight: 400,
                fontStyle: "italic",
                color: c.muted,
                lineHeight: 1.3,
                marginBottom: 5,
              }}
            >
              {resume.experience[0].title}
            </Text>
          )}

          {/* Contact row with icons */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {contactEntries.map((entry, i) => (
              <ContactItem
                key={i}
                icon={entry.icon}
                text={entry.text}
                isFirst={i === 0}
              />
            ))}
          </View>
        </View>

        {/* ── Header rule ── */}
        <View
          style={{
            height: 0.75,
            backgroundColor: c.border,
            marginTop: 6,
            marginBottom: 8,
          }}
        />

        {/* ── Summary ── */}
        {hasSummary && (
          <View style={{ marginBottom: 6 }}>
            <SectionHeading
              title="Summary"
              first={firstSection === "summary"}
            />
            <Text
              style={{
                fontSize: 9,
                color: c.muted,
                lineHeight: 1.4,
              }}
            >
              {resume.summary}
            </Text>
          </View>
        )}

        {/* ── Experience ── */}
        {hasExp && (
          <View style={{ marginBottom: 6 }}>
            <SectionHeading
              title="Experience"
              first={firstSection === "experience"}
            />
            {resume.experience.map((exp) => (
              <View
                key={exp.id}
                style={{ marginBottom: 4 }}
                wrap={false}
              >
                {/* Title + Dates on same line */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 0.5,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: c.black,
                    }}
                  >
                    {exp.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 9,
                      fontStyle: "italic",
                      color: c.light,
                      fontFamily: mono,
                    }}
                  >
                    {exp.startDate}
                    {" \u2013 "}
                    {exp.endDate}
                  </Text>
                </View>

                {/* Company + Location (italic) */}
                <Text
                  style={{
                    fontSize: 9,
                    fontStyle: "italic",
                    color: c.muted,
                    marginBottom: 2,
                  }}
                >
                  {exp.company}
                  {" \u00B7 "}
                  {exp.location}
                </Text>

                {/* Bullet points */}
                {exp.bullets.map((b, i) => (
                  <View
                    key={i}
                    style={{
                      flexDirection: "row",
                      marginBottom: 1.5,
                    }}
                  >
                    <Text
                      style={{
                        width: 10,
                        fontSize: 9,
                        color: c.light,
                        marginTop: 0.5,
                      }}
                    >
                      {"\u2013"}
                    </Text>
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 9,
                        lineHeight: 1.35,
                        color: c.muted,
                      }}
                    >
                      {b}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* ── Education ── */}
        {hasEdu && (
          <View style={{ marginBottom: 6 }}>
            <SectionHeading
              title="Education"
              first={firstSection === "education"}
            />
            {resume.education.map((edu) => (
              <View
                key={edu.id}
                style={{ marginBottom: 3 }}
                wrap={false}
              >
                {/* Degree + Date on same line */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: c.black,
                    }}
                  >
                    {edu.degree}
                  </Text>
                  <Text
                    style={{
                      fontSize: 9,
                      fontStyle: "italic",
                      color: c.light,
                      fontFamily: mono,
                    }}
                  >
                    {edu.graduationDate}
                  </Text>
                </View>

                {/* School + Location (italic) */}
                <Text
                  style={{
                    fontSize: 9,
                    fontStyle: "italic",
                    color: c.muted,
                  }}
                >
                  {edu.school}
                  {" \u00B7 "}
                  {edu.location}
                  {edu.gpa ? `  \u00B7  GPA: ${edu.gpa}` : ""}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Skills ── */}
        {hasSkills && (
          <View style={{ marginBottom: 6 }}>
            <SectionHeading
              title="Skills"
              first={firstSection === "skills"}
            />
            <Text
              style={{
                fontSize: 9,
                color: c.muted,
                lineHeight: 1.35,
              }}
            >
              {resume.skills.join(", ")}
            </Text>
          </View>
        )}

        {/* ── Certifications ── */}
        {hasCerts && (
          <View style={{ marginBottom: 6 }}>
            <SectionHeading
              title="Certifications"
              first={firstSection === "certs"}
            />
            {resume.certifications.map((cert, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  marginBottom: 2,
                }}
              >
                <Text
                  style={{
                    width: 10,
                    fontSize: 9,
                    color: c.light,
                    marginTop: 0.5,
                  }}
                >
                  {"\u2013"}
                </Text>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 9,
                    lineHeight: 1.35,
                    color: c.muted,
                  }}
                >
                  {cert}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
