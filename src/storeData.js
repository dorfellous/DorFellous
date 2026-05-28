export const storeCategories = [
  {
    id: 'jewelry',
    title: 'Jewelry',
    deck: 'Small body extensions, talismans, metal and skin studies.',
    visualTone: 'bone',
  },
  {
    id: 'bags',
    title: 'Bags',
    deck: 'Body-carried forms, hardware, modular containers.',
    visualTone: 'steel',
  },
  {
    id: 'home-decor',
    title: 'Home Decor',
    deck: 'Interior objects, vessels, surfaces and sculptural fragments.',
    visualTone: 'void',
  },
  {
    id: 'clothes',
    title: 'Clothes',
    deck: 'Garments, layered silhouettes, soft armor and wearable studies.',
    visualTone: 'skin',
  },
];

export const defaultPayPalUrl = 'https://paypal.me/YOURNAME';

/*
  PRODUCT UPLOAD GUIDE

  1. Drop product images into:
     src/assets/store/category-name/product-name/

     Example:
     src/assets/store/bags/alien-egg-bag-black/01.jpg
     src/assets/store/bags/alien-egg-bag-black/02.jpg

  2. Add or duplicate one product object inside rawStoreProducts below.

  3. Use the same folder slug for the product id:
     id: 'alien-egg-bag-black'
     category: 'bags'

  4. Connect images by listing file names only:
     imageFiles: ['01.jpg', '02.jpg', 'detail.jpg']

  5. To duplicate a product:
     copy an existing object, change id/title/category/price/text/options/imageFiles/paypalUrl.

  You should not need to edit layout files to add or replace product images.
*/
export const storeAssetRoot = './src/assets/store';

const checkoutOptionsByCategory = {
  jewelry: {
    sizes: ['One size', 'Custom sizing'],
    variations: ['As shown', 'Silver', 'Bone', 'Skin'],
  },
  bags: {
    sizes: ['One size'],
    variations: ['As shown', 'Black', 'Silver hardware', 'Skin tone'],
  },
  'home-decor': {
    sizes: ['One size'],
    variations: ['As shown', 'Black', 'Bone', 'Silver'],
  },
  clothes: {
    sizes: ['XS', 'S', 'M', 'L', 'Custom'],
    variations: ['As shown', 'Black', 'Bone', 'Skin'],
  },
};

const productImage = (category, productId, fileName, alt = '') => ({
  src: `${storeAssetRoot}/${category}/${productId}/${fileName}`,
  alt,
});

const createProductGallery = (product) => {
  if (product.imageGallery?.length) return product.imageGallery;
  if (product.images?.length) return product.images;
  if (!product.imageFiles?.length) return [];

  return product.imageFiles.map((fileName, index) =>
    productImage(
      product.category,
      product.id,
      fileName,
      `${product.title || product.name} view ${index + 1}`,
    ),
  );
};

const normalizeProduct = (product) => {
  const title = product.title || product.name;
  const checkoutOptions = {
    sizes: ['One size'],
    variations: ['As shown'],
    ...(checkoutOptionsByCategory[product.category] || {}),
    ...(product.checkoutOptions || {}),
    ...(product.options || {}),
  };

  return {
    ...product,
    title,
    name: title,
    paypalUrl: product.paypalUrl || defaultPayPalUrl,
    checkoutOptions,
    imageGallery: createProductGallery({ ...product, title }),
    images: createProductGallery({ ...product, title }),
  };
};

const rawStoreProducts = [
  {
    id: 'spine-ring',
    title: 'Spine Ring',
    category: 'jewelry',
    price: 340,
    currency: 'USD',
    available: true,
    status: 'available',
    shortDescription: 'A compact metal study shaped around the gesture of a spine.',
    fullDescription: 'A wearable object designed as a quiet extension of the hand, balancing polished edge, negative space, and a skeletal line.',
    materials: ['Silver-tone metal', 'Hand-finished surface'],
    dimensions: 'Approx. 24 mm face / variable ring sizing',
    featured: 1,
    bestSelling: 3,
    date: '2026-03-18',
    tags: ['2026', 'silver'],
    visualTone: 'steel',
    imageFiles: [],
  },
  {
    id: 'bone-chain',
    title: 'Bone Chain',
    category: 'jewelry',
    price: 620,
    currency: 'USD',
    available: true,
    status: 'made-to-order',
    shortDescription: 'A pale chain object built from linked bone-like forms.',
    fullDescription: 'An elongated jewelry piece with sculptural links, made to sit between ornament and small wearable artifact.',
    materials: ['Resin composite', 'Steel closure'],
    dimensions: 'Approx. 42 cm length',
    featured: 2,
    bestSelling: 2,
    date: '2025-12-02',
    tags: ['2025', 'bone'],
    visualTone: 'bone',
    imageFiles: [],
  },
  {
    id: 'skin-ear-piece',
    title: 'Skin Ear Piece',
    category: 'jewelry',
    price: 280,
    currency: 'USD',
    available: false,
    status: 'sold-out',
    shortDescription: 'A single ear piece with a soft skin-toned visual language.',
    fullDescription: 'A small asymmetric body extension developed as a study in intimacy, texture, and silhouette around the ear.',
    materials: ['Mixed polymer', 'Steel finding'],
    dimensions: 'Approx. 58 mm drop',
    featured: 7,
    bestSelling: 7,
    date: '2024-10-09',
    tags: ['2024', 'skin'],
    visualTone: 'skin',
    imageFiles: [],
  },
  {
    id: 'skin-carrier',
    title: 'Skin Carrier',
    category: 'bags',
    price: 1180,
    currency: 'USD',
    available: true,
    status: 'available',
    shortDescription: 'A body-carried soft object with a skin-like sculptural volume.',
    fullDescription: 'A minimal carrier designed around tension, surface, and the feeling of an object held close to the body.',
    materials: ['Coated textile', 'Metal hardware', 'Lined interior'],
    dimensions: 'Approx. 32 x 22 x 10 cm',
    featured: 1,
    bestSelling: 2,
    date: '2026-03-03',
    tags: ['2026', 'skin'],
    visualTone: 'skin',
    imageFiles: [],
  },
  {
    id: 'hardware-sling',
    title: 'Hardware Sling',
    category: 'bags',
    price: 980,
    currency: 'USD',
    available: true,
    status: 'made-to-order',
    shortDescription: 'A black sling with exposed hardware and an architectural profile.',
    fullDescription: 'A functional bag object that keeps the hardware visible as part of the silhouette, built for cross-body wear.',
    materials: ['Black technical textile', 'Steel hardware'],
    dimensions: 'Approx. 28 x 18 x 8 cm',
    featured: 3,
    bestSelling: 1,
    date: '2025-09-14',
    tags: ['2025', 'black', 'silver'],
    visualTone: 'black-steel',
    imageFiles: [],
  },
  {
    id: 'soft-case-object',
    title: 'Soft Case Object',
    category: 'bags',
    price: 640,
    currency: 'USD',
    available: false,
    status: 'sold-out',
    shortDescription: 'A small soft case object from the bag studies.',
    fullDescription: 'A compact pouch-like form developed as a quiet archive object for carrying fragments, tools, or personal pieces.',
    materials: ['Black textile', 'Internal binding'],
    dimensions: 'Approx. 18 x 12 x 5 cm',
    featured: 6,
    bestSelling: 8,
    date: '2024-04-21',
    tags: ['2024', 'black'],
    visualTone: 'void',
    imageFiles: [],
  },
  {
    id: 'bone-vessel',
    title: 'Bone Vessel',
    category: 'home-decor',
    price: 820,
    currency: 'USD',
    available: true,
    status: 'available',
    shortDescription: 'A sculptural vessel for interior space.',
    fullDescription: 'A home object that carries the same body-language as the wearable work, translated into a static vessel form.',
    materials: ['Resin composite', 'Matte sealed finish'],
    dimensions: 'Approx. 22 x 16 x 14 cm',
    featured: 1,
    bestSelling: 4,
    date: '2026-01-19',
    tags: ['2026', 'bone'],
    visualTone: 'bone',
    imageFiles: [],
  },
  {
    id: 'black-surface-study',
    title: 'Black Surface Study',
    category: 'home-decor',
    price: 540,
    currency: 'USD',
    available: true,
    status: 'available',
    shortDescription: 'A dark surface object for display or ritual use.',
    fullDescription: 'A low horizontal object designed as a surface, platform, or small sculptural anchor within an interior.',
    materials: ['Cast composite', 'Black pigment', 'Sealed finish'],
    dimensions: 'Approx. 34 x 18 x 3 cm',
    featured: 3,
    bestSelling: 6,
    date: '2025-06-12',
    tags: ['2025', 'black'],
    visualTone: 'ink',
    imageFiles: [],
  },
  {
    id: 'silver-room-fragment',
    title: 'Silver Room Fragment',
    category: 'home-decor',
    price: 760,
    currency: 'USD',
    available: false,
    status: 'sold-out',
    shortDescription: 'A silver-toned interior fragment with reflective tension.',
    fullDescription: 'A room-scale study in miniature, made as an object that shifts between decor, artifact, and material sample.',
    materials: ['Metallic composite', 'Hand-finished coating'],
    dimensions: 'Approx. 19 x 15 x 9 cm',
    featured: 5,
    bestSelling: 7,
    date: '2024-11-07',
    tags: ['2024', 'silver'],
    visualTone: 'steel',
    imageFiles: [],
  },
  {
    id: 'skin-layer-top',
    title: 'Skin Layer Top',
    category: 'clothes',
    price: 690,
    currency: 'USD',
    available: true,
    status: 'available',
    shortDescription: 'A close-fitting top built as a second-skin layer.',
    fullDescription: 'A garment study focused on stretch, surface, and the boundary between clothing and body extension.',
    materials: ['Stretch mesh', 'Soft binding'],
    dimensions: 'Made in limited sizing',
    featured: 1,
    bestSelling: 1,
    date: '2026-02-24',
    tags: ['2026', 'skin'],
    visualTone: 'skin',
    imageFiles: [],
  },
  {
    id: 'black-wrap-coat',
    title: 'Black Wrap Coat',
    category: 'clothes',
    price: 1420,
    currency: 'USD',
    available: true,
    status: 'made-to-order',
    shortDescription: 'A black wrap silhouette with soft armor proportions.',
    fullDescription: 'A structured outer garment designed with wrap closure, dramatic surface, and quiet protective volume.',
    materials: ['Heavy black cotton blend', 'Internal ties', 'Hand finishing'],
    dimensions: 'Made to order by size',
    featured: 2,
    bestSelling: 5,
    date: '2025-07-30',
    tags: ['2025', 'black'],
    visualTone: 'ink',
    imageFiles: [],
  },
  {
    id: 'bone-garment-study',
    title: 'Bone Garment Study',
    category: 'clothes',
    price: 880,
    currency: 'USD',
    available: false,
    status: 'sold-out',
    shortDescription: 'A pale garment prototype from the bone studies.',
    fullDescription: 'A clothing object developed as a material and silhouette study, balancing fragility with sculptural structure.',
    materials: ['Cotton blend', 'Resin-treated detail'],
    dimensions: 'Prototype sample size',
    featured: 8,
    bestSelling: 6,
    date: '2024-12-19',
    tags: ['2024', 'bone'],
    visualTone: 'bone',
    imageFiles: [],
  },
];

export const storeProducts = rawStoreProducts.map(normalizeProduct);
