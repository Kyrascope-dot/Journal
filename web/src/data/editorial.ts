export type EditorialMember = {
  id: string;
  name: string;
  /** Shown under the name, e.g. role or one-line credential */
  headline: string;
  /** Short educational line for the card */
  qualification: string;
  /** Optional role / institution / address; use \\n for line breaks */
  designation?: string;
  /** Optional contact emails (shown as mailto links on the card) */
  emails?: string[];
  /** Optional Google Scholar profile URL */
  scholarUrl?: string;
  /** Optional Scopus author profile URL */
  scopusUrl?: string;
  /** Optional ORCID profile URL */
  orcidUrl?: string;
  /** Optional LinkedIn profile URL */
  linkedinUrl?: string;
  /** Optional ResearchGate profile URL */
  researchGateUrl?: string;
  /** Optional RocketReach profile URL */
  rocketReachUrl?: string;
  /** Optional link to PhD awarded record (e.g. institutional PDF) */
  phdAwardedUrl?: string;
  /** Label for PhD awarded link */
  phdAwardedUrlLabel?: string;
  /** Optional institutional / faculty page URL */
  facultyUrl?: string;
  /** Label for the faculty / institutional link (e.g. “Great Lakes faculty page”) */
  facultyUrlLabel?: string;
  /** Path under /public; use null to always show placeholder */
  imageSrc: string | null;
  bioParagraphs: string[];
};

const PLACEHOLDER = "/editorial/placeholder-avatar.svg";

const DTU_HUMANITIES_PHD_AWARDED_URL =
  "https://dtu.ac.in/Web/Departments/Humanities/phd_awarded.pdf";

/**
 * Image files: add photos as /public/editorial/<filename>.
 * Supported: .jpg, .jpeg, .png, .webp — update `imageSrc` if your filenames differ.
 * Members without a file use the placeholder until you add an image.
 */
export const editorialTeam: EditorialMember[] = [
  {
    id: "japji-kaur",
    name: "Dr. Japji Kaur",
    headline: "Editor in Chief",
    qualification: "Ph.D. in Economics, Delhi Technological University",
    designation:
      "Guest Faculty (Economics), Delhi Technological University\nShahbad Daulatpur, Main Bawana Road, Rohini, New Delhi – 110042, India\n\nFormer Guest Faculty (Management), BML Munjal University.",
    emails: ["japjikaur_2k20phdhueco01@dtu.ac.in"],
    scholarUrl:
      "https://scholar.google.com/citations?user=r7M3fQgAAAAJ&hl=en",
    linkedinUrl: "https://in.linkedin.com/in/dr-japji-kaur-4b4aa2128",
    rocketReachUrl: "https://rocketreach.co/japji-kaur-email_860322276",
    phdAwardedUrl: DTU_HUMANITIES_PHD_AWARDED_URL,
    phdAwardedUrlLabel: "PhD awarded — DTU Humanities",
    imageSrc: "/editorial/japji-kaur.jpg",
    bioParagraphs: [
      "Dr. Japji Kaur is a data-driven research and analytics professional with a Ph.D. in Economics from Delhi Technological University. She specializes in empirical data analysis, quantitative research, and insight generation to support strategic decision-making across business and technology environments.",
      "With strong expertise in data analytics, statistical modeling, and consumer insight analysis, Dr. Kaur has experience transforming complex datasets into actionable insights that can support product development, marketing strategy, and technology-driven decision processes. She is proficient in analytical and programming tools including SPSS, STATA, R, Python, NVivo, and SmartPLS, enabling advanced data modeling, predictive analysis, and behavioral insights.",
      "Her professional experience also includes over six years of teaching and research at Delhi Technological University and academic collaboration with BML Munjal University, where she developed strong capabilities in data interpretation, research design, and analytical problem-solving.",
      "Dr. Kaur is particularly interested in roles at the intersection of technology, data analytics, and strategy, including marketing analytics, product analytics, research consulting, and technology development teams, where she can leverage data-driven methodologies to optimize business performance and user engagement.",
    ],
  },
  {
    id: "neha-dawar",
    name: "Dr. Neha Dawar",
    headline: "Managing Editor",
    qualification:
      "Ph.D. in Finance, Swiss School of Business and Management, Geneva, Switzerland",
    imageSrc: "/editorial/neha-dawar.jpeg",
    bioParagraphs: [
      "Dr. Neha Dawar is the Managing Editor of Global Confluence Review. She holds a Ph.D. in Finance from the Swiss School of Business and Management in Geneva, Switzerland.",
    ],
  },
  {
    id: "nand-kumar",
    name: "Prof. Nand Kumar",
    headline: "Editorial Board",
    qualification:
      "M.A. (JNU), Ph.D. (DTU). Specialization: Economics.",
    designation:
      "Professor and Head, Department of Humanities, Delhi Technological University\nDelhi, India",
    emails: ["nandkumar@dce.ac.in"],
    facultyUrl: "https://dtu.ac.in/Web/Departments/Humanities/about/",
    facultyUrlLabel: "Department of Humanities | Delhi Technological University",
    imageSrc: "/editorial/nand-kumar.jpeg",
    bioParagraphs: [
      "Prof. Nand Kumar is a Professor of Economics in the Department of Humanities at Delhi Technological University, Delhi, and is presently heading the department. He earned his M.A. in Economics from Jawaharlal Nehru University (JNU), Delhi, and his Ph.D. from Delhi Technological University (DTU), Delhi.",
      "He has published a number of seminal research papers in economics in international journals of repute. Currently there are 10 research scholars registered for Ph.D. under his supervision. Prior to joining DTU, Delhi, Prof. Kumar served as a probation officer in the Department of Home Jail in the province of Bihar.",
    ],
  },
  {
    id: "parthasarathi",
    name: "Prof. Parthasarathi",
    headline: "Editorial Board",
    qualification:
      "Physics; non-Hermitian quantum mechanics, complex phase space quantum mechanics, and plasmonics",
    designation:
      "Maharaja Agrasen College, University of Delhi\nDelhi, India\n\nFormer department head; Coordinator, ISRO START Program\nRecipient, Rosalind Fellowship (London Press, 2021)",
    imageSrc: "/editorial/prof-parthasarathi.jpeg",
    bioParagraphs: [
      "Professor Parthasarathi is an accomplished academic with over 24 years of teaching experience at Maharaja Agrasen College, University of Delhi. A pioneer in non-Hermitian quantum mechanics, he has made significant contributions through his research on complex phase space quantum mechanics and plasmonics. His work includes over 15 peer-reviewed publications in internationally recognized journals indexed in Scopus and Web of Science. He has served as a resource person and invited speaker at numerous national and international conferences. His leadership is evident from his multiple administrative roles including department head and coordinator for ISRO’s START Program. He is also a recipient of the prestigious Rosalind Fellowship awarded by London Press in 2021.",
      "In addition to his academic and research credentials, Prof. Parthasarathi has been instrumental in designing and revising several undergraduate physics curricula for IGNOU. His interdisciplinary interests include applying computational tools in plasmonics and quantum systems, as well as exploring the societal impact of social media through data mining. He has published thought-provoking articles on platforms like The Wire and OpIndia, showcasing his engagement with broader public discourse. His future vision focuses on establishing a research-driven, digitally empowered band of youth aligned with NEP 2020, emphasizing multidisciplinary learning, innovation, and inclusive education, with plans to collaborate with premier institutions.",
    ],
  },
  {
    id: "ishaan-sharma",
    name: "Dr. Ishaan Sharma",
    headline: "Editorial Board",
    qualification:
      "Ph.D. in Communication Engineering, Delhi Technological University",
    designation: "Guest Faculty, Indraprastha University\nDelhi, India",
    scholarUrl:
      "https://scholar.google.com/citations?user=eNlmb8kAAAAJ&hl=en",
    imageSrc: "/editorial/ishaansharma.jpeg",
    bioParagraphs: [
      "Dr. Sharma received his Ph.D. in Communication Engineering from Delhi Technological University (DTU). His research focuses on wireless communications, reconfigurable intelligent surfaces (RIS), multi-armed bandit algorithms, and hardware acceleration for intelligent communication systems. His work aims to develop efficient, adaptive, and energy-aware solutions for next-generation wireless networks.",
    ],
  },
  {
    id: "parveen-kumar",
    name: "Dr. Parveen Kumar",
    headline: "Associate Editor",
    qualification: "Ph.D. in Economics, NIT, Kurukshetra University",
    designation:
      "Guest Faculty, Shri Vishwakarma Skill University\nHaryana, India\n\nGuest Faculty, National Institute of Technology (NIT) Kurukshetra\nKurukshetra, Haryana, India",
    emails: ["facultyofash4@svsu.ac.in"],
    linkedinUrl: "https://www.linkedin.com/in/parveen-kumar-bhatt-a2432690",
    scopusUrl:
      "https://www.scopus.com/authid/detail.uri?authorId=58825793300",
    orcidUrl: "https://orcid.org/0000-0003-2333-9376",
    imageSrc: "/editorial/DrPraveen.jpeg",
    bioParagraphs: [
      "Dr. Parveen Kumar is Guest Faculty at Shri Vishwakarma Skill University and at the National Institute of Technology (NIT) Kurukshetra. He holds a Ph.D. in Economics from Kurukshetra University, with a research focus on regional growth and inequalities in India, particularly examining pre- and post-economic reform periods.",
      "Dr. Kumar qualified the UGC National Eligibility Test in 2012 and has a strong academic background in economics. His research expertise spans environmental economics, sustainable development, energy transition, economic growth, and inequality, with a particular focus on emerging economies including BRICS and the European Union.",
      "He has an impressive publication record in high-impact, peer-reviewed international journals such as Springer Nature, MDPI, and Frontiers. His work extensively explores themes like CO₂ emissions, environmental sustainability, FDI, and policy dynamics using advanced econometric techniques.",
      "Dr. Kumar is actively engaged in interdisciplinary research and has contributed significantly to the literature on climate change economics and development policy. His scholarly contributions are indexed in Scopus, reflecting his growing impact in the academic community.",
    ],
  },
  {
    id: "mariam-aloulou",
    name: "Dr. Mariam Aloulou",
    headline: "Associate Editor",
    qualification: "Assistant Professor, College of Business Administration",
    designation: "American University in the Emirates (AUE)",
    emails: ["Mariem.aloulou@aue.ae"],
    facultyUrl: "https://aue.ae/dr-mariem-aloulou/",
    facultyUrlLabel: "Institutional profile",
    scopusUrl:
      "https://www.scopus.com/authid/detail.uri?authorId=57734007200",
    imageSrc: "/editorial/mariam-aloulou.png",
    bioParagraphs: [
      "Dr. Mariam Aloulou is an Assistant Professor in the College of Business Administration at the American University in the Emirates (AUE).",
      "Dr. Aloulou holds several prestigious professional certifications, including a certification in FinTech from Harvard's VPAL and in Circular Economy and Sustainability Strategies from Cambridge Judge Business School. She is an active member of the academic community, serving as a reviewer for multiple journals and conferences. Her work has garnered recognition, and she has received multiple grants and awards for her research contributions, including research funding for projects on circular economy and sustainability.",
    ],
  },
  {
    id: "vishal-dagar",
    name: "Dr. Vishal Dagar",
    headline: "Associate Editor",
    qualification:
      "Economist and researcher; listed among the global top 2% of scientists (Elsevier–Stanford, 2023–2025)",
    designation:
      "Associate Professor, Great Lakes Institute of Management\nBilaspur-Tauru Road, Near Bilaspur Chowk, NH-8, Gurugram, Haryana 122413, India\n\nListed among the global top 2% of scientists (Elsevier–Stanford composite score, 2023–2025).\n75+ SSCI/SCI publications in 25+ journals; 1,500+ peer reviews for 250+ journals (FT 50; ABDC A*, A, B).",
    emails: ["vishal.d@greatlakes.edu.in"],
    facultyUrl: "https://www.greatlakes.edu.in/gurgaon/faculty/vishal-dagar",
    facultyUrlLabel: "Great Lakes faculty page",
    scholarUrl:
      "https://scholar.google.com/citations?user=oSyUY9txtr0C&hl=en",
    imageSrc: "/editorial/vishal-dagar.jpg",
    bioParagraphs: [
      "Dr. Vishal Dagar is an economist and researcher with more than five years of teaching and research experience across academia, policy, and industry. He is listed among the top 2% of scientists globally (Elsevier–Stanford composite score, 2023, 2024, and 2025).",
      "He has published more than 75 SSCI/SCI research papers in more than 25 leading journals and has reviewed more than 1,500 research papers for over 250 verified leading and reputed journals (FT 50; ABDC: A*, A, and B), including the Journal of Business Ethics, Energy Economics, Energy Policy, International Review of Financial Analysis, International Review of Economics & Finance, Review of International Business & Finance, Technological Forecasting & Social Change, Economic Analysis & Policy, Finance Research Letters, Socio-Economic Planning Sciences, European Management Journal, Management Decision, Resources Policy, Structural Change & Economic Dynamics, and others.",
    ],
  },
  {
    id: "tayyaba-rani",
    name: "Dr. Tayyaba Rani",
    headline: "Associate Editor",
    qualification: "Ph.D., Xi’an Jiaotong University, China",
    designation:
      "Xi'an Jiaotong University\nNo. 28, Xianning West Road, Beilin District, Xi'an City, Shaanxi Province, P.R. China 710049\n\nFormer employment:\nCommerce Lecturer (Commerce), Government College University Faisalabad\nFaisalabad, Punjab, Pakistan · August 2014 – January 2018",
    emails: ["tayyabarani@stu.xjtu.edu.cn"],
    facultyUrl: "https://www.xjtu.edu.cn/en",
    facultyUrlLabel: "Xi'an Jiaotong University",
    scholarUrl: "https://scholar.google.com/citations?user=CpvcUiIAAAAJ&hl=en",
    researchGateUrl:
      "https://www.researchgate.net/profile/Tayyaba-Rani-2?ev=hdr_xprf",
    orcidUrl: "https://orcid.org/0000-0002-4094-6808",
    imageSrc: "/editorial/tayyaba-rani.jpg",
    bioParagraphs: [
      "Dr. Tayyaba Rani is an applied economics researcher with a Ph.D. from Xi’an Jiaotong University, China, specializing in energy economics, environmental sustainability, and financial development. Her research focuses on the dynamic interplay between digitalization, green investment, financial inclusion, and sustainable economic growth, with a particular emphasis on South Asian and emerging economies.",
      "With extensive expertise in empirical and quantitative research, Dr. Rani is proficient in advanced econometric techniques and statistical tools, including R, Stata, and EViews, enabling robust data analysis and policy-relevant insights. She has authored more than 19 publications in high-impact international journals such as Technology in Society, Energy Policy, Resources Policy, and Environmental Progress & Sustainable Energy.",
      "Dr. Rani also brings valuable academic experience, having taught finance, accounting, and economics courses at both undergraduate and graduate levels. She previously served as Commerce Lecturer at Government College University Faisalabad, Punjab, Pakistan (August 2014 – January 2018). Her research contributions aim to inform evidence-based policymaking and promote sustainable development through interdisciplinary and data-driven approaches.",
      "Her editorial and research interests lie at the intersection of energy economics, environmental policy, digital transformation, and sustainable development, where she seeks to contribute to advancing high-quality academic scholarship and impactful research dissemination.",
    ],
  },
  {
    id: "diksha-arora",
    name: "Dr. Diksha Arora",
    headline: "Associate Editor",
    qualification: "Ph.D., Delhi Technological University",
    designation:
      "Adjunct Professor — Economics, Bergen Community College\nParamus, New Jersey, USA\n\nGuest Faculty (Economics), Delhi Technological University\nBawana Rd, Delhi Technological University, Shahbad Daulatpur Village, Rohini, New Delhi, Delhi 110042, India",
    emails: ["darora@bergen.edu", "dikshaarora_2k21phdhueco02@dtu.ac.in"],
    linkedinUrl: "https://www.linkedin.com/in/dr-diksha-arora-a31661146",
    researchGateUrl: "https://www.researchgate.net/profile/Diksha-Arora-4",
    phdAwardedUrl: DTU_HUMANITIES_PHD_AWARDED_URL,
    phdAwardedUrlLabel: "PhD awarded — DTU Humanities",
    imageSrc: "/editorial/diksha-arora.jpg",
    bioParagraphs: [
      "Dr. Diksha Arora is an accomplished Economics educator and researcher who holds a Ph.D. from Delhi Technological University, with a focus on tech startups in the Delhi-NCR region. She is Adjunct Professor of Economics at Bergen Community College, Paramus, New Jersey. She has served as faculty at DTU and the University of Delhi, demonstrating strong teaching capability across diverse domains of economics. With top-tier academic achievements including a Junior Research Fellowship (AIR 4) and multiple research publications, Dr. Arora combines deep subject knowledge with practical experience. She is also certified in UGC-NET and CTET, proficient in digital teaching tools, and actively engaged in academic development through workshops, internships, and extracurricular activities. Known for her collaborative spirit and interdisciplinary outlook, she contributes effectively to diverse academic and research initiatives.",
    ],
  },
];

export { PLACEHOLDER };
