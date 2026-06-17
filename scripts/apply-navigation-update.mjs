import fs from 'node:fs';

const mainPath = 'src/main.js';
let main = fs.readFileSync(mainPath, 'utf8');

const cvSections = [
  {
    title: 'DOR FELLOUS',
    items: [
      'Creative Director • Multidisciplinary Designer • Visual Artist',
      'Tel Aviv, Israel',
      '+972 54 998 5840',
      'dorfellous5@gmail.com',
      'www.dorfellous.com',
    ],
  },
  {
    title: 'Profile',
    items: [
      'Autodidact multidisciplinary creative professional with over a decade of experience spanning fashion, nightlife culture, visual arts, digital design, content creation, creative direction, and emerging technologies.',
      'Combining physical craftsmanship with digital tools, my practice bridges fashion, 3D design, AI workflows, creative storytelling, product development, and immersive visual experiences. My work has been presented internationally through exhibitions, fashion weeks, collaborations, performances, and digital platforms.',
    ],
  },
  {
    title: 'Professional Experience',
    items: [
      'Independent Designer & Creative Director',
      '2016 - Present',
      'Founder of an independent creative practice focused on fashion, wearable art, digital design, and product development.',
      'Services include: Creative Direction; Fashion Design; 3D Design & Prototyping; Product Development; Content Creation; Visual Identity Development; Digital Fashion; AI-Assisted Creative Workflows.',
      'Worked with: Artists; Performers; Television productions; Private clients; Fashion brands; Student and academic projects.',
      'Head Designer & Creative Director - WOOOOOF',
      '2023 - Present',
      'Designed seasonal and capsule collections; led brand creative direction; developed handmade and commercial products; collaborated with graphic designers and manufacturers; participated in event production and brand activations; oversaw collection development and production workflows.',
      'INN7 Fashion',
      '2023 - Present',
      'Avant-garde fashion importer and retailer. Responsibilities included store operations, inventory management, e-commerce, buying and sourcing, brand selection, merchandise management, and creative support.',
      'Restaurant & Hospitality Management',
      '2018 - 2023',
      'Management and operational roles including Soho House Jaffa TLV, Cafe Europa, Toni & Esther, and Herzl 16 (R2M Group). Responsibilities included team leadership, customer experience, operations management, staff supervision, and service management.',
    ],
  },
  {
    title: 'Selected Achievements',
    items: [
      'New York Fashion Week',
      'Winner of the Flying Solo x Fashion Week Online international competition. Presented collection at New York Fashion Week 2020-2021.',
      'International Digital Fashion Week (IDFW)',
      'Presented digital fashion collections internationally through IDFW.',
      'International Exhibitions & Collaborations',
      'Solo exhibition at Beit Romano, Tel Aviv; solo exhibition at Sputnik Bar, Tel Aviv; costume and prop collaborations for theater productions; collaborations with musicians, DJs, performers, and drag artists; creative projects for music videos and cultural productions.',
    ],
  },
  {
    title: 'Skills',
    items: [
      'Creative Direction: Brand Development; Visual Identity; Concept Development; Campaign Direction; Art Direction.',
      'Design: Fashion Design; Digital Fashion; 3D Modeling; Product Design; Wearable Art.',
      'Content Creation: Photography; Video Production; Motion Graphics; Storytelling; Social Media Content.',
      'Technology: AI Creative Workflows; 3D Printing; Rapid Prototyping; Digital Production Pipelines.',
    ],
  },
  {
    title: 'Software',
    items: [
      'Blender; Cinema 4D; ZBrush; Meshmixer; CLO3D; Adobe Photoshop; Microsoft Office Suite; Shopify; Magento.',
    ],
  },
  {
    title: 'Education',
    items: [
      'Shenkar College',
      'Sewing Course; Free Pattern Making Course.',
      'Additional education developed independently through self-directed learning, experimentation, and professional practice.',
    ],
  },
  {
    title: 'Communities & Culture',
    items: [
      'Over 10 years of active involvement in underground culture, electronic music communities, nightlife productions, alternative fashion, performance art, and queer and creative communities.',
    ],
  },
  {
    title: 'Languages',
    items: [
      'Hebrew - Native',
      'English - Professional Working Proficiency',
    ],
  },
];

const resumeSectionsSource = `const resumeSections = ${JSON.stringify(cvSections, null, 2)};\nconst socialLinks`;

main = main.replace(
  /const resumeSections = \[[\s\S]*?\];\nconst socialLinks/,
  resumeSectionsSource,
);

fs.writeFileSync(mainPath, main);
console.log('Approved CV content update applied.');
