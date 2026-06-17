import fs from 'node:fs';

const mainPath = 'src/main.js';
let main = fs.readFileSync(mainPath, 'utf8');

const linksSource = `const socialLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/dorfellous/' },
  { label: 'LinkedIn', href: 'https://il.linkedin.com/in/dor-fellous-397a761a8' },
  { label: 'Email', href: 'mailto:DorFellous5@gmail.com' },
];
const cleanPdfTitles`;

main = main.replace(
  /const socialLinks = \[[\s\S]*?\];\nconst cleanPdfTitles/,
  linksSource,
);

fs.writeFileSync(mainPath, main);
console.log('Approved Links content update applied.');
