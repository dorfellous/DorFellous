import fs from 'node:fs';

const dataPath = 'public/data/portfolio-sections.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const about = data.sections.find((section) => section.id === 'about');

if (!about) {
  throw new Error('About section not found.');
}

about.blocks = [
  {
    type: 'heading',
    text: 'DOR FELLOUS',
  },
  {
    type: 'text',
    text: 'Creative Director • Visual Artist • Content Creator',
  },
  {
    type: 'text',
    text: 'Working across fashion, nightlife, digital culture, music communities, AI, 3D, and visual storytelling.',
  },
  {
    type: 'text',
    text: 'For over a decade, I have been actively involved in underground and alternative culture through fashion design, nightlife productions, artist collaborations, digital content, and experimental visual projects.',
  },
  {
    type: 'text',
    text: 'My work focuses on building visual identities, creating immersive content, and translating cultural movements into compelling visual experiences.',
  },
  {
    type: 'text',
    text: 'By combining physical craftsmanship, emerging technologies, and contemporary culture, I create projects that connect fashion, art, design, and digital experiences.',
  },
];

fs.writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`);
console.log('Approved About copy update applied.');
