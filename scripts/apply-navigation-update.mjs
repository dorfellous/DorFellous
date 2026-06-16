import fs from 'node:fs';

const mainPath = 'src/main.js';
const stylePath = 'src/style.css';

let main = fs.readFileSync(mainPath, 'utf8');
let style = fs.readFileSync(stylePath, 'utf8');

const dataBlock = `const mainCategories = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'cv', label: 'CV' },
  { id: 'links', label: 'Links' },
  { id: 'contact', label: 'Contact' },
];
const resumeSections = [
  {
    title: 'About',
    items: [
      'Tel Aviv based multidisciplinary designer and artist working between fashion, sculpture, digital tools, and material experimentation.',
      'The practice moves between garments, wearable objects, image making, animation, and sculptural systems for the body.',
    ],
  },
  {
    title: 'Experience',
    items: [
      'Independent creative practice developing experimental garments, accessories, body extensions, and visual systems.',
      'Continuous self-directed production across nightlife, daily wear, digital fashion, 3D modeling, and material research.',
    ],
  },
  {
    title: 'Education',
    items: [
      'External Studies Department, Shenkar College: sewing course and free pattern making course.',
      'Self-directed study across digital patternmaking, 3D workflows, animation, fabrication, and AI image processes.',
    ],
  },
  {
    title: 'Skills',
    items: [
      'Fashion design, pattern making, sewing, textile manipulation, material research, sculptural construction, concept development, styling, visual direction.',
    ],
  },
  {
    title: 'Software',
    items: [
      'CLO3D, 3D modeling tools, animation workflows, augmented reality, 3D printing workflows, AI image and concept generation tools.',
    ],
  },
];
const socialLinks = [
  { label: 'LinkedIn', href: 'https://example.com/linkedin' },
  { label: 'Instagram', href: 'https://example.com/instagram' },
  { label: 'GitHub', href: 'https://example.com/github' },
  { label: 'Email', href: 'mailto:hello@example.com' },
];
const cleanPdfTitles`;

main = main.replace(/const mainCategories = \[[\s\S]*?\];\n(?:const resumeSections = \[[\s\S]*?\];\nconst socialLinks = \[[\s\S]*?\];\n)?const cleanPdfTitles/, dataBlock);

main = main.replace(/  if \(path === 'store'\)[\s\S]*?  if \(!hash\) return \{ type: 'home' \};/, `  if (path === 'store') return { type: 'home' };
  if (path.startsWith('store/')) {
    return { type: 'home' };
  }
  if (!hash) return { type: 'home' };`);
main = main.replace("  if (!hash) return { type: 'home' };\n  if (mainCategories.some((category) => category.id === path))", "  if (!hash) return { type: 'home' };\n  if (path === 'home') return { type: 'home' };\n  if (mainCategories.some((category) => category.id === path))");
main = main.replace("  if (path === 'shop') return { type: 'shop', storeView: 'landing', params };", "  if (path === 'shop') return { type: 'home' };");
main = main.replace("${mainCategories.map((category, index) => mainCategoryButton(category, index, activeCategory)).join('')}", "${mainCategories.map((category, index) => mainCategoryButton(category, index, activeCategory || 'home')).join('')}");
main = main.replace("${activeCategory ? renderMainCategoryContent(activeCategory, route) : ''}", "${activeCategory && activeCategory !== 'home' ? renderMainCategoryContent(activeCategory, route) : ''}");
main = main.replace("window.location.hash = `#/${category}`;", "window.location.hash = category === 'home' ? '#/' : `#/${category}`;");
main = main.replace(/function renderMainCategoryContent\(category, route = \{\}\) \{[\s\S]*?\n\}/, `function renderMainCategoryContent(category, route = {}) {
  if (category === 'home') return '';
  if (category === 'about') return renderAboutCategory();
  if (category === 'portfolio') return renderPortfolioCategory();
  if (category === 'cv') return renderCvCategory();
  if (category === 'links') return renderLinksCategory();
  if (category === 'contact') return renderContactCategory();
  return '';
}`);

const newRenderers = `function renderCvCategory() {
  return ` + '`' + `
    <section class="category-content category-content--cv reveal-item" aria-labelledby="cv-title">
      <header class="category-content-header">
        <p class="section-count">03</p>
        <h2 id="cv-title">CV</h2>
      </header>
      <div class="cv-grid">
        ${resumeSections.map((section) => ` + '`' + `
          <article class="cv-entry reveal-item">
            <h3>${escapeHtml(section.title)}</h3>
            ${section.items.map((item) => ` + '`' + `<p>${escapeHtml(item)}</p>` + '`' + `).join('')}
          </article>
        ` + '`' + `).join('')}
      </div>
    </section>
  ` + '`' + `;
}

function renderLinksCategory() {
  return ` + '`' + `
    <section class="category-content category-content--links reveal-item" aria-labelledby="links-title">
      <header class="category-content-header">
        <p class="section-count">04</p>
        <h2 id="links-title">Links</h2>
      </header>
      <div class="links-grid">
        ${socialLinks.map((link) => ` + '`' + `
          <a class="social-card reveal-item" href="${escapeHtml(link.href)}" target="_blank" rel="noreferrer">
            <span>${escapeHtml(link.label)}</span>
          </a>
        ` + '`' + `).join('')}
      </div>
    </section>
  ` + '`' + `;
}

function renderContactCategory() {
  return ` + '`' + `
    <section class="category-content category-content--contact reveal-item" aria-labelledby="contact-title">
      <header class="category-content-header">
        <p class="section-count">05</p>
        <h2 id="contact-title">Contact</h2>
      </header>
      <div class="contact-panel reveal-item">
        <a href="mailto:hello@example.com">hello@example.com</a>
      </div>
    </section>
  ` + '`' + `;
}

`;

if (main.includes('function renderCvCategory()')) {
  main = main.replace(/function renderCvCategory\(\) \{[\s\S]*?\n\}\n\nasync function initPortfolioPdfViewer\(\)/, `${newRenderers}async function initPortfolioPdfViewer()`);
} else {
  main = main.replace('async function initPortfolioPdfViewer()', `${newRenderers}async function initPortfolioPdfViewer()`);
}

main = main.replace('href="#/${category.id}"', 'href="${category.id === \'home\' ? \'#/\' : `#/${category.id}`}"');
main = main.replace("${next ? `<a href=\"#/section/${next.id}\">Next<br><span>${escapeHtml(next.title)}</span></a>` : '<a href=\"#/shop\">Next<br><span>Shop</span></a>'}", "${next ? `<a href=\"#/section/${next.id}\">Next<br><span>${escapeHtml(next.title)}</span></a>` : '<span></span>'}");

style = style.replace(/(\.main-category-menu \{[\s\S]*?grid-template-columns: )repeat\(4, minmax\(0, 1fr\)\);/, '$1repeat(6, minmax(0, 1fr));');

const extraCss = `

.category-content--cv,
.category-content--links,
.category-content--contact {
  width: min(100%, 980px);
}

.cv-grid {
  display: grid;
  gap: clamp(18px, 3vw, 34px);
}

.cv-entry {
  display: grid;
  grid-template-columns: minmax(140px, 0.28fr) minmax(0, 0.72fr);
  gap: clamp(18px, 5vw, 76px);
  border-top: 1px solid var(--rule);
  padding-top: clamp(20px, 3vw, 34px);
}

.cv-entry h3 {
  margin: 0;
  color: var(--ink);
  font-size: clamp(1rem, 1.8vw, 1.8rem);
  line-height: 1;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.cv-entry p {
  grid-column: 2;
  max-width: 680px;
  margin: 0 0 12px;
  color: #d5cec4;
  font-size: clamp(0.94rem, 1.02vw, 1.08rem);
  line-height: 1.58;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(12px, 2vw, 24px);
}

.social-card {
  min-height: clamp(130px, 18vw, 210px);
  display: flex;
  align-items: flex-end;
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
  padding: clamp(18px, 3vw, 32px) 0;
  color: var(--ink);
  text-decoration: none;
  transition:
    border-color 220ms ease,
    color 220ms ease,
    transform 220ms ease;
}

.social-card:hover,
.social-card:focus-visible {
  border-color: rgba(241, 238, 232, 0.48);
  color: var(--soft);
  transform: translateY(-2px);
}

.social-card span,
.contact-panel a {
  font-size: clamp(2rem, 5.4vw, 5.2rem);
  line-height: 0.92;
  letter-spacing: 0;
}

.contact-panel {
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
  padding: clamp(26px, 5vw, 54px) 0;
  text-align: center;
}

.contact-panel a {
  color: var(--ink);
  text-decoration: none;
  overflow-wrap: anywhere;
}

.social-card:focus-visible,
.contact-panel a:focus-visible {
  outline: 1px solid var(--soft);
  outline-offset: 6px;
}

@media (max-width: 860px) {
  .cv-entry,
  .links-grid {
    grid-template-columns: 1fr;
  }

  .cv-entry p {
    grid-column: 1;
  }
}

@media (max-width: 520px) {
  .social-card {
    min-height: 112px;
  }
}
`;

style = style.replace(/\n\.category-content--cv,[\s\S]*?\n\.store-shell \{/, '\n.store-shell {');
style = style.replace(/\n\.social-card:focus-visible,[\s\S]*?\.contact-panel a:focus-visible \{[\s\S]*?\n\}/, '');
style = style.trimEnd() + extraCss;

fs.writeFileSync(mainPath, main);
fs.writeFileSync(stylePath, style);
console.log('Navigation/CV/Links update applied.');
