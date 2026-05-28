# Store Asset Folders

Drop real product images here using this pattern:

`src/assets/store/category-name/product-name/`

Example:

`src/assets/store/bags/alien-egg-bag-black/01.jpg`

Then connect the images in `src/storeData.js`:

```js
{
  id: 'alien-egg-bag-black',
  title: 'Alien Egg Bag Black',
  category: 'bags',
  imageFiles: ['01.jpg', '02.jpg', 'detail.jpg'],
}
```

The `category` and `id` fields create the image path automatically, so replacing
images only requires swapping files in the product folder or changing
`imageFiles`.

During `npm run dev` or `npm run build`, these files are copied into
`public/assets/store/` so the live GitHub Pages site can load them at:

`/DorFellous/assets/store/category-name/product-name/01.jpg`
