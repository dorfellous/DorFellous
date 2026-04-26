# Dor Fellous Interactive Portfolio

A local Vite + Three.js prototype for an interactive 3D architectural portfolio entrance. The site opens inside a dark industrial environment where visitors move as an invisible first-person presence and click monolithic buildings to enter simple placeholder section pages.

This first version is intentionally minimal, stable, and procedural. No external 3D assets are required.

## Install

```bash
cd dor-fellous-interactive-portfolio
npm install
```

## Run Locally

```bash
npm run dev
```

Vite will print a local URL, usually `http://localhost:5173`.

## Build

```bash
npm run build
```

The production-ready files will be generated in `dist/`.

## GitHub Pages

This project is configured for this GitHub Pages URL:

```text
https://dorfellous.github.io/DorFellous/
```

That URL is why `vite.config.js` contains:

```js
base: '/DorFellous/'
```

If the repository name changes, update the `base` value to match the new repository path.

Important: GitHub Pages cannot run the source files directly as a Vite app. The browser needs the built files from `dist/`.

Manual upload option:

1. Run `npm install`.
2. Run `npm run build`.
3. Upload the contents of `dist/` to the branch/folder GitHub Pages is serving.
4. Make sure the deployed `index.html` is the one from `dist/`, not the root development `index.html`.

Source upload option:

1. Upload the full source project to GitHub.
2. Add a GitHub Actions workflow that runs `npm install` and `npm run build`.
3. Configure GitHub Pages to publish the generated `dist/` output.

This repository does not require any deployment access from this local project.

## Controls

Desktop:

- Click `Enter` to lock the pointer.
- Move the mouse to look around.
- Use `WASD` or arrow keys to walk.
- Click a labeled building to enter that section.
- Use `Back to entrance` to return to the 3D scene.

Mobile:

- A fallback panel appears with direct access to the section pages.
- Basic touch look is included, but the full entrance is designed for desktop.

## Where To Edit Section Names And Content

Edit `src/sections.js`.

Each section object controls:

- `id`: internal identifier.
- `title`: building label and page title.
- `placeholder`: temporary page copy.
- `building.position`: where the building appears.
- `building.size`: building proportions.
- `building.labelSide`: which side receives the label.

## Where To Edit Visual Settings

Edit `src/scene.js`.

Useful areas:

- `createMaterials()`: floor and monolith material color, sheen, roughness, and metalness.
- `createAtmosphere()`: fog, low-key lighting, and industrial point lights.
- `createFloorName()`: embedded `DOR FELLOUS` floor text.
- `createBuildings()`: procedural building creation.

## Where To Edit Movement

Edit `src/controls.js`.

Useful settings:

- `movementSpeed`: walking speed.
- `damping`: smooth acceleration and stopping.
- `mouseSensitivity`: desktop look sensitivity.
- `worldLimit`: simple movement boundary.

## Where To Replace Placeholder Pages

Start with `src/sections.js` for the text.

The static section page rendering is handled in `src/navigation.js`, while layout and typography live in `src/style.css`. When replacing placeholders with real content, keep section data in `sections.js` or split each section into its own module if the content becomes larger.

## Project Structure

```text
dor-fellous-interactive-portfolio/
  package.json
  index.html
  README.md
  src/
    main.js
    scene.js
    controls.js
    navigation.js
    sections.js
    style.css
  public/
    assets/
      textures/
      models/
      media/
```
