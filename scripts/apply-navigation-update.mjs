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
const pressLinks = [
  { label: 'Time Out', href: 'https://timeout.co.il/%D7%94%D7%90%D7%A0%D7%A9%D7%99%D7%9D-%D7%A9%D7%A2%D7%95%D7%A9%D7%99%D7%9D-%D7%93%D7%95%D7%A8-%D7%A4%D7%9C%D7%95%D7%A1/' },
  { label: 'XNET', href: 'https://xnet.ynet.co.il/articles/0,7340,L-5790218,00.html' },
  { label: 'FAB UK Magazine', href: 'https://fabukmagazine.com/international-digital-fashion-week-idfw-fall-winter-2021/' },
  { label: 'Fashion Week Online', href: 'https://fashionweekonline.com/fwo-x-mikeysline-x-flying-solo-competition-winners' },
  { label: 'WOOOOOF', href: 'https://www.wooooof.com/product/dor-hat?image=3' },
  { label: 'INN7', href: 'https://inn7fashion.co.il/collections/dor-fellous?srsltid=AfmBOopUHgp-IhloFUVkBeDU9tu1etbLUNR7D5BoSyqhVSSsaZ1orWbZ' },
  { label: 'Arca', href: 'https://www.instagram.com/p/C2H-ar_NSUr/?igsh=ajAydWRucGczOGE4' },
  { label: 'Static', href: 'https://www.instagram.com/p/CpPUB-Yj4fq/?igsh=c3Z0aXh1ZnpidHF3' },
  { label: 'Ellesse', href: 'https://www.instagram.com/p/CftjuENIIbi/?igsh=MWxud2p5cXBxbWcxMg==' },
  { label: 'Podcast', href: 'https://www.youtube.com/watch?v=OMh9pprW-3Y' },
];
const cleanPdfTitles`;

main = main.replace(
  /const socialLinks = \[[\s\S]*?\];\n(?:const pressLinks = \[[\s\S]*?\];\n)?const cleanPdfTitles/,
  linksSource,
);

const softwareSection = `  {
    "title": "Software",
    "items": [
      "Blender; Cinema 4D; ZBrush; Meshmixer; CLO3D; Adobe Photoshop; Microsoft Office Suite; Shopify; Magento; Nomad Sculpt; Cura; Runway; Codex; Gemini."
    ]
  }`;

main = main.replace(
  /  \{\n    "title": "Software",\n    "items": \[\n[\s\S]*?\n    \]\n  \}/,
  softwareSection,
);

const educationSection = `  {
    "title": "Education",
    "items": [
      "Autodidact",
      "Primarily self-taught across fashion design, garment construction, digital design, 3D workflows, content creation, AI tools, and creative direction through independent research, experimentation, and professional practice.",
      "2016 – Sewing Course",
      "Short sewing course through the External Studies Department, Shenkar College. This was not a degree program, and I did not study for a degree at Shenkar."
    ]
  }`;

main = main.replace(
  /  \{\n    "title": "Education",\n    "items": \[\n[\s\S]*?\n    \]\n  \}/,
  educationSection,
);

main = main.replace(
  /\{ id: 'contact', label: 'Contact' \}/g,
  "{ id: 'press', label: 'Press' }",
);

main = main.replace(
  "if (category === 'contact') return renderContactCategory();",
  "if (category === 'press') return renderPressCategory();",
);

const pressRenderer = `function renderPressCategory() {
  return ` + '`' + `
    <section class="category-content category-content--press reveal-item" aria-labelledby="press-title">
      <header class="category-content-header">
        <p class="section-count">05</p>
        <h2 id="press-title">Press</h2>
      </header>
      <div class="links-grid press-grid">
        \${pressLinks.map((link) => ` + '`' + `
          <a class="social-card press-card reveal-item" href="\${escapeHtml(link.href)}" target="_blank" rel="noreferrer">
            <span>\${escapeHtml(link.label)}</span>
          </a>
        ` + '`' + `).join('')}
      </div>
    </section>
  ` + '`' + `;
}`;

if (main.includes('function renderContactCategory()')) {
  main = main.replace(
    /function renderContactCategory\(\) \{[\s\S]*?\n\}\n\nasync function initPortfolioPdfViewer\(\)/,
    `${pressRenderer}\n\nasync function initPortfolioPdfViewer()`,
  );
} else if (!main.includes('function renderPressCategory()')) {
  main = main.replace(
    /function renderLinksCategory\(\) \{[\s\S]*?\n\}\n\n/,
    (match) => `${match}${pressRenderer}\n\n`,
  );
}

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
  if (import.meta.env?.BASE_URL) return ` + '`${basePath}${encodedImageName}`' + `;
  return ` + '`./${encodedImageName}`' + `;
}
`;
} else {
  main = main.replace(
    'return `${basePath}assets/profile/${encodedImageName}`;',
    'return `${basePath}${encodedImageName}`;',
  );
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
  './src/main.js?v=cv-education-software-20260617',
);

fs.writeFileSync(mainPath, main);
fs.writeFileSync(stylePath, style);
fs.writeFileSync(indexPath, index);
console.log('Approved Links, About profile image, Press, and CV updates applied.');
