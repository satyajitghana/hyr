import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Resume } from "@/lib/resume/types";

const c = {
  black: "#111827",
  dark: "#374151",
  muted: "#6b7280",
  light: "#9ca3af",
  border: "#d1d5db",
};

const styles = StyleSheet.create({
  page: {
    padding: 48,
    paddingTop: 44,
    paddingBottom: 44,
    fontSize: 9,
    color: c.dark,
    lineHeight: 1.5,
  },
  header: {
    alignItems: "center",
    marginBottom: 14,
  },
  name: {
    fontSize: 22,
    fontWeight: 700,
    color: c.black,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  contactItem: {
    fontSize: 8.5,
    color: c.muted,
  },
  contactSep: {
    fontSize: 8.5,
    color: c.light,
    marginHorizontal: 6,
  },
  divider: {
    borderBottomWidth: 0.75,
    borderBottomColor: c.border,
    marginBottom: 12,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 600,
    color: c.black,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 6,
  },
  summary: {
    fontSize: 9,
    color: c.dark,
    lineHeight: 1.65,
  },
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
    fontSize: 8.5,
    color: c.muted,
  },
  expCompany: {
    fontSize: 9,
    color: c.muted,
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
    color: c.muted,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.5,
    color: c.dark,
  },
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
    fontSize: 8.5,
    color: c.muted,
  },
  eduSchool: {
    fontSize: 9,
    color: c.muted,
  },
  skillsText: {
    fontSize: 9,
    color: c.dark,
    lineHeight: 1.65,
  },
  certItem: {
    flexDirection: "row" as const,
    marginBottom: 2,
    paddingLeft: 2,
  },
});

interface ResumePDFProps {
  resume: Resume;
  fontFamily?: string;
}

export function ResumePDF({ resume, fontFamily = "Helvetica" }: ResumePDFProps) {
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{resume.contact.name}</Text>
          <View style={styles.contactRow}>
            {contactItems.map((item, i) => (
              <View key={i} style={{ flexDirection: "row" }}>
                {i > 0 && <Text style={styles.contactSep}>·</Text>}
                <Text style={styles.contactItem}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Summary */}
        {resume.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summary}>{resume.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Experience</Text>
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
          </>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Education</Text>
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
          </>
        )}

        {/* Skills */}
        {resume.skills.length > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills</Text>
              <Text style={styles.skillsText}>
                {resume.skills.join("  ·  ")}
              </Text>
            </View>
          </>
        )}

        {/* Certifications */}
        {resume.certifications.length > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Certifications</Text>
              {resume.certifications.map((cert, i) => (
                <View key={i} style={styles.certItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{cert}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </Page>
    </Document>
  );
}
