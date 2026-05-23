import jsPDF from 'jspdf';
import type { Resume, Locale } from '$lib/data/types';
import { formatRange, yearsSince } from './dates';

const COLORS = {
  text: '#0a0a0a',
  muted: '#525252',
  accent: '#306230',
  rule: '#d4d4d4'
};

const MARGIN = 16;

function setFont(doc: jsPDF, weight: 'normal' | 'bold' = 'normal', size = 10) {
  doc.setFont('helvetica', weight);
  doc.setFontSize(size);
  doc.setTextColor(COLORS.text);
}

function writeWrapped(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight = 5): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  for (const line of lines) {
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

function sectionHeader(doc: jsPDF, label: string, y: number, pageWidth: number): number {
  setFont(doc, 'bold', 12);
  doc.setTextColor(COLORS.accent);
  doc.text(label.toUpperCase(), MARGIN, y);
  doc.setDrawColor(COLORS.rule);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y + 1.5, pageWidth - MARGIN, y + 1.5);
  doc.setTextColor(COLORS.text);
  return y + 7;
}

function maybeNewPage(doc: jsPDF, y: number, pageHeight: number, needed = 20): number {
  if (y + needed > pageHeight - MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

const LABELS = {
  pt: {
    contact: 'Contato',
    summary: 'Sobre',
    experience: 'Experiência',
    education: 'Educação',
    skills: 'Habilidades',
    ai: 'IA & ML',
    languages: 'Linguagens',
    frameworks: 'Frameworks',
    infra: 'Infra',
    founded: 'fundei',
    current: 'atual',
    acquired: 'adquirida',
    shutdown: 'encerrada',
    remote: 'remoto',
    yearsBuilding: (n: number) => `${n} ano${n === 1 ? '' : 's'} construindo software`,
    yearsAi: (n: number) => `${n} ano${n === 1 ? '' : 's'} com IA`
  },
  en: {
    contact: 'Contact',
    summary: 'About',
    experience: 'Experience',
    education: 'Education',
    skills: 'Skills',
    ai: 'AI & ML',
    languages: 'Languages',
    frameworks: 'Frameworks',
    infra: 'Infra',
    founded: 'founder',
    current: 'current',
    acquired: 'acquired',
    shutdown: 'shut down',
    remote: 'remote',
    yearsBuilding: (n: number) => `${n} year${n === 1 ? '' : 's'} building software`,
    yearsAi: (n: number) => `${n} year${n === 1 ? '' : 's'} working with AI`
  }
} as const;

export function generateResumePDF(resume: Resume, locale: Locale): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const labels = LABELS[locale];
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGIN * 2;
  let y = MARGIN;

  // Header — name
  setFont(doc, 'bold', 22);
  doc.text(resume.name, MARGIN, y + 4);
  y += 8;

  setFont(doc, 'normal', 10);
  doc.setTextColor(COLORS.muted);
  doc.text(resume.headline[locale], MARGIN, y + 4);
  y += 7;

  // Contact line
  setFont(doc, 'normal', 9);
  doc.setTextColor(COLORS.muted);
  const contact = [
    resume.location[locale],
    resume.email,
    resume.links.linkedin.replace(/^https?:\/\//, ''),
    resume.links.github.replace(/^https?:\/\//, ''),
    resume.links.lattes ? resume.links.lattes.replace(/^https?:\/\//, '') : ''
  ]
    .filter(Boolean)
    .join('  ·  ');
  doc.text(contact, MARGIN, y + 4);
  y += 8;

  // Stats line
  const years = yearsSince(resume.careerStart);
  const aiYears = yearsSince(resume.aiStart);
  setFont(doc, 'normal', 9);
  doc.setTextColor(COLORS.accent);
  doc.text(`${labels.yearsBuilding(years)}  ·  ${labels.yearsAi(aiYears)}`, MARGIN, y + 4);
  doc.setTextColor(COLORS.text);
  y += 8;

  // About
  y = sectionHeader(doc, labels.summary, y, pageWidth);
  setFont(doc, 'normal', 10);
  for (const para of resume.bio[locale]) {
    y = writeWrapped(doc, para, MARGIN, y, contentWidth, 5);
    y += 2;
  }
  y += 3;

  // Experience
  y = maybeNewPage(doc, y, pageHeight, 30);
  y = sectionHeader(doc, labels.experience, y, pageWidth);
  for (const exp of resume.experience) {
    y = maybeNewPage(doc, y, pageHeight, 22);
    setFont(doc, 'bold', 11);
    doc.text(exp.company, MARGIN, y);
    setFont(doc, 'normal', 9);
    doc.setTextColor(COLORS.muted);
    const range = formatRange(exp.start, exp.end, exp.current, locale);
    doc.text(range, pageWidth - MARGIN, y, { align: 'right' });
    y += 5;

    setFont(doc, 'normal', 10);
    doc.setTextColor(COLORS.text);
    const role = exp.role[locale];
    const badges: string[] = [];
    if (exp.current) badges.push(labels.current);
    if (exp.founded) badges.push(labels.founded);
    if (exp.remote) badges.push(labels.remote);
    if (exp.endedWith === 'acquired') badges.push(labels.acquired);
    if (exp.endedWith === 'shutdown') badges.push(labels.shutdown);
    const roleLine = badges.length ? `${role}  ·  ${badges.join(' · ')}` : role;
    doc.text(roleLine, MARGIN, y);
    y += 5;

    setFont(doc, 'normal', 9.5);
    doc.setTextColor('#404040');
    y = writeWrapped(doc, exp.summary[locale], MARGIN, y, contentWidth, 4.8);
    doc.setTextColor(COLORS.text);
    y += 3;
  }
  y += 2;

  // Education
  y = maybeNewPage(doc, y, pageHeight, 25);
  y = sectionHeader(doc, labels.education, y, pageWidth);
  for (const edu of resume.education) {
    y = maybeNewPage(doc, y, pageHeight, 12);
    setFont(doc, 'bold', 10.5);
    doc.text(edu.institution, MARGIN, y);
    setFont(doc, 'normal', 9);
    doc.setTextColor(COLORS.muted);
    const range =
      edu.status === 'in-progress'
        ? `${edu.start} → ${locale === 'pt' ? 'em andamento' : 'in progress'}`
        : `${edu.start} → ${edu.end ?? ''}`;
    doc.text(range, pageWidth - MARGIN, y, { align: 'right' });
    setFont(doc, 'normal', 10);
    doc.setTextColor(COLORS.text);
    y += 4.5;
    doc.text(edu.degree[locale], MARGIN, y);
    y += 6;
  }

  // Skills
  y = maybeNewPage(doc, y, pageHeight, 30);
  y = sectionHeader(doc, labels.skills, y, pageWidth);
  const groups: [string, string[]][] = [
    [labels.ai, resume.skills.ai],
    [labels.languages, resume.skills.languages],
    [labels.frameworks, resume.skills.frameworks],
    [labels.infra, resume.skills.infra]
  ];
  for (const [label, items] of groups) {
    if (!items.length) continue;
    y = maybeNewPage(doc, y, pageHeight, 10);
    setFont(doc, 'bold', 10);
    doc.text(`${label}:`, MARGIN, y);
    setFont(doc, 'normal', 10);
    const labelWidth = doc.getTextWidth(`${label}: `);
    y = writeWrapped(doc, items.join(' · '), MARGIN + labelWidth, y, contentWidth - labelWidth, 5);
    y += 1.5;
  }

  return doc;
}

export function downloadResumePDF(resume: Resume, locale: Locale): void {
  const doc = generateResumePDF(resume, locale);
  const slug = resume.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  doc.save(`${slug}-cv-${locale}.pdf`);
}
