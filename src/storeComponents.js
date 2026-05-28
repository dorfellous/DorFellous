import { storeProducts } from './storeData.js';

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
      ${StoreLandingFeaturedProducts()}
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
          <span class="store-card-buy-link">${status.value === 'sold-out' ? 'View archive' : 'Buy'}</span>
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
    ${CheckoutModal(product, category)}
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
      ${ProductCheckoutAction(product)}
    </section>
  `;
}

export function CheckoutModal(product, category) {
  const status = getProductStatus(product);
  const sizes = product.checkoutOptions?.sizes?.length ? product.checkoutOptions.sizes : ['One size'];
  const variations = product.checkoutOptions?.variations?.length ? product.checkoutOptions.variations : ['As shown'];
  const price = status.value === 'sold-out' ? 'Sold out' : formatPrice(product.price, product.currency);

  return `
    <section
      class="checkout-modal"
      data-checkout-modal
      data-product-id="${escapeHtml(product.id)}"
      data-product-category="${escapeHtml(product.category)}"
      data-paypal-url="${escapeHtml(product.paypalUrl || 'https://paypal.me/YOURNAME')}"
      aria-hidden="true"
    >
      <div class="checkout-modal__backdrop" data-checkout-close></div>
      <div class="checkout-modal__panel" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
        <button class="checkout-modal__close" type="button" data-checkout-close>Close</button>
        <header class="checkout-modal__header">
          <p class="section-count">Direct checkout</p>
          <h2 id="checkout-title">Order Request</h2>
          <p>${escapeHtml(product.name)} / ${escapeHtml(price)}</p>
        </header>
        <form class="checkout-form" data-checkout-form novalidate>
          <div class="checkout-form__summary" aria-label="Selected product">
            <label>
              <span>Product</span>
              <input name="productName" value="${escapeHtml(product.name)}" readonly>
            </label>
            <label>
              <span>Price</span>
              <input name="productPrice" value="${escapeHtml(price)}" readonly>
            </label>
          </div>
          <div class="checkout-form__grid">
            <label>
              <span>Size</span>
              <select name="size" required>
                ${sizes.map((size) => `<option value="${escapeHtml(size)}">${escapeHtml(size)}</option>`).join('')}
              </select>
            </label>
            <label>
              <span>Color / Variation</span>
              <select name="variation" required>
                ${variations.map((variation) => `<option value="${escapeHtml(variation)}">${escapeHtml(variation)}</option>`).join('')}
              </select>
            </label>
            <label>
              <span>Quantity</span>
              <input name="quantity" type="number" min="1" max="9" value="1" required>
            </label>
            <label>
              <span>Full name</span>
              <input name="fullName" autocomplete="name" required>
            </label>
            <label>
              <span>Email</span>
              <input name="email" type="email" autocomplete="email" required>
            </label>
            <label>
              <span>Phone number</span>
              <input name="phone" type="tel" autocomplete="tel" required>
            </label>
            <label class="checkout-form__wide">
              <span>Shipping address</span>
              <input name="shippingAddress" autocomplete="street-address" required>
            </label>
            <label>
              <span>City</span>
              <input name="city" autocomplete="address-level2" required>
            </label>
            <label>
              <span>Country</span>
              <input name="country" autocomplete="country-name" required>
            </label>
            <label>
              <span>Postal code</span>
              <input name="postalCode" autocomplete="postal-code" required>
            </label>
            <label class="checkout-form__wide">
              <span>Notes / Custom request</span>
              <textarea name="notes" rows="4"></textarea>
            </label>
          </div>
          <p class="checkout-form__message" data-checkout-message aria-live="polite"></p>
          <div class="checkout-form__actions">
            <button class="checkout-submit-button" type="submit">Save Order Details</button>
            <a
              class="checkout-paypal-button"
              data-paypal-link
              href="${escapeHtml(product.paypalUrl || 'https://paypal.me/YOURNAME')}"
              target="_blank"
              rel="noreferrer"
              hidden
            >
              Continue to PayPal
            </a>
          </div>
        </form>
      </div>
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

function StoreLandingFeaturedProducts() {
  const featuredProducts = storeProducts
    .filter((product) => product.available)
    .sort((a, b) => (a.featured || 999) - (b.featured || 999))
    .slice(0, 4);

  if (!featuredProducts.length) return '';

  return `
    <section class="store-landing-products" aria-labelledby="store-featured-title">
      <div class="store-minor-heading">
        <p class="section-count">Direct checkout</p>
        <h3 id="store-featured-title">Available Objects</h3>
      </div>
      <div class="store-product-grid">
        ${featuredProducts.map(ProductCard).join('')}
      </div>
    </section>
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

function ProductCheckoutAction(product) {
  const status = getProductStatus(product);
  const soldOut = status.value === 'sold-out';
  return `
    <div class="store-product-buy-panel">
      <button class="store-buy-button" type="button" data-checkout-trigger ${soldOut ? 'disabled' : ''}>
        ${soldOut ? 'Sold out' : 'Buy'}
      </button>
    </div>
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
  if (typeof price === 'string') return price;
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
