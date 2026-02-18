import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Resume } from "@/lib/resume/types";

// ── Color palette (ATS-safe: accent used only for lines, never text) ──
const c = {
  black: "#111827",
  dark: "#1f2937",
  muted: "#4b5563",
  light: "#9ca3af",
  border: "#d1d5db",
  accent: "#4f46e5",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 48,
    fontSize: 10,
    color: c.dark,
    lineHeight: 1.45,
    position: "relative",
  },
  // ── Header ──
  name: {
    fontSize: 22,
    fontWeight: 700,
    color: c.black,
    marginBottom: 2,
  },
  title: {
    fontSize: 11,
    fontWeight: 500,
    color: c.muted,
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  contactItem: {
    fontSize: 10,
    color: c.muted,
  },
  contactSep: {
    fontSize: 10,
    color: c.light,
    marginHorizontal: 5,
  },
  accentLine: {
    height: 2,
    backgroundColor: c.accent,
    marginBottom: 10,
  },
  // ── Section ──
  section: {
    marginBottom: 8,
  },
  sectionDivider: {
    height: 0.75,
    backgroundColor: c.border,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: c.black,
    marginBottom: 4,
  },
  // ── Summary ──
  summary: {
    fontSize: 10,
    color: c.dark,
    lineHeight: 1.55,
  },
  // ── Experience ──
  expItem: {
    marginBottom: 7,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 1,
  },
  expTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: c.black,
  },
  expDates: {
    fontSize: 10,
    color: c.muted,
  },
  expCompany: {
    fontSize: 10,
    color: c.muted,
    fontWeight: 500,
    marginBottom: 2,
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 1.5,
    paddingLeft: 4,
  },
  bulletChar: {
    width: 12,
    fontSize: 10,
    color: c.dark,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.45,
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
    fontSize: 10.5,
    fontWeight: 600,
    color: c.black,
  },
  eduDate: {
    fontSize: 10,
    color: c.muted,
  },
  eduSchool: {
    fontSize: 10,
    color: c.muted,
  },
  // ── Skills (plain text, comma-separated) ──
  skillsText: {
    fontSize: 10,
    color: c.dark,
    lineHeight: 1.5,
  },
  // ── Certifications ──
  certItem: {
    flexDirection: "row" as const,
    marginBottom: 2,
    paddingLeft: 4,
  },
  // ── Dither image overlay ──
  ditherOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 90,
    height: 90,
    opacity: 0.06,
  },
});

// ── Section heading ──
function SectionHeading({ title }: { title: string }) {
  return (
    <>
      <View style={styles.sectionDivider} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </>
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

  return (
    <Document>
      <Page size="LETTER" style={[styles.page, { fontFamily }]}>
        {/* Dithered profile image — small, absolutely positioned */}
        {ditherImage && (
          <Image src={ditherImage} style={styles.ditherOverlay} />
        )}

        {/* ── Header ── */}
        <Text style={styles.name}>{resume.contact.name}</Text>
        {resume.experience[0]?.title && (
          <Text style={styles.title}>{resume.experience[0].title}</Text>
        )}
        <View style={styles.contactRow}>
          {contactItems.map((item, i) => (
            <View key={i} style={{ flexDirection: "row" as const }}>
              {i > 0 && <Text style={styles.contactSep}>|</Text>}
              <Text style={styles.contactItem}>{item}</Text>
            </View>
          ))}
        </View>
        <View style={styles.accentLine} />

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
              <View key={exp.id} style={styles.expItem} wrap={false}>
                <View style={styles.expHeader}>
                  <Text style={styles.expTitle}>{exp.title}</Text>
                  <Text style={styles.expDates}>
                    {exp.startDate} {"\u2014"} {exp.endDate}
                  </Text>
                </View>
                <Text style={styles.expCompany}>
                  {exp.company} {"\u00B7"} {exp.location}
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
        {resume.education.length > 0 && (
          <View style={styles.section}>
            <SectionHeading title="Education" />
            {resume.education.map((edu) => (
              <View key={edu.id} style={styles.eduItem} wrap={false}>
                <View style={styles.eduHeader}>
                  <Text style={styles.eduDegree}>{edu.degree}</Text>
                  <Text style={styles.eduDate}>{edu.graduationDate}</Text>
                </View>
                <Text style={styles.eduSchool}>
                  {edu.school} {"\u00B7"} {edu.location}
                  {edu.gpa ? ` \u00B7 GPA: ${edu.gpa}` : ""}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Skills ── */}
        {resume.skills.length > 0 && (
          <View style={styles.section}>
            <SectionHeading title="Skills" />
            <Text style={styles.skillsText}>
              {resume.skills.join(", ")}
            </Text>
          </View>
        )}

        {/* ── Certifications ── */}
        {resume.certifications.length > 0 && (
          <View style={styles.section}>
            <SectionHeading title="Certifications" />
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
