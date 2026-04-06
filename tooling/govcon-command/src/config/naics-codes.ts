/**
 * NAICS codes relevant to True North Data Strategies
 * All codes are real and based on Bureau of Labor Statistics
 */

export interface NAICSCode {
  code: string;
  title: string;
  description: string;
  primary: boolean;
}

export const NAICS_CODES: NAICSCode[] = [
  {
    code: "541511",
    title: "Custom Computer Programming Services",
    description:
      "Establishments primarily engaged in planning, designing, and programming computer systems to the specifications of a client within the clients own facilities.",
    primary: true,
  },
  {
    code: "541512",
    title: "Computer Systems Design Services",
    description:
      "Establishments primarily engaged in planning and designing computer systems that integrate computer hardware, software, and communication technologies.",
    primary: true,
  },
  {
    code: "541519",
    title: "Other Computer Related Services",
    description:
      "Establishments primarily engaged in providing computer-related services (not elsewhere classified), including data recovery services, website design and related data processing services.",
    primary: true,
  },
  {
    code: "541611",
    title: "Administrative Management and General Management Consulting Services",
    description:
      "Establishments primarily engaged in providing administrative and general management consulting services to businesses and other organizations.",
    primary: true,
  },
  {
    code: "541690",
    title: "Other Scientific and Technical Consulting Services",
    description:
      "Establishments primarily engaged in providing specialized consultancy and advisory services in science and technology (not elsewhere classified).",
    primary: false,
  },
  {
    code: "518210",
    title: "Data Processing, Hosting, and Related Services",
    description:
      "Establishments primarily engaged in providing data processing services or hosting and related services such as application hosting, web hosting, and managed services.",
    primary: false,
  },
  {
    code: "611430",
    title: "Professional and Management Development Training",
    description:
      "Establishments primarily engaged in offering short courses of instruction in professional, technical, and management fields outside of a formal degree program.",
    primary: false,
  },
];

export function getNAICSByCode(code: string): NAICSCode | undefined {
  return NAICS_CODES.find((naics) => naics.code === code);
}

export function getPrimaryNAICS(): NAICSCode[] {
  return NAICS_CODES.filter((naics) => naics.primary);
}
