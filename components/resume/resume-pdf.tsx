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

// Corner mark constants
const INSET = 16;
const MARK_LEN = 20;

// ── Section heading with accent bar ──
function SectionHeading({
  title,
  mono,
  first = false,
}: {
  title: string;
  mono: string;
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
            fontFamily: mono,
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
  mono,
  isFirst,
}: {
  icon: React.ReactNode;
  text: string;
  mono: string;
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
      <Text style={{ fontSize: 8.5, color: c.muted, fontFamily: mono }}>
        {text}
      </Text>
    </View>
  );
}

// ── Main Component ──
interface ResumePDFProps {
  resume: Resume;
  fontFamily?: string;
  monoFamily?: string;
  ditherImage?: string;
  birdImage?: string;
}

export function ResumePDF({
  resume,
  fontFamily = "Helvetica",
  monoFamily,
  ditherImage,
  birdImage,
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
        {/* ── Corner border marks (L-shaped registration marks) ──
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
            painter.lineWidth(0.4).strokeColor(c.border).strokeOpacity(0.5);

            // Top-left corner
            painter.moveTo(INSET, INSET).lineTo(INSET + MARK_LEN, INSET).stroke();
            painter.moveTo(INSET, INSET).lineTo(INSET, INSET + MARK_LEN).stroke();

            // Top-right corner
            painter.moveTo(PAGE_W - INSET, INSET).lineTo(PAGE_W - INSET - MARK_LEN, INSET).stroke();
            painter.moveTo(PAGE_W - INSET, INSET).lineTo(PAGE_W - INSET, INSET + MARK_LEN).stroke();

            // Bottom-left corner
            painter.moveTo(INSET, PAGE_H - INSET).lineTo(INSET + MARK_LEN, PAGE_H - INSET).stroke();
            painter.moveTo(INSET, PAGE_H - INSET).lineTo(INSET, PAGE_H - INSET - MARK_LEN).stroke();

            // Bottom-right corner
            painter.moveTo(PAGE_W - INSET, PAGE_H - INSET).lineTo(PAGE_W - INSET - MARK_LEN, PAGE_H - INSET).stroke();
            painter.moveTo(PAGE_W - INSET, PAGE_H - INSET).lineTo(PAGE_W - INSET, PAGE_H - INSET - MARK_LEN).stroke();

            painter.restore();
            return null;
          }}
        />

        {/* ── Dithered bird watermark ── */}
        {birdImage && (
          <Image
            src={birdImage}
            style={{
              position: "absolute",
              bottom: 28,
              right: 36,
              width: 64,
              height: 64,
              opacity: 0.1,
            }}
          />
        )}

        {/* ── Dither image watermark (user-uploaded photo) ── */}
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

          {/* Contact row with icons (mono font) */}
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
                mono={mono}
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
              mono={mono}
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
              mono={mono}
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
              mono={mono}
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

                {/* School + Location + GPA (italic, GPA in mono) */}
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
                  {edu.gpa ? "  \u00B7  GPA: " : ""}
                  {edu.gpa && (
                    <Text style={{ fontFamily: mono }}>{edu.gpa}</Text>
                  )}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Skills (mono font) ── */}
        {hasSkills && (
          <View style={{ marginBottom: 6 }}>
            <SectionHeading
              title="Skills"
              mono={mono}
              first={firstSection === "skills"}
            />
            <Text
              style={{
                fontSize: 9,
                fontFamily: mono,
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
              mono={mono}
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
