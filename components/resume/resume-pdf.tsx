import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { Resume } from "@/lib/resume/types";

Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica" },
    { src: "Helvetica-Bold", fontWeight: "bold" },
    { src: "Helvetica-Oblique", fontStyle: "italic" },
  ],
});

const colors = {
  primary: "#4f46e5",
  text: "#1f2937",
  muted: "#6b7280",
  light: "#f3f4f6",
  border: "#e5e7eb",
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.text,
    lineHeight: 1.5,
  },
  // Header
  header: {
    marginBottom: 20,
    borderBottom: `2px solid ${colors.primary}`,
    paddingBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  contactItem: {
    fontSize: 9,
    color: colors.muted,
    marginRight: 12,
  },
  contactSeparator: {
    fontSize: 9,
    color: colors.border,
    marginRight: 4,
  },
  // Sections
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: 4,
  },
  // Summary
  summary: {
    fontSize: 10,
    color: colors.text,
    lineHeight: 1.6,
  },
  // Experience
  experienceItem: {
    marginBottom: 10,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  expTitle: {
    fontSize: 11,
    fontWeight: "bold",
  },
  expDates: {
    fontSize: 9,
    color: colors.muted,
  },
  expCompany: {
    fontSize: 10,
    color: colors.muted,
    marginBottom: 4,
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 8,
  },
  bulletDot: {
    width: 12,
    fontSize: 10,
    color: colors.muted,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    lineHeight: 1.5,
  },
  // Education
  eduItem: {
    marginBottom: 6,
  },
  eduDegree: {
    fontSize: 11,
    fontWeight: "bold",
  },
  eduSchool: {
    fontSize: 10,
    color: colors.muted,
  },
  eduMeta: {
    fontSize: 9,
    color: colors.muted,
  },
  // Skills
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skillBadge: {
    backgroundColor: colors.light,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 9,
    color: colors.text,
  },
  // Certifications
  certItem: {
    fontSize: 10,
    marginBottom: 3,
    paddingLeft: 8,
  },
});

interface ResumePDFProps {
  resume: Resume;
}

export function ResumePDF({ resume }: ResumePDFProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{resume.contact.name}</Text>
          <View style={styles.contactRow}>
            <Text style={styles.contactItem}>{resume.contact.email}</Text>
            <Text style={styles.contactSeparator}>|</Text>
            <Text style={styles.contactItem}>{resume.contact.phone}</Text>
            <Text style={styles.contactSeparator}>|</Text>
            <Text style={styles.contactItem}>{resume.contact.location}</Text>
            {resume.contact.linkedin && (
              <>
                <Text style={styles.contactSeparator}>|</Text>
                <Text style={styles.contactItem}>
                  {resume.contact.linkedin}
                </Text>
              </>
            )}
            {resume.contact.website && (
              <>
                <Text style={styles.contactSeparator}>|</Text>
                <Text style={styles.contactItem}>
                  {resume.contact.website}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Summary */}
        {resume.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{resume.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {resume.experience.map((exp) => (
              <View key={exp.id} style={styles.experienceItem}>
                <View style={styles.expHeader}>
                  <Text style={styles.expTitle}>{exp.title}</Text>
                  <Text style={styles.expDates}>
                    {exp.startDate} — {exp.endDate}
                  </Text>
                </View>
                <Text style={styles.expCompany}>
                  {exp.company} · {exp.location}
                </Text>
                {exp.bullets.map((bullet, bIdx) => (
                  <View key={bIdx} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {resume.education.map((edu) => (
              <View key={edu.id} style={styles.eduItem}>
                <Text style={styles.eduDegree}>{edu.degree}</Text>
                <Text style={styles.eduSchool}>
                  {edu.school} · {edu.location}
                </Text>
                <Text style={styles.eduMeta}>
                  Graduated {edu.graduationDate}
                  {edu.gpa ? ` · GPA: ${edu.gpa}` : ""}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {resume.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
              {resume.skills.map((skill) => (
                <Text key={skill} style={styles.skillBadge}>
                  {skill}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Certifications */}
        {resume.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {resume.certifications.map((cert) => (
              <Text key={cert} style={styles.certItem}>
                • {cert}
              </Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
