import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Svg,
  Circle,
} from "@react-pdf/renderer";
import type { Resume } from "@/lib/resume/types";

// ── Color palette ──
const c = {
  black: "#111827",
  dark: "#374151",
  muted: "#6b7280",
  light: "#9ca3af",
  border: "#e5e7eb",
  accent: "#4f46e5",
  accentLight: "#818cf8",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 36,
    paddingHorizontal: 44,
    fontSize: 9.5,
    color: c.dark,
    lineHeight: 1.5,
    position: "relative",
  },
  // ── Header ──
  headerBar: {
    marginHorizontal: -44,
    marginTop: -40,
    paddingHorizontal: 44,
    paddingTop: 32,
    paddingBottom: 20,
    backgroundColor: "#fafafa",
    borderBottom: `1.5px solid ${c.border}`,
    marginBottom: 16,
    position: "relative",
    overflow: "hidden",
  },
  headerContent: {
    position: "relative",
  },
  name: {
    fontSize: 24,
    fontWeight: 700,
    color: c.black,
    marginBottom: 5,
  },
  title: {
    fontSize: 11,
    fontWeight: 500,
    color: c.accent,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  contactItem: {
    fontSize: 8,
    color: c.muted,
  },
  contactSep: {
    fontSize: 8,
    color: c.light,
    marginHorizontal: 5,
  },
  // ── Sections ──
  section: {
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  sectionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: c.accent,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: c.black,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  sectionLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: c.border,
  },
  // ── Summary ──
  summary: {
    fontSize: 9,
    color: c.dark,
    lineHeight: 1.6,
  },
  // ── Experience ──
  expItem: {
    marginBottom: 8,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 1,
  },
  expTitle: {
    fontSize: 10.5,
    fontWeight: 600,
    color: c.black,
  },
  expDates: {
    fontSize: 8,
    color: c.muted,
    fontWeight: 500,
  },
  expCompany: {
    fontSize: 9,
    color: c.accent,
    fontWeight: 500,
    marginBottom: 3,
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 1.5,
    paddingLeft: 2,
  },
  bulletDot: {
    width: 10,
    fontSize: 9,
    color: c.light,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.5,
    color: c.dark,
  },
  // ── Education ──
  eduItem: {
    marginBottom: 5,
  },
  eduHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  eduDegree: {
    fontSize: 10,
    fontWeight: 600,
    color: c.black,
  },
  eduDate: {
    fontSize: 8,
    color: c.muted,
    fontWeight: 500,
  },
  eduSchool: {
    fontSize: 9,
    color: c.muted,
  },
  // ── Skills ──
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  skillChip: {
    fontSize: 8,
    color: c.accent,
    backgroundColor: "#eef2ff",
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontWeight: 500,
  },
  // ── Certifications ──
  certItem: {
    flexDirection: "row" as const,
    marginBottom: 2,
    paddingLeft: 2,
  },
  // ── Dither image overlay ──
  ditherOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 120,
    height: 120,
    opacity: 0.06,
  },
});

// ── Generative dither background ──
// Creates a field of dots seeded by the resume name / role
function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return () => {
    h = (h ^ (h >>> 16)) * 0x45d9f3b;
    h = (h ^ (h >>> 16)) * 0x45d9f3b;
    h = h ^ (h >>> 16);
    return ((h >>> 0) / 0xffffffff);
  };
}

interface DitherDot {
  cx: number;
  cy: number;
  r: number;
  opacity: number;
}

function generateDitherDots(seed: string, width: number, height: number, count: number): DitherDot[] {
  const rng = seededRandom(seed);
  const dots: DitherDot[] = [];
  for (let i = 0; i < count; i++) {
    dots.push({
      cx: rng() * width,
      cy: rng() * height,
      r: 0.5 + rng() * 1.8,
      opacity: 0.03 + rng() * 0.07,
    });
  }
  return dots;
}

// ── Section heading component ──
function SectionHeading({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionDot} />
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

// ── Main Component ──
interface ResumePDFProps {
  resume: Resume;
  fontFamily?: string;
  ditherImage?: string;
}

export function ResumePDF({ resume, fontFamily = "Helvetica", ditherImage }: ResumePDFProps) {
  const contactItems: string[] = [
    resume.contact.email,
    resume.contact.phone,
    resume.contact.location,
    ...(resume.contact.linkedin ? [resume.contact.linkedin] : []),
    ...(resume.contact.website ? [resume.contact.website] : []),
  ];

  // Get the primary role from first experience entry for seeding
  const roleSeed = resume.experience[0]?.title || resume.contact.name;
  const headerDots = generateDitherDots(roleSeed, 612, 100, 300);
  const pageDots = generateDitherDots(resume.contact.name + "bg", 612, 792, 200);

  return (
    <Document>
      <Page size="LETTER" style={[styles.page, { fontFamily }]}>
        {/* Page-level subtle background dots */}
        <Svg
          style={{ position: "absolute", top: 0, left: 0, width: 612, height: 792 }}
        >
          {pageDots.map((dot, i) => (
            <Circle
              key={i}
              cx={dot.cx}
              cy={dot.cy}
              r={dot.r}
              fill={c.accent}
              opacity={dot.opacity * 0.5}
            />
          ))}
        </Svg>

        {/* ── Header Bar ── */}
        <View style={styles.headerBar}>
          {/* Header dither pattern */}
          <Svg
            style={{ position: "absolute", top: 0, left: 0, width: 612, height: 100 }}
          >
            {headerDots.map((dot, i) => (
              <Circle
                key={i}
                cx={dot.cx}
                cy={dot.cy}
                r={dot.r}
                fill={c.accent}
                opacity={dot.opacity}
              />
            ))}
          </Svg>

          <View style={styles.headerContent}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{resume.contact.name}</Text>
                {resume.experience[0]?.title && (
                  <Text style={styles.title}>{resume.experience[0].title}</Text>
                )}
                <View style={styles.contactRow}>
                  {contactItems.map((item, i) => (
                    <View key={i} style={{ flexDirection: "row" }}>
                      {i > 0 && <Text style={styles.contactSep}>|</Text>}
                      <Text style={styles.contactItem}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Dithered profile image */}
              {ditherImage && (
                <Image
                  src={ditherImage}
                  style={styles.ditherOverlay}
                />
              )}
            </View>
          </View>
        </View>

        {/* ── Summary ── */}
        {resume.summary && (
          <View style={styles.section}>
            <SectionHeading title="Summary" />
            <Text style={styles.summary}>{resume.summary}</Text>
          </View>
        )}

        {/* ── Experience ── */}
        {resume.experience.length > 0 && (
          <View style={styles.section}>
            <SectionHeading title="Experience" />
            {resume.experience.map((exp) => (
              <View key={exp.id} style={styles.expItem}>
                <View style={styles.expHeader}>
                  <Text style={styles.expTitle}>{exp.title}</Text>
                  <Text style={styles.expDates}>
                    {exp.startDate} — {exp.endDate}
                  </Text>
                </View>
                <Text style={styles.expCompany}>
                  {exp.company} · {exp.location}
                </Text>
                {exp.bullets.map((b, i) => (
                  <View key={i} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* ── Education ── */}
        {resume.education.length > 0 && (
          <View style={styles.section}>
            <SectionHeading title="Education" />
            {resume.education.map((edu) => (
              <View key={edu.id} style={styles.eduItem}>
                <View style={styles.eduHeader}>
                  <Text style={styles.eduDegree}>{edu.degree}</Text>
                  <Text style={styles.eduDate}>{edu.graduationDate}</Text>
                </View>
                <Text style={styles.eduSchool}>
                  {edu.school} · {edu.location}
                  {edu.gpa ? ` · GPA: ${edu.gpa}` : ""}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Skills ── */}
        {resume.skills.length > 0 && (
          <View style={styles.section}>
            <SectionHeading title="Skills" />
            <View style={styles.skillsRow}>
              {resume.skills.map((skill) => (
                <Text key={skill} style={styles.skillChip}>
                  {skill}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* ── Certifications ── */}
        {resume.certifications.length > 0 && (
          <View style={styles.section}>
            <SectionHeading title="Certifications" />
            {resume.certifications.map((cert, i) => (
              <View key={i} style={styles.certItem}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{cert}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
