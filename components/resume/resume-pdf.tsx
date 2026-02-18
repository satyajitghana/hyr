import {
  Document,
  Page,
  Text,
  View,
  Image,
  Canvas,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Resume } from "@/lib/resume/types";

// ── Color palette ──
const c = {
  black:  "#0a0a0a",
  dark:   "#171717",
  muted:  "#525252",
  light:  "#a3a3a3",
  border: "#e5e5e5",
  accent: "#4f46e5",
};

// LETTER page = 612 × 792 pt
const PAGE_PAD_TOP  = 40;
const PAGE_PAD_BOT  = 40;
const PAGE_PAD_H    = 52;
const PAGE_W        = 612;
const PAGE_H        = 792;

// Seeded RNG for deterministic dot placement
function seededRng(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return () => {
    h = ((h ^ (h >>> 16)) * 0x45d9f3b) | 0;
    h = ((h ^ (h >>> 16)) * 0x45d9f3b) | 0;
    h = h ^ (h >>> 16);
    return (h >>> 0) / 0xffffffff;
  };
}

const styles = StyleSheet.create({
  page: {
    paddingTop:        PAGE_PAD_TOP,
    paddingBottom:     PAGE_PAD_BOT,
    paddingHorizontal: PAGE_PAD_H,
    fontSize:  10,
    color:     c.dark,
    lineHeight: 1.45,
    backgroundColor: "#ffffff",
  },
  // ── Header ──
  headerBlock: {
    marginBottom: 12,
  },
  name: {
    fontSize:   24,
    fontWeight: 700,
    color:      c.black,
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  jobTitle: {
    fontSize:   11,
    fontWeight: 400,
    color:      c.muted,
    marginBottom: 7,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap:      "wrap",
    marginBottom:  0,
  },
  contactItem: {
    fontSize: 9,
    color:    c.muted,
  },
  contactSep: {
    fontSize:         9,
    color:            c.light,
    marginHorizontal: 5,
  },
  headerRule: {
    height:          0.75,
    backgroundColor: c.border,
    marginTop:       12,
    marginBottom:    12,
  },
  // ── Section ──
  section: {
    marginBottom: 10,
  },
  sectionRule: {
    height:          0.5,
    backgroundColor: c.border,
    marginBottom:    6,
  },
  sectionTitleRow: {
    flexDirection:  "row",
    alignItems:     "center",
    marginBottom:   5,
  },
  sectionTitle: {
    fontSize:   9,
    fontWeight: 700,
    color:      c.light,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  sectionTitleAccent: {
    width:           16,
    height:          1.5,
    backgroundColor: c.accent,
    marginRight:     6,
    opacity:         0.8,
  },
  // ── Summary ──
  summary: {
    fontSize:   10,
    color:      c.muted,
    lineHeight: 1.6,
  },
  // ── Experience ──
  expItem: {
    marginBottom: 8,
  },
  expHeader: {
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "flex-start",
    marginBottom:   1,
  },
  expTitle: {
    fontSize:   10.5,
    fontWeight: 600,
    color:      c.black,
  },
  expDates: {
    fontSize: 9,
    color:    c.light,
    fontWeight: 400,
  },
  expCompany: {
    fontSize:     9.5,
    color:        c.muted,
    marginBottom: 4,
  },
  bullet: {
    flexDirection: "row",
    marginBottom:  2,
    paddingLeft:   0,
  },
  bulletChar: {
    width:      10,
    fontSize:   9.5,
    color:      c.light,
    marginTop:  0.5,
  },
  bulletText: {
    flex:       1,
    fontSize:   9.5,
    lineHeight: 1.5,
    color:      c.muted,
  },
  // ── Education ──
  eduItem: {
    marginBottom: 6,
  },
  eduHeader: {
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "baseline",
  },
  eduDegree: {
    fontSize:   10.5,
    fontWeight: 600,
    color:      c.black,
  },
  eduDate: {
    fontSize: 9,
    color:    c.light,
  },
  eduSchool: {
    fontSize: 9.5,
    color:    c.muted,
  },
  // ── Skills ──
  skillsText: {
    fontSize:   10,
    color:      c.muted,
    lineHeight: 1.55,
  },
  // ── Certifications ──
  certItem: {
    flexDirection: "row" as const,
    marginBottom:  2.5,
  },
});

function SectionHeading({ title, first = false }: { title: string; first?: boolean }) {
  return (
    <>
      {!first && <View style={styles.sectionRule} />}
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionTitleAccent} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
    </>
  );
}

// ── Main Component ──
interface ResumePDFProps {
  resume:       Resume;
  fontFamily?:  string;
  monoFamily?:  string;
  ditherImage?: string;
  ditherSeed?:  string;
}

export function ResumePDF({
  resume,
  fontFamily = "Helvetica",
  monoFamily,
  ditherImage,
  ditherSeed,
}: ResumePDFProps) {
  // Resolved monospace family for dates and numbers
  const mono = monoFamily ?? fontFamily;
  const contactItems: string[] = [
    resume.contact.email,
    resume.contact.phone,
    resume.contact.location,
    ...(resume.contact.linkedin ? [resume.contact.linkedin] : []),
    ...(resume.contact.website  ? [resume.contact.website]  : []),
  ];

  const hasSummary  = Boolean(resume.summary);
  const hasExp      = resume.experience.length  > 0;
  const hasEdu      = resume.education.length   > 0;
  const hasSkills   = resume.skills.length       > 0;
  const hasCerts    = resume.certifications.length > 0;

  let firstSection: "summary" | "experience" | "education" | "skills" | "certs" | null = null;
  if (hasSummary)     firstSection = "summary";
  else if (hasExp)    firstSection = "experience";
  else if (hasEdu)    firstSection = "education";
  else if (hasSkills) firstSection = "skills";
  else if (hasCerts)  firstSection = "certs";

  // Corner decoration dimensions
  const DECO_W = 180;
  const DECO_H = 160;

  return (
    <Document>
      <Page size="LETTER" style={[styles.page, { fontFamily }]}>

        {/* ── Corner geometric decoration via Canvas (zero layout impact) ── */}
        <Canvas
          style={{
            position: "absolute",
            top:   0,
            right: 0,
            width:  DECO_W,
            height: DECO_H,
          }}
          paint={(painter: any): null => {
            const STEP = 16;
            painter.save();

            // Grid lines — very subtle
            painter.lineWidth(0.4);
            for (let x = 0; x <= DECO_W; x += STEP) {
              painter
                .moveTo(x, 0)
                .lineTo(x, DECO_H)
                .strokeColor(c.accent)
                .strokeOpacity(0.07)
                .stroke();
            }
            for (let y = 0; y <= DECO_H; y += STEP) {
              painter
                .moveTo(0, y)
                .lineTo(DECO_W, y)
                .strokeColor(c.accent)
                .strokeOpacity(0.07)
                .stroke();
            }

            // Cross markers at selected intersections
            const crosses = [
              [STEP * 2, STEP * 3],
              [STEP * 5, STEP * 1],
              [STEP * 8, STEP * 4],
              [STEP * 4, STEP * 6],
              [STEP * 7, STEP * 7],
            ];
            painter.lineWidth(0.75);
            for (const [cx, cy] of crosses) {
              painter
                .moveTo(cx - 4, cy)
                .lineTo(cx + 4, cy)
                .strokeColor(c.accent)
                .strokeOpacity(0.18)
                .stroke();
              painter
                .moveTo(cx, cy - 4)
                .lineTo(cx, cy + 4)
                .strokeColor(c.accent)
                .strokeOpacity(0.18)
                .stroke();
            }

            // Seeded accent dots
            if (ditherSeed) {
              const rng = seededRng(ditherSeed);
              for (let i = 0; i < 12; i++) {
                const x = rng() * DECO_W;
                const y = rng() * DECO_H;
                const r = 0.8 + rng() * 1.2;
                painter
                  .circle(x, y, r)
                  .fillColor(c.accent)
                  .fillOpacity(0.12)
                  .fill();
              }
            }

            painter.restore();
            return null;
          }}
        />

        {/* ── User dithered photo (top-right area, under decoration) ── */}
        {ditherImage && (
          <Image src={ditherImage} style={{
            position: "absolute",
            top:    PAGE_PAD_TOP,
            right:  PAGE_PAD_H,
            width:  72,
            height: 72,
            opacity: 0.12,
          }} />
        )}

        {/* ── Header ── */}
        <View style={styles.headerBlock}>
          <Text style={[styles.name, { fontFamily }]}>{resume.contact.name}</Text>
          {resume.experience[0]?.title && (
            <Text style={[styles.jobTitle, { fontFamily }]}>
              {resume.experience[0].title}
            </Text>
          )}
          <View style={styles.contactRow}>
            {contactItems.map((item, i) => (
              <View key={i} style={{ flexDirection: "row" as const }}>
                {i > 0 && <Text style={styles.contactSep}>·</Text>}
                <Text style={styles.contactItem}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Thin rule closes header */}
        <View style={styles.headerRule} />

        {/* ── Summary ── */}
        {hasSummary && (
          <View style={styles.section}>
            <SectionHeading title="Summary" first={firstSection === "summary"} />
            <Text style={styles.summary}>{resume.summary}</Text>
          </View>
        )}

        {/* ── Experience ── */}
        {hasExp && (
          <View style={styles.section}>
            <SectionHeading title="Experience" first={firstSection === "experience"} />
            {resume.experience.map((exp) => (
              <View key={exp.id} style={styles.expItem} wrap={false}>
                <View style={styles.expHeader}>
                  <Text style={styles.expTitle}>{exp.title}</Text>
                  <Text style={[styles.expDates, { fontFamily: mono }]}>
                    {exp.startDate}{" \u2013 "}{exp.endDate}
                  </Text>
                </View>
                <Text style={styles.expCompany}>
                  {exp.company}{" \u00B7 "}{exp.location}
                </Text>
                {exp.bullets.map((b, i) => (
                  <View key={i} style={styles.bullet}>
                    <Text style={styles.bulletChar}>{"\u2013"}</Text>
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* ── Education ── */}
        {hasEdu && (
          <View style={styles.section}>
            <SectionHeading title="Education" first={firstSection === "education"} />
            {resume.education.map((edu) => (
              <View key={edu.id} style={styles.eduItem} wrap={false}>
                <View style={styles.eduHeader}>
                  <Text style={styles.eduDegree}>{edu.degree}</Text>
                  <Text style={[styles.eduDate, { fontFamily: mono }]}>{edu.graduationDate}</Text>
                </View>
                <Text style={styles.eduSchool}>
                  {edu.school}{" \u00B7 "}{edu.location}
                  {edu.gpa ? `  \u00B7  GPA: ${edu.gpa}` : ""}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Skills ── */}
        {hasSkills && (
          <View style={styles.section}>
            <SectionHeading title="Skills" first={firstSection === "skills"} />
            <Text style={styles.skillsText}>{resume.skills.join(", ")}</Text>
          </View>
        )}

        {/* ── Certifications ── */}
        {hasCerts && (
          <View style={styles.section}>
            <SectionHeading title="Certifications" first={firstSection === "certs"} />
            {resume.certifications.map((cert, i) => (
              <View key={i} style={styles.certItem}>
                <Text style={styles.bulletChar}>{"\u2013"}</Text>
                <Text style={styles.bulletText}>{cert}</Text>
              </View>
            ))}
          </View>
        )}

      </Page>
    </Document>
  );
}
