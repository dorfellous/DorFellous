const storeSortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'best-selling', label: 'Best selling' },
  { value: 'az', label: 'Alphabetically A-Z' },
  { value: 'za', label: 'Alphabetically Z-A' },
  { value: 'price-low-high', label: 'Price low to high' },
  { value: 'price-high-low', label: 'Price high to low' },
  { value: 'date-old-new', label: 'Date old to new' },
  { value: 'date-new-old', label: 'Date new to old' },
];

export function StoreLanding({ categories }) {
  return `
    <section class="category-content store-shell store-shell--landing reveal-item" aria-labelledby="store-title">
      <header class="store-heading">
        <p class="section-count">Store</p>
        <h2 id="store-title">Store</h2>
      </header>
      <div class="store-category-grid" aria-label="Store categories">
        ${categories.map(StoreCategoryTile).join('')}
      </div>
    </section>
  `;
}

export function CollectionGrid({ category, categories, products, filters }) {
  const title = category?.title || 'Store';
  return `
    <section class="category-content store-shell store-shell--collection reveal-item" aria-labelledby="store-collection-title">
      <nav class="store-subnav" aria-label="Store navigation">
        <a href="#/store">Store</a>
        ${categories.map((item) => `<a href="#/store/${escapeHtml(item.id)}">${escapeHtml(item.title)}</a>`).join('')}
      </nav>
      <header class="store-heading store-heading--collection">
        <p class="section-count">${escapeHtml(filters.tag ? `Filtered / ${filters.tag}` : 'Collection')}</p>
        <h2 id="store-collection-title">${escapeHtml(title)}</h2>
      </header>
      ${FilterSortBar(filters)}
      <div class="store-product-grid" aria-live="polite">
        ${products.length ? products.map(ProductCard).join('') : EmptyStoreState()}
      </div>
    </section>
  `;
}

export function ProductCard(product) {
  const status = getProductStatus(product);
  const price = status.value === 'sold-out' ? 'Sold out' : formatPrice(product.price, product.currency);
  return `
    <article class="store-product-card">
      <a href="#/store/${escapeHtml(product.category)}/${escapeHtml(product.id)}" aria-label="${escapeHtml(product.name)}">
        ${ProductMedia(product)}
        <div class="store-product-meta">
          <h3>${escapeHtml(product.name)}</h3>
          <p class="${status.value === 'sold-out' ? 'is-sold-out' : ''}">${price}</p>
        </div>
      </a>
    </article>
  `;
}

export function ProductDetailPage({ product, category, categories }) {
  if (!product || !category) {
    return ProductNotFoundPage({ categories });
  }

  return `
    <article class="category-content store-shell store-product-detail reveal-item" aria-labelledby="store-product-title">
      <nav class="store-subnav" aria-label="Store navigation">
        <a href="#/store">Store</a>
        ${categories.map((item) => `<a href="#/store/${escapeHtml(item.id)}">${escapeHtml(item.title)}</a>`).join('')}
      </nav>
      <a class="store-back-link" href="#/store/${escapeHtml(category.id)}">Back to ${escapeHtml(category.title)}</a>
      <div class="store-product-detail-layout">
        ${ProductGallery(product)}
        ${ProductInfo(product, category)}
      </div>
    </article>
  `;
}

export function ProductGallery(product) {
  const images = product.images?.length ? product.images : [null, null, null];
  return `
    <section class="store-product-gallery" aria-label="${escapeHtml(product.name)} image gallery">
      ${images.map((image, index) => {
        if (image) {
          return `
            <figure class="store-product-gallery-item">
              <img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt || `${product.name} view ${index + 1}`)}" loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async">
            </figure>
          `;
        }

        return `
          <figure class="store-product-gallery-item store-visual--${escapeHtml(product.visualTone || 'void')}">
            <span>${escapeHtml(index === 0 ? product.name : `View ${index + 1}`)}</span>
          </figure>
        `;
      }).join('')}
    </section>
  `;
}

export function ProductInfo(product, category) {
  const status = getProductStatus(product);
  const tags = product.tags?.length ? product.tags.join(' / ') : 'None';
  return `
    <section class="store-product-info" aria-label="${escapeHtml(product.name)} details">
      <p class="section-count">${escapeHtml(category.title)}</p>
      <h2 id="store-product-title">${escapeHtml(product.name)}</h2>
      <div class="store-product-purchase-line">
        <span>${status.value === 'sold-out' ? 'Sold out' : formatPrice(product.price, product.currency)}</span>
        <span>${escapeHtml(status.label)}</span>
      </div>
      <p class="store-product-short">${escapeHtml(product.shortDescription || '')}</p>
      <dl class="store-product-specs">
        ${ProductSpec('Full description', product.fullDescription)}
        ${ProductSpec('Materials', product.materials?.join(', '))}
        ${ProductSpec('Dimensions', product.dimensions)}
        ${ProductSpec('Category', category.title)}
        ${ProductSpec('Collection / Tags', tags)}
      </dl>
    </section>
  `;
}

export function ProductNotFoundPage({ categories }) {
  return `
    <section class="category-content store-shell store-product-not-found reveal-item" aria-labelledby="store-product-not-found-title">
      <nav class="store-subnav" aria-label="Store navigation">
        <a href="#/store">Store</a>
        ${categories.map((item) => `<a href="#/store/${escapeHtml(item.id)}">${escapeHtml(item.title)}</a>`).join('')}
      </nav>
      <header class="store-heading store-heading--collection">
        <p class="section-count">Store</p>
        <h2 id="store-product-not-found-title">Product not found</h2>
      </header>
      <p class="store-empty-state">This object is no longer available in the current store archive.</p>
    </section>
  `;
}

export function FilterSortBar(filters) {
  const availability = filters.availability || 'all';
  const sort = filters.sort || 'featured';
  return `
    <form class="store-filter-bar" data-store-filter-form>
      <fieldset>
        <legend>Availability</legend>
        <label>
          <input type="radio" name="availability" value="all" ${availability === 'all' ? 'checked' : ''}>
          All
        </label>
        <label>
          <input type="radio" name="availability" value="in-stock" ${availability === 'in-stock' ? 'checked' : ''}>
          In stock
        </label>
        <label>
          <input type="radio" name="availability" value="out-of-stock" ${availability === 'out-of-stock' ? 'checked' : ''}>
          Out of stock
        </label>
      </fieldset>
      <fieldset class="store-price-filter">
        <legend>Price range</legend>
        <label>
          <span>From</span>
          <input type="number" name="from" min="0" inputmode="numeric" value="${escapeHtml(filters.from || '')}">
        </label>
        <label>
          <span>To</span>
          <input type="number" name="to" min="0" inputmode="numeric" value="${escapeHtml(filters.to || '')}">
        </label>
      </fieldset>
      <label class="store-sort-control">
        <span>Sort</span>
        <select name="sort">
          ${storeSortOptions.map((option) => `
            <option value="${option.value}" ${sort === option.value ? 'selected' : ''}>${option.label}</option>
          `).join('')}
        </select>
      </label>
      <button type="submit">Apply</button>
    </form>
  `;
}

function StoreCategoryTile(category) {
  return `
    <a class="store-category-tile" href="#/store/${escapeHtml(category.id)}">
      <span class="store-category-visual store-visual--${escapeHtml(category.visualTone)}" aria-hidden="true"></span>
      <span class="store-category-copy">
        <span>${escapeHtml(category.title)}</span>
        <small>${escapeHtml(category.deck)}</small>
      </span>
    </a>
  `;
}

function ProductMedia(product) {
  if (product.images?.length) {
    const primary = product.images[0];
    const secondary = product.images[1];
    return `
      <figure class="store-product-media">
        <img src="${escapeHtml(primary.src)}" alt="${escapeHtml(primary.alt || product.name)}" loading="lazy" decoding="async">
        ${secondary ? `<img class="store-product-media-secondary" src="${escapeHtml(secondary.src)}" alt="" loading="lazy" decoding="async">` : ''}
      </figure>
    `;
  }

  return `
    <figure class="store-product-media store-visual--${escapeHtml(product.visualTone || 'void')}">
      <span>${escapeHtml(product.category)}</span>
    </figure>
  `;
}

function ProductSpec(label, value) {
  return `
    <div>
      <dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(value || 'Not specified')}</dd>
    </div>
  `;
}

function getProductStatus(product) {
  const status = product.status || (product.available ? 'available' : 'sold-out');
  if (status === 'made-to-order') return { value: status, label: 'Made to order' };
  if (status === 'sold-out') return { value: status, label: 'Sold out' };
  return { value: 'available', label: 'Available' };
}

function EmptyStoreState() {
  return `
    <p class="store-empty-state">No objects match this selection.</p>
  `;
}

function formatPrice(price, currency = 'USD') {
  if (!Number.isFinite(price)) return 'Price on request';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
