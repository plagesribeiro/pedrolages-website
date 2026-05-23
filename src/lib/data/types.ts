export type Locale = 'pt' | 'en';

export type L10n<T = string> = { pt: T; en: T };

export interface ResumeLink {
  github: string;
  linkedin: string;
  lattes?: string;
  instagram?: string;
  twitter?: string;
  whatsapp?: string;
  kofi?: string;
}

export interface Education {
  degree: L10n;
  institution: string;
  start: string;
  end?: string;
  status: 'completed' | 'in-progress';
  note?: L10n;
  skills?: L10n<string[]>;
}

export interface Experience {
  company: string;
  role: L10n;
  start: string;
  end?: string;
  current?: boolean;
  founded?: boolean;
  remote?: boolean;
  endedWith?: 'acquired' | 'shutdown' | 'left';
  summary: L10n;
  bullets?: L10n<string[]>;
  tags: string[];
}

export interface Skills {
  ai: L10n<string[]>;
  leadership: L10n<string[]>;
  stack: L10n<string[]>;
  infra: L10n<string[]>;
}

export interface Resume {
  name: string;
  handle: string;
  headline: L10n;
  taglines: L10n<string[]>;
  location: L10n;
  email: string;
  links: ResumeLink;
  careerStart: string;
  aiStart: string;
  bio: L10n<string[]>;
  education: Education[];
  experience: Experience[];
  skills: Skills;
  highlights: L10n<string[]>;
}
