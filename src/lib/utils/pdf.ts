import jsPDF from 'jspdf';
import type { Resume, Locale } from '$lib/data/types';
import { formatRange, yearsSince } from './dates';

const COLORS = {
  text: '#0a0a0a',
  muted: '#525252',
  contentAccent: '#306230',
  rule: '#d4d4d4',
  sidebarBg: '#1a1a1a',
  sidebarText: '#e5e5e5',
  sidebarMuted: '#a3a3a3',
  sidebarAccent: '#9bbc0f',
  sidebarRule: '#3a3a3a'
};

const SIDEBAR_W = 62;
const SIDEBAR_PAD = 7;
const CONTENT_X = SIDEBAR_W + 10;
const TOP_MARGIN = 14;
const BOTTOM_MARGIN = 14;
const RIGHT_MARGIN = 12;

function setFont(doc: jsPDF, weight: 'normal' | 'bold' = 'normal', size = 10, color = COLORS.text) {
  doc.setFont('helvetica', weight);
  doc.setFontSize(size);
  doc.setTextColor(color);
}

/** jsPDF's default helvetica doesn't carry glyphs outside CP1252 — replace the
 * Unicode arrow with a single right-pointing angle that IS in the font. */
function safe(text: string): string {
  return text.replace(/→/g, '›');
}

function safeText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  opts?: Parameters<jsPDF['text']>[3]
): void {
  doc.text(safe(text), x, y, opts);
}

function writeWrapped(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight = 5
): number {
  const lines = doc.splitTextToSize(safe(text), maxWidth);
  for (const line of lines) {
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

function paintSidebar(doc: jsPDF) {
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(COLORS.sidebarBg);
  doc.rect(0, 0, SIDEBAR_W, pageHeight, 'F');
}

function sectionHeader(
  doc: jsPDF,
  label: string,
  y: number,
  pageWidth: number,
  contentWidth: number
): number {
  setFont(doc, 'bold', 12, COLORS.contentAccent);
  safeText(doc, label.toUpperCase(), CONTENT_X, y);
  doc.setDrawColor(COLORS.rule);
  doc.setLineWidth(0.3);
  doc.line(CONTENT_X, y + 1.5, CONTENT_X + contentWidth, y + 1.5);
  return y + 7;
}

function addPageWithSidebar(doc: jsPDF): number {
  doc.addPage();
  paintSidebar(doc);
  return TOP_MARGIN;
}

function maybeNewPage(doc: jsPDF, y: number, pageHeight: number, needed = 20): number {
  if (y + needed > pageHeight - BOTTOM_MARGIN) {
    return addPageWithSidebar(doc);
  }
  return y;
}

const LABELS = {
  pt: {
    contact: 'Contato',
    summary: 'Sobre',
    experience: 'Trajetória',
    education: 'Educação',
    skills: 'Skills',
    stats: 'Stats',
    ai: 'IA & ML',
    leadership: 'Liderança',
    stack: 'Stack',
    infra: 'Infra',
    founded: 'fundei',
    current: 'atual',
    acquired: 'adquirida',
    shutdown: 'encerrada',
    remote: 'remoto',
    yearsBuilding: (n: number) => `${n} ano${n === 1 ? '' : 's'} construindo software`,
    yearsAi: (n: number) => `${n} ano${n === 1 ? '' : 's'} com IA`,
    inProgress: 'em andamento'
  },
  en: {
    contact: 'Contact',
    summary: 'About',
    experience: 'Journey',
    education: 'Education',
    skills: 'Skills',
    stats: 'Stats',
    ai: 'AI & ML',
    leadership: 'Leadership',
    stack: 'Stack',
    infra: 'Infra',
    founded: 'founder',
    current: 'current',
    acquired: 'acquired',
    shutdown: 'shut down',
    remote: 'remote',
    yearsBuilding: (n: number) => `${n} year${n === 1 ? '' : 's'} building software`,
    yearsAi: (n: number) => `${n} year${n === 1 ? '' : 's'} working with AI`,
    inProgress: 'in progress'
  }
};

type LabelSet = (typeof LABELS)['pt'];

async function fetchImageAsDataURL(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function drawSidebarHeader(
  doc: jsPDF,
  resume: Resume,
  locale: Locale,
  labels: LabelSet,
  photoDataUrl: string | null
): void {
  let y = TOP_MARGIN;

  if (photoDataUrl) {
    const size = SIDEBAR_W - SIDEBAR_PAD * 2 - 6;
    const x = (SIDEBAR_W - size) / 2;
    doc.setFillColor(COLORS.sidebarRule);
    doc.roundedRect(x - 1, y - 1, size + 2, size + 2, 3, 3, 'F');
    doc.addImage(photoDataUrl, 'PNG', x, y, size, size, undefined, 'FAST');
    y += size + 8;
  }

  const innerW = SIDEBAR_W - SIDEBAR_PAD * 2;

  setFont(doc, 'bold', 11, COLORS.sidebarText);
  const nameLines = doc.splitTextToSize(safe(resume.name), innerW);
  for (const line of nameLines) {
    doc.text(line, SIDEBAR_PAD, y);
    y += 5;
  }

  setFont(doc, 'normal', 8, COLORS.sidebarAccent);
  const handleLines = doc.splitTextToSize(safe(`@${resume.handle}`), innerW);
  for (const line of handleLines) {
    doc.text(line, SIDEBAR_PAD, y);
    y += 4;
  }
  y += 4;

  y = drawSidebarSection(doc, labels.contact, y);
  setFont(doc, 'normal', 7, COLORS.sidebarText);
  const contactItems = [
    resume.email,
    resume.links.linkedin.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    resume.links.github.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    resume.links.lattes ? resume.links.lattes.replace(/^https?:\/\//, '') : '',
    resume.location[locale]
  ].filter(Boolean);
  for (const item of contactItems) {
    const lines = doc.splitTextToSize(safe(item), innerW);
    for (const line of lines) {
      doc.text(line, SIDEBAR_PAD, y);
      y += 3.3;
    }
    y += 1;
  }
  y += 3;

  const skillGroups: [string, string[]][] = [
    [labels.ai, resume.skills.ai[locale]],
    [labels.leadership, resume.skills.leadership[locale]],
    [labels.stack, resume.skills.stack[locale]],
    [labels.infra, resume.skills.infra[locale]]
  ];

  y = drawSidebarSection(doc, labels.skills, y);
  for (const [groupLabel, items] of skillGroups) {
    if (!items.length) continue;
    setFont(doc, 'bold', 7.5, COLORS.sidebarAccent);
    safeText(doc, groupLabel, SIDEBAR_PAD, y);
    y += 3.5;
    setFont(doc, 'normal', 7, COLORS.sidebarText);
    const text = items.join(' · ');
    y = writeWrapped(doc, text, SIDEBAR_PAD, y, innerW, 3.3);
    y += 2.5;
  }
  y += 2;

  y = drawSidebarSection(doc, labels.stats, y);
  setFont(doc, 'normal', 7.5, COLORS.sidebarText);
  const years = yearsSince(resume.careerStart);
  const aiYears = yearsSince(resume.aiStart);
  for (const stat of [labels.yearsBuilding(years), labels.yearsAi(aiYears)]) {
    const lines = doc.splitTextToSize(safe(stat), innerW);
    for (const line of lines) {
      doc.text(line, SIDEBAR_PAD, y);
      y += 3.5;
    }
    y += 1;
  }
}

function drawSidebarSection(doc: jsPDF, label: string, y: number): number {
  setFont(doc, 'bold', 8, COLORS.sidebarAccent);
  safeText(doc, label.toUpperCase(), SIDEBAR_PAD, y);
  doc.setDrawColor(COLORS.sidebarRule);
  doc.setLineWidth(0.2);
  doc.line(SIDEBAR_PAD, y + 1.2, SIDEBAR_W - SIDEBAR_PAD, y + 1.2);
  return y + 5;
}

export async function generateResumePDF(resume: Resume, locale: Locale): Promise<jsPDF> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const labels = LABELS[locale];
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - CONTENT_X - RIGHT_MARGIN;

  const photoDataUrl = await fetchImageAsDataURL('/photo.png');

  paintSidebar(doc);
  drawSidebarHeader(doc, resume, locale, labels, photoDataUrl);

  let y = TOP_MARGIN;

  setFont(doc, 'bold', 20);
  safeText(doc, resume.name, CONTENT_X, y + 4);
  y += 8;

  setFont(doc, 'normal', 10, COLORS.muted);
  safeText(doc, resume.headline[locale], CONTENT_X, y + 4);
  y += 9;

  doc.setDrawColor(COLORS.rule);
  doc.setLineWidth(0.4);
  doc.line(CONTENT_X, y, CONTENT_X + contentWidth, y);
  y += 6;

  y = sectionHeader(doc, labels.summary, y, pageWidth, contentWidth);
  setFont(doc, 'normal', 10);
  for (const para of resume.bio[locale]) {
    y = writeWrapped(doc, para, CONTENT_X, y, contentWidth, 5);
    y += 2;
  }
  y += 3;

  y = maybeNewPage(doc, y, pageHeight, 30);
  y = sectionHeader(doc, labels.experience, y, pageWidth, contentWidth);
  for (const exp of resume.experience) {
    y = maybeNewPage(doc, y, pageHeight, 24);

    setFont(doc, 'bold', 11);
    safeText(doc, exp.company, CONTENT_X, y);
    setFont(doc, 'normal', 9, COLORS.muted);
    const range = formatRange(exp.start, exp.end, exp.current, locale);
    safeText(doc, range, CONTENT_X + contentWidth, y, { align: 'right' });
    y += 5;

    setFont(doc, 'normal', 10);
    const role = exp.role[locale];
    const badges: string[] = [];
    if (exp.current) badges.push(labels.current);
    if (exp.founded) badges.push(labels.founded);
    if (exp.remote) badges.push(labels.remote);
    if (exp.endedWith === 'acquired') badges.push(labels.acquired);
    if (exp.endedWith === 'shutdown') badges.push(labels.shutdown);
    const roleLine = badges.length ? `${role}  ·  ${badges.join(' · ')}` : role;
    y = writeWrapped(doc, roleLine, CONTENT_X, y, contentWidth, 4.8);

    setFont(doc, 'normal', 9.5, '#404040');
    y = writeWrapped(doc, exp.summary[locale], CONTENT_X, y, contentWidth, 4.8);
    y += 4;
  }

  y = maybeNewPage(doc, y, pageHeight, 30);
  y = sectionHeader(doc, labels.education, y, pageWidth, contentWidth);
  for (const edu of resume.education) {
    y = maybeNewPage(doc, y, pageHeight, 22);
    setFont(doc, 'bold', 10.5);
    safeText(doc, edu.institution, CONTENT_X, y);
    setFont(doc, 'normal', 9, COLORS.muted);
    const range =
      edu.status === 'in-progress'
        ? `${edu.start} › ${labels.inProgress}`
        : `${edu.start} › ${edu.end ?? ''}`;
    safeText(doc, range, CONTENT_X + contentWidth, y, { align: 'right' });
    setFont(doc, 'normal', 10);
    y += 4.5;
    safeText(doc, edu.degree[locale], CONTENT_X, y);
    y += 5;
    if (edu.note) {
      setFont(doc, 'normal', 9.5, '#404040');
      y = writeWrapped(doc, edu.note[locale], CONTENT_X, y, contentWidth, 4.6);
    }
    if (edu.skills) {
      y += 0.5;
      const label = 'Skills:';
      setFont(doc, 'bold', 9, '#404040');
      safeText(doc, label, CONTENT_X, y);
      const labelWidth = doc.getTextWidth(label + ' ');
      setFont(doc, 'normal', 9, '#404040');
      y = writeWrapped(
        doc,
        edu.skills[locale].join(' · '),
        CONTENT_X + labelWidth,
        y,
        contentWidth - labelWidth,
        4.5
      );
    }
    y += 5;
  }

  return doc;
}

export async function downloadResumePDF(resume: Resume, locale: Locale): Promise<void> {
  const doc = await generateResumePDF(resume, locale);
  const slug = resume.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  doc.save(`${slug}-cv-${locale}.pdf`);
}
