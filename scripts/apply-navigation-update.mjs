import fs from 'node:fs';

const mainPath = 'src/main.js';
const stylePath = 'src/style.css';
const indexPath = 'index.html';
let main = fs.readFileSync(mainPath, 'utf8');
let style = fs.readFileSync(stylePath, 'utf8');
let index = fs.readFileSync(indexPath, 'utf8');

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

if (!main.includes('const aboutProfileImageSrc = getAboutProfileImageSrc();')) {
  main = main.replace(
    'const portfolioPdfSrc = getPortfolioPdfSrc();\n',
    'const portfolioPdfSrc = getPortfolioPdfSrc();\nconst aboutProfileImageSrc = getAboutProfileImageSrc();\n',
  );
}

if (!main.includes('class="about-profile-image reveal-item"')) {
  main = main.replace(
    '      ${renderBlocks(aboutBlocks)}\n    </section>',
    `      \${renderBlocks(aboutBlocks)}
      <figure class="about-profile-image reveal-item">
        <img src="\${aboutProfileImageSrc}" alt="Dor Fellous profile portrait" loading="lazy" decoding="async">
      </figure>
    </section>`,
  );
}

if (!main.includes('function getAboutProfileImageSrc()')) {
  main = `${main.trimEnd()}

function getAboutProfileImageSrc() {
  const encodedImageName = 'website%20profile%20image%20.JPG';
  if (import.meta.env?.BASE_URL) return ` + '`${basePath}assets/profile/${encodedImageName}`' + `;
  return ` + '`./${encodedImageName}`' + `;
}
`;
}

if (!style.includes('.about-profile-image')) {
  style = style.replace(
    `.category-content--about .text-flow {
  width: min(100%, 680px);
  margin: 0 auto;
}
`,
    `.category-content--about .text-flow {
  width: min(100%, 680px);
  margin: 0 auto;
}

.about-profile-image {
  width: min(100%, 680px);
  margin: clamp(34px, 6vw, 72px) auto 0;
}

.about-profile-image img {
  display: block;
  width: 100%;
  height: auto;
  max-height: min(76vh, 860px);
  object-fit: contain;
}
`,
  );
}

index = index.replace(
  /\.\/src\/main\.js(?:\?v=[^"']*)?/,
  './src/main.js?v=about-profile-20260617',
);

fs.writeFileSync(mainPath, main);
fs.writeFileSync(stylePath, style);
fs.writeFileSync(indexPath, index);
console.log('Approved Links and About profile image updates applied.');
