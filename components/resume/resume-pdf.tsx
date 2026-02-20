import {
  Document,
  Page,
  Text,
  View,
  Image,
  Canvas,
} from "@react-pdf/renderer";
import type { Resume } from "@/lib/resume/types";
import {
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  LinkedInIcon,
  GlobeIcon,
} from "./pdf-icons";

interface PdfPainter {
  save: () => void;
  restore: () => void;
  lineWidth: (width: number) => PdfPainter;
  strokeColor: (color: string) => PdfPainter;
  strokeOpacity: (opacity: number) => PdfPainter;
  fillColor: (color: string) => PdfPainter;
  fillOpacity: (opacity: number) => PdfPainter;
  rect: (x: number, y: number, width: number, height: number) => PdfPainter;
  moveTo: (x: number, y: number) => PdfPainter;
  lineTo: (x: number, y: number) => PdfPainter;
  stroke: () => PdfPainter;
  fill: () => PdfPainter;
}

// ── Color palette (for Canvas paint functions) ──
const c = {
  black: "#0a0a0a",
  dark: "#171717",
  muted: "#525252",
  light: "#a3a3a3",
  border: "#e5e5e5",
  softBorder: "#d4d4d8",
  accent: "#4f46e5",
};

// LETTER page = 612 x 792 pt
const PAGE_W = 612;
const PAGE_H = 792;

// Corner mark constants
const INSET = 16;
const MARK_LEN = 20;
const SQUARE_SIZE = 6; // filled corner square size
const SQUARE_OFFSET = 2;

// Top-right decoration grid
const DECO_W = 200;
const DECO_H = 180;
const GRID_STEP = 14;

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
             Uses 1x1 declared size to avoid layout overflow.
             fixed={true} keeps it out of the page-break algorithm — without it,
             react-pdf's Canvas + NON_WRAP_TYPES combination causes an infinite
             layout loop when content overflows to a second page. */}
        <Canvas
          fixed
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1,
            height: 1,
          }}
          paint={(painter: PdfPainter): null => {
            painter.save();

            const x0 = INSET;
            const y0 = INSET;
            const x1 = PAGE_W - INSET;
            const y1 = PAGE_H - INSET;

            // ── 1. Full page border (light) ──
            painter.lineWidth(0.45).strokeColor(c.softBorder).strokeOpacity(0.26);
            painter.rect(x0, y0, x1 - x0, y1 - y0).stroke();

            // ── 2. Darker corner L-marks (overdraw on top of light border) ──
            painter.lineWidth(0.65).strokeColor(c.dark).strokeOpacity(0.32);

            const tlx = x0 + SQUARE_OFFSET;
            const tly = y0 + SQUARE_OFFSET;
            const trx = x1 - SQUARE_OFFSET;
            const try_ = y0 + SQUARE_OFFSET;
            const blx = x0 + SQUARE_OFFSET;
            const bly = y1 - SQUARE_OFFSET;
            const brx = x1 - SQUARE_OFFSET;
            const bry = y1 - SQUARE_OFFSET;

            // Top-left
            painter.moveTo(tlx, tly).lineTo(tlx + MARK_LEN, tly).stroke();
            painter.moveTo(tlx, tly).lineTo(tlx, tly + MARK_LEN).stroke();
            // Top-right
            painter.moveTo(trx, try_).lineTo(trx - MARK_LEN, try_).stroke();
            painter.moveTo(trx, try_).lineTo(trx, try_ + MARK_LEN).stroke();
            // Bottom-left
            painter.moveTo(blx, bly).lineTo(blx + MARK_LEN, bly).stroke();
            painter.moveTo(blx, bly).lineTo(blx, bly - MARK_LEN).stroke();
            // Bottom-right
            painter.moveTo(brx, bry).lineTo(brx - MARK_LEN, bry).stroke();
            painter.moveTo(brx, bry).lineTo(brx, bry - MARK_LEN).stroke();

            // ── 3. Filled corner squares (darkest, inner edge flush with border) ──
            painter.fillColor(c.dark).fillOpacity(0.8);
            painter.rect(tlx, tly, SQUARE_SIZE, SQUARE_SIZE).fill();
            painter.rect(trx - SQUARE_SIZE, try_, SQUARE_SIZE, SQUARE_SIZE).fill();
            painter.rect(blx, bly - SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE).fill();
            painter.rect(brx - SQUARE_SIZE, bry - SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE).fill();

            // ── Top-right decoration: grid + crosses (Vercel-style) ──
            const trX = PAGE_W - DECO_W;

            const fadeTR = (x: number, y: number) => {
              const dx = (PAGE_W - x) / DECO_W;
              const dy = y / DECO_H;
              return Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) * 1.1);
            };

            // Vertical grid lines
            painter.lineWidth(0.5);
            for (let lx = 0; lx <= DECO_W; lx += GRID_STEP) {
              for (let ly = 0; ly < DECO_H; ly += GRID_STEP) {
                const ax = trX + lx;
                const op = fadeTR(ax, ly + GRID_STEP / 2) * 0.18;
                if (op > 0.001) {
                  painter.moveTo(ax, ly).lineTo(ax, Math.min(ly + GRID_STEP, DECO_H))
                    .strokeColor(c.accent).strokeOpacity(op).stroke();
                }
              }
            }
            // Horizontal grid lines
            for (let ly = 0; ly <= DECO_H; ly += GRID_STEP) {
              for (let lx = 0; lx < DECO_W; lx += GRID_STEP) {
                const ax = trX + lx;
                const op = fadeTR(ax + GRID_STEP / 2, ly) * 0.18;
                if (op > 0.001) {
                  painter.moveTo(ax, ly).lineTo(Math.min(ax + GRID_STEP, PAGE_W), ly)
                    .strokeColor(c.accent).strokeOpacity(op).stroke();
                }
              }
            }

            // Cross markers at specific grid intersections
            const crosses = [
              [2, 2], [5, 1], [8, 3], [10, 1], [4, 5], [7, 6], [12, 2],
              [3, 3], [9, 5], [11, 4], [6, 2],
            ];
            painter.lineWidth(0.8);
            for (const [cx, cy] of crosses) {
              const ax = trX + cx * GRID_STEP;
              const ay = cy * GRID_STEP;
              const op = fadeTR(ax, ay) * 0.4;
              if (op > 0.005) {
                painter.moveTo(ax - 3.5, ay).lineTo(ax + 3.5, ay)
                  .strokeColor(c.accent).strokeOpacity(op).stroke();
                painter.moveTo(ax, ay - 3.5).lineTo(ax, ay + 3.5)
                  .strokeColor(c.accent).strokeOpacity(op).stroke();
              }
            }

            painter.restore();
            return null;
          }}
        />

        {/* ── Dithered bird watermark ── */}
        {/* fixed={true}: bird image appears on every page as a watermark.
            Also required to prevent the layout engine from trying to split
            this absolute-positioned image across page boundaries, which
            causes an infinite pagination loop for multi-page resumes. */}
        {birdImage && (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image
            fixed
            src={birdImage}
            style={{
              position: "absolute",
              bottom: -20,
              right: -20,
              width: 396,
              height: 396,
              opacity: 0.12,
            }}
          />
        )}

        {/* ── Dither image watermark (user-uploaded photo) ── */}
        {ditherImage && (
          // eslint-disable-next-line jsx-a11y/alt-text
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
              marginBottom: 4,
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
                marginBottom: 6,
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
            marginTop: 7,
            marginBottom: 10,
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
