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

## Later Upload To GitHub

This project is fully local and is not connected to GitHub. When you are ready:

1. Create a new repository on GitHub manually.
2. Initialize git locally if needed with `git init`.
3. Add and commit the files.
4. Add your GitHub repository as a remote.
5. Push the branch from your machine.

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
