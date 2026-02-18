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
        {/* ── All background artwork in a single tiny Canvas ──
             Uses 1x1 declared size to avoid layout overflow (blank page bug).
             PDFKit painter draws on absolute page coordinates regardless. */}
        <Canvas
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1,
            height: 1,
          }}
          paint={(painter: any): null => {
            painter.save();

            // ── Full-page dithered dot background ──
            const bgRng = seededRng(ditherSeed || "default-seed");
            // Small scattered dots across the page
            for (let i = 0; i < 500; i++) {
              const x = bgRng() * PAGE_W;
              const y = bgRng() * PAGE_H;
              const r = 0.4 + bgRng() * 0.8;
              const opacity = 0.04 + bgRng() * 0.06;
              painter
                .circle(x, y, r)
                .fillColor(c.accent)
                .fillOpacity(opacity)
                .fill();
            }
            // Larger accent dots (fewer, more visible)
            for (let i = 0; i < 60; i++) {
              const x = bgRng() * PAGE_W;
              const y = bgRng() * PAGE_H;
              const r = 1.0 + bgRng() * 1.5;
              const opacity = 0.03 + bgRng() * 0.04;
              painter
                .circle(x, y, r)
                .fillColor(c.accent)
                .fillOpacity(opacity)
                .fill();
            }

            // ── Top-right corner: grid + crosses + dots with smooth fade ──
            const STEP = 14;
            const trX = PAGE_W - DECO_W; // offset to top-right

            const fadeTR = (x: number, y: number) => {
              const dx = (PAGE_W - x) / DECO_W;
              const dy = y / DECO_H;
              return Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) * 1.1);
            };

            // Vertical grid lines
            painter.lineWidth(0.5);
            for (let lx = 0; lx <= DECO_W; lx += STEP) {
              for (let ly = 0; ly < DECO_H; ly += STEP) {
                const ax = trX + lx;
                const op = fadeTR(ax, ly + STEP / 2) * 0.18;
                if (op > 0.001) {
                  painter.moveTo(ax, ly).lineTo(ax, Math.min(ly + STEP, DECO_H))
                    .strokeColor(c.accent).strokeOpacity(op).stroke();
                }
              }
            }
            // Horizontal grid lines
            for (let ly = 0; ly <= DECO_H; ly += STEP) {
              for (let lx = 0; lx < DECO_W; lx += STEP) {
                const ax = trX + lx;
                const op = fadeTR(ax + STEP / 2, ly) * 0.18;
                if (op > 0.001) {
                  painter.moveTo(ax, ly).lineTo(Math.min(ax + STEP, PAGE_W), ly)
                    .strokeColor(c.accent).strokeOpacity(op).stroke();
                }
              }
            }

            // Cross markers
            const crosses = [
              [2, 2], [5, 1], [8, 3], [10, 1], [4, 5], [7, 6], [12, 2],
              [3, 3], [9, 5], [11, 4], [6, 2],
            ];
            painter.lineWidth(0.8);
            for (const [cx, cy] of crosses) {
              const ax = trX + cx * STEP;
              const ay = cy * STEP;
              const op = fadeTR(ax, ay) * 0.4;
              if (op > 0.005) {
                painter.moveTo(ax - 3.5, ay).lineTo(ax + 3.5, ay)
                  .strokeColor(c.accent).strokeOpacity(op).stroke();
                painter.moveTo(ax, ay - 3.5).lineTo(ax, ay + 3.5)
                  .strokeColor(c.accent).strokeOpacity(op).stroke();
              }
            }

            // Seeded accent dots (top-right)
            if (ditherSeed) {
              const trRng = seededRng(ditherSeed);
              for (let i = 0; i < 40; i++) {
                const x = trX + trRng() * DECO_W;
                const y = trRng() * DECO_H;
                const r = 0.8 + trRng() * 1.8;
                const op = fadeTR(x, y) * 0.35;
                if (op > 0.005) {
                  painter.circle(x, y, r)
                    .fillColor(c.accent).fillOpacity(op).fill();
                }
              }
            }

            // ── Bottom-left corner: smaller, subtler mirror ──
            const blY = PAGE_H - DECO_BL_H;

            const fadeBL = (x: number, y: number) => {
              const dx = x / DECO_BL_W;
              const dy = (PAGE_H - y) / DECO_BL_H;
              return Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) * 1.2) * 0.6;
            };

            painter.lineWidth(0.4);
            for (let lx = 0; lx <= DECO_BL_W; lx += STEP) {
              for (let ly = 0; ly < DECO_BL_H; ly += STEP) {
                const ay = blY + ly;
                const op = fadeBL(lx, ay + STEP / 2) * 0.15;
                if (op > 0.001) {
                  painter.moveTo(lx, ay).lineTo(lx, Math.min(ay + STEP, PAGE_H))
                    .strokeColor(c.accent).strokeOpacity(op).stroke();
                }
              }
            }
            for (let ly = 0; ly <= DECO_BL_H; ly += STEP) {
              for (let lx = 0; lx < DECO_BL_W; lx += STEP) {
                const ay = blY + ly;
                const op = fadeBL(lx + STEP / 2, ay) * 0.15;
                if (op > 0.001) {
                  painter.moveTo(lx, ay).lineTo(Math.min(lx + STEP, DECO_BL_W), ay)
                    .strokeColor(c.accent).strokeOpacity(op).stroke();
                }
              }
            }

            // Bottom-left seeded dots
            if (ditherSeed) {
              const blRng = seededRng(ditherSeed + "-bl");
              for (let i = 0; i < 20; i++) {
                const x = blRng() * DECO_BL_W;
                const y = blY + blRng() * DECO_BL_H;
                const r = 0.6 + blRng() * 1.2;
                const op = fadeBL(x, y) * 0.28;
                if (op > 0.003) {
                  painter.circle(x, y, r)
                    .fillColor(c.accent).fillOpacity(op).fill();
                }
              }
            }

            painter.restore();
            return null;
          }}
        />

        {/* ── Dither image watermark (if uploaded) ── */}
        {ditherImage && (
          <Image
            src={ditherImage}
            style={{
              position: "absolute",
              top: 20,
              right: 36,
              width: 100,
              height: 100,
              opacity: 0.08,
            }}
          />
        )}

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
