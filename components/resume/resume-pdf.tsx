import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Resume } from "@/lib/resume/types";

// ── Color palette ──
const c = {
  black:  "#111827",
  dark:   "#1f2937",
  muted:  "#4b5563",
  light:  "#9ca3af",
  border: "#d1d5db",
  accent: "#4f46e5",
};

// LETTER page = 612 × 792 pt
// Padding: top 36, bottom 36, horizontal 48
// To bleed a full-page bg image to the page edges, offset by padding:
const PAGE_PAD_TOP  = 36;
const PAGE_PAD_H    = 48;
const PAGE_W        = 612;
const PAGE_H        = 792;

const styles = StyleSheet.create({
  page: {
    paddingTop:        PAGE_PAD_TOP,
    paddingBottom:     36,
    paddingHorizontal: PAGE_PAD_H,
    fontSize:  10,
    color:     c.dark,
    lineHeight: 1.45,
  },
  // ── Full-page background (generative dots, rendered as PNG Image) ──
  bgDither: {
    position: "absolute",
    top:    -PAGE_PAD_TOP,
    left:   -PAGE_PAD_H,
    width:   PAGE_W,
    height:  PAGE_H,
    opacity: 0.045,
  },
  // ── User dither photo (top-right corner) ──
  ditherOverlay: {
    position: "absolute",
    top:   0,
    right: 0,
    width:  88,
    height: 88,
    opacity: 0.07,
  },
  // ── Header ──
  name: {
    fontSize:   22,
    fontWeight: 700,
    color:      c.black,
    marginBottom: 2,
  },
  jobTitle: {
    fontSize:   11,
    fontWeight: 500,
    color:      c.muted,
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap:      "wrap",
    marginBottom:  8,
  },
  contactItem: {
    fontSize: 9.5,
    color:    c.muted,
  },
  contactSep: {
    fontSize:       9.5,
    color:          c.light,
    marginHorizontal: 4,
  },
  // Thin accent rule that closes the header block — replaces the old 2px line
  headerRule: {
    height:          1,
    backgroundColor: c.accent,
    marginBottom:    10,
    opacity:         0.7,
  },
  // ── Section ──
  section: {
    marginBottom: 9,
  },
  // Gray rule before sections OTHER than the first (no double-line)
  sectionRule: {
    height:          0.5,
    backgroundColor: c.border,
    marginBottom:    5,
  },
  sectionTitle: {
    fontSize:   10.5,
    fontWeight: 700,
    color:      c.black,
    marginBottom: 3,
  },
  // ── Summary ──
  summary: {
    fontSize:   10,
    color:      c.dark,
    lineHeight: 1.55,
  },
  // ── Experience ──
  expItem: {
    marginBottom: 7,
  },
  expHeader: {
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "baseline",
    marginBottom:   1,
  },
  expTitle: {
    fontSize:   10.5,
    fontWeight: 600,
    color:      c.black,
  },
  expDates: {
    fontSize: 9.5,
    color:    c.muted,
  },
  expCompany: {
    fontSize:     9.5,
    color:        c.muted,
    fontWeight:   500,
    marginBottom: 2.5,
  },
  bullet: {
    flexDirection: "row",
    marginBottom:  1.5,
    paddingLeft:   6,
  },
  bulletChar: {
    width:    10,
    fontSize: 10,
    color:    c.muted,
  },
  bulletText: {
    flex:       1,
    fontSize:   10,
    lineHeight: 1.45,
    color:      c.dark,
  },
  // ── Education ──
  eduItem: {
    marginBottom: 5,
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
    fontSize: 9.5,
    color:    c.muted,
  },
  eduSchool: {
    fontSize: 9.5,
    color:    c.muted,
  },
  // ── Skills ──
  skillsText: {
    fontSize:   10,
    color:      c.dark,
    lineHeight: 1.5,
  },
  // ── Certifications ──
  certItem: {
    flexDirection: "row" as const,
    marginBottom:  2,
    paddingLeft:   6,
  },
});

// Section heading — `first` suppresses the gray rule to avoid double-line
// after the header accent rule.
function SectionHeading({ title, first = false }: { title: string; first?: boolean }) {
  return (
    <>
      {!first && <View style={styles.sectionRule} />}
      <Text style={styles.sectionTitle}>{title}</Text>
    </>
  );
}

// ── Main Component ──
interface ResumePDFProps {
  resume:           Resume;
  fontFamily?:      string;
  ditherImage?:     string;   // user-uploaded halftone photo
  backgroundDither?: string;  // generative dot-pattern PNG (server-generated)
}

export function ResumePDF({
  resume,
  fontFamily = "Helvetica",
  ditherImage,
  backgroundDither,
}: ResumePDFProps) {
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

  // Which is the first visible section? It gets `first` (no gray rule above).
  // Sections render in order: Summary → Experience → Education → Skills → Certs
  let firstSection: "summary" | "experience" | "education" | "skills" | "certs" | null = null;
  if (hasSummary)   firstSection = "summary";
  else if (hasExp)  firstSection = "experience";
  else if (hasEdu)  firstSection = "education";
  else if (hasSkills) firstSection = "skills";
  else if (hasCerts)  firstSection = "certs";

  return (
    <Document>
      <Page size="LETTER" style={[styles.page, { fontFamily }]}>

        {/* ── Generative dot background (PNG Image, avoids SVG blank-page bug) ── */}
        {backgroundDither && (
          <Image src={backgroundDither} style={styles.bgDither} />
        )}

        {/* ── User dithered photo (top-right corner watermark) ── */}
        {ditherImage && (
          <Image src={ditherImage} style={styles.ditherOverlay} />
        )}

        {/* ── Header ── */}
        <Text style={styles.name}>{resume.contact.name}</Text>
        {resume.experience[0]?.title && (
          <Text style={styles.jobTitle}>{resume.experience[0].title}</Text>
        )}
        <View style={styles.contactRow}>
          {contactItems.map((item, i) => (
            <View key={i} style={{ flexDirection: "row" as const }}>
              {i > 0 && <Text style={styles.contactSep}>·</Text>}
              <Text style={styles.contactItem}>{item}</Text>
            </View>
          ))}
        </View>
        {/* Single thin accent line closes the header — no duplicate below */}
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
                  <Text style={styles.expDates}>
                    {exp.startDate}{" \u2014 "}{exp.endDate}
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
                  <Text style={styles.eduDate}>{edu.graduationDate}</Text>
                </View>
                <Text style={styles.eduSchool}>
                  {edu.school}{" \u00B7 "}{edu.location}
                  {edu.gpa ? `\u00B7 GPA: ${edu.gpa}` : ""}
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
