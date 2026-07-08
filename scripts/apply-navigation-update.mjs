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

const workflowsSource = `const workflowEntries = [
  {
    title: 'Face Piece Workflow',
    image: 'workflows/workflow-facepiece.PNG',
    description: 'From a personal image and visual identity reference, the process moves through AI-generated look development, isolated product design, 3D modeling, physical prototyping, and final styling on the body. This workflow shows how an abstract character direction can become a wearable sculptural face piece.',
  },
  {
    title: 'Client Headpiece Workflow',
    image: 'workflows/workflow-client-headpiece.PNG',
    description: 'A client concept is developed through sketches, AI-generated visual exploration, 3D modeling, printing, finishing, and final wearable presentation. The project combines fashion styling, sculptural accessories, and digital-to-physical production into one complete headpiece system.',
  },
  {
    title: 'Candle Holder Workflow',
    image: 'workflows/workflow-candleholder.PNG',
    description: 'This workflow begins with a conceptual video image and evolves into a product image, 3D model, full concept visualization, 3D print, hand painting, and final object. It shows how a surreal visual idea can be translated into a functional sculptural product through layered digital and manual processes.',
  },
];
const resumeSections`;

if (!main.includes("{ id: 'workflows', label: 'Workflows' }")) {
  main = main.replace(
    "  { id: 'portfolio', label: 'Portfolio' },\n",
    "  { id: 'portfolio', label: 'Portfolio' },\n  { id: 'workflows', label: 'Workflows' },\n",
  );
}

if (main.includes('const workflowEntries = [')) {
  main = main.replace(
    /const workflowEntries = \[[\s\S]*?\];\nconst resumeSections/,
    workflowsSource,
  );
} else {
  main = main.replace('const resumeSections', workflowsSource);
}

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

if (!main.includes("if (category === 'workflows') return renderWorkflowsCategory();")) {
  main = main.replace(
    "if (category === 'portfolio') return renderPortfolioCategory();",
    "if (category === 'portfolio') return renderPortfolioCategory();\n  if (category === 'workflows') return renderWorkflowsCategory();",
  );
}

main = main.replaceAll(
  'src="${basePath}${escapeHtml(entry.image)}"',
  'src="${getWorkflowImageSrc(entry.image)}"',
);

const pressRenderer = `function renderPressCategory() {
  return ` + '`' + `
    <section class="category-content category-content--press reveal-item" aria-labelledby="press-title">
      <header class="category-content-header">
        <p class="section-count">06</p>
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

const workflowsRenderer = `function renderWorkflowsCategory() {
  return ` + '`' + `
    <section class="category-content category-content--workflows reveal-item" aria-labelledby="workflows-title">
      <header class="category-content-header workflows-header">
        <p class="section-count">03</p>
        <h2 id="workflows-title">Workflows</h2>
        <p>A visual archive of how ideas move between AI, 3D modeling, printing, hand-finishing, styling, and material experimentation.</p>
        <p>Each process begins with an unconventional idea and develops through different techniques until it becomes a finished physical object.</p>
      </header>
      <div class="workflow-archive">
        \${workflowEntries.map((entry, index) => ` + '`' + `
          <article class="workflow-entry reveal-item">
            <figure class="workflow-board">
              <img src="\${getWorkflowImageSrc(entry.image)}" alt="\${escapeHtml(entry.title)} board" loading="\${index === 0 ? 'eager' : 'lazy'}" decoding="async">
            </figure>
            <div class="workflow-copy">
              <p class="section-count">\${String(index + 1).padStart(2, '0')}</p>
              <h3>\${escapeHtml(entry.title)}</h3>
              <p>\${escapeHtml(entry.description)}</p>
            </div>
          </article>
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

if (!main.includes('function renderWorkflowsCategory()')) {
  main = main.replace(
    /function renderPortfolioCategory\(\) \{[\s\S]*?\n\}\n\n/,
    (match) => `${match}${workflowsRenderer}\n\n`,
  );
}

main = main.replace(
  '<p class="section-count">03</p>\n        <h2 id="cv-title">CV</h2>',
  '<p class="section-count">04</p>\n        <h2 id="cv-title">CV</h2>',
);

main = main.replace(
  '<p class="section-count">04</p>\n        <h2 id="links-title">Links</h2>',
  '<p class="section-count">05</p>\n        <h2 id="links-title">Links</h2>',
);

main = main.replace(
  '<p class="section-count">05</p>\n        <h2 id="press-title">Press</h2>',
  '<p class="section-count">06</p>\n        <h2 id="press-title">Press</h2>',
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

function getWorkflowImageSrc(imagePath) {
  if (import.meta.env?.BASE_URL) return ` + '`${basePath}${imagePath}`' + `;
  return ` + '`./${imagePath}`' + `;
}

function getAboutProfileImageSrc() {
  const encodedImageName = 'website%20profile%20image%20.JPG';
  if (import.meta.env?.BASE_URL) return ` + '`${basePath}${encodedImageName}`' + `;
  return ` + '`./${encodedImageName}`' + `;
}
`;
} else {
  if (!main.includes('function getWorkflowImageSrc(')) {
    main = main.replace(
      '\nfunction getAboutProfileImageSrc() {',
      `\nfunction getWorkflowImageSrc(imagePath) {
  if (import.meta.env?.BASE_URL) return \`\${basePath}\${imagePath}\`;
  return \`./\${imagePath}\`;
}
\nfunction getAboutProfileImageSrc() {`,
    );
  }
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

style = style.replace(
  'grid-template-columns: repeat(6, minmax(0, 1fr));',
  'grid-template-columns: repeat(auto-fit, minmax(min(118px, 100%), 1fr));',
);

style = style.replace(
  'font-size: clamp(1.4rem, 3.2vw, 3.4rem);',
  'font-size: clamp(1.16rem, 2.45vw, 2.85rem);',
);

if (!style.includes('.category-content--workflows')) {
  style = style.replace(
    `.category-content--portfolio {
  display: grid;
  gap: clamp(42px, 7vw, 86px);
}
`,
    `.category-content--portfolio {
  display: grid;
  gap: clamp(42px, 7vw, 86px);
}

.category-content--workflows {
  width: min(100%, 1180px);
}

.workflows-header p:not(.section-count) {
  width: min(100%, 760px);
  margin: 18px auto 0;
  color: #d5cec4;
  font-size: clamp(0.98rem, 1.16vw, 1.18rem);
  line-height: 1.58;
}

.workflow-archive {
  display: grid;
  gap: clamp(46px, 8vw, 96px);
}

.workflow-entry {
  display: grid;
  grid-template-columns: minmax(0, 0.68fr) minmax(240px, 0.32fr);
  gap: clamp(22px, 4vw, 58px);
  align-items: start;
  border-top: 1px solid var(--rule);
  padding-top: clamp(22px, 4vw, 46px);
}

.workflow-board {
  margin: 0;
  background: #090909;
}

.workflow-board img {
  width: 100%;
  height: auto;
  object-fit: contain;
}

.workflow-copy {
  position: sticky;
  top: 96px;
}

.workflow-copy h3 {
  margin: 0 0 18px;
  color: var(--ink);
  font-size: clamp(1.55rem, 3vw, 3.6rem);
  line-height: 0.96;
  letter-spacing: 0;
}

.workflow-copy p:last-child {
  max-width: 420px;
  margin: 0;
  color: #d5cec4;
  font-size: clamp(0.94rem, 1.02vw, 1.06rem);
  line-height: 1.58;
}
`,
  );
}

style = style.replace(
  `.category-content--cv,
.category-content--links,
.category-content--contact {`,
  `.category-content--cv,
.category-content--links,
.category-content--contact,
.category-content--press {`,
);

style = style.replace(
  `  .main-category-menu,
  .section-hero,
  .section-body,
  .section-pager,
  .cv-entry,`,
  `  .main-category-menu,
  .section-hero,
  .section-body,
  .section-pager,
  .cv-entry,
  .workflow-entry,`,
);

if (!style.includes('  .workflow-copy {\n    position: static;\n  }')) {
  style = style.replace(
    `  .text-flow {
    position: static;
  }
`,
    `  .text-flow {
    position: static;
  }

  .workflow-copy {
    position: static;
  }
`,
  );
}

index = index.replace(
  /\.\/src\/main\.js(?:\?v=[^"']*)?/,
  './src/main.js?v=workflows-section-20260708',
);

fs.writeFileSync(mainPath, main);
fs.writeFileSync(stylePath, style);
fs.writeFileSync(indexPath, index);
console.log('Approved Links, About profile image, Press, CV, and Workflows updates applied.');