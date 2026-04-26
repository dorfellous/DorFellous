// Edit this file first when changing the portfolio structure.
// Each section drives one building label, one click target, and one placeholder page.
export const SECTIONS = [
  {
    id: 'about',
    title: 'ABOUT',
    placeholder: 'A quiet placeholder for Dor Fellous biography, background, and point of view.',
    building: {
      position: { x: -18, y: 4.5, z: -25 },
      size: { x: 9, y: 9, z: 6 },
      labelSide: 'front'
    }
  },
  {
    id: 'projects',
    title: 'PROJECTS',
    placeholder: 'Selected work will live here: spatial experiments, systems, collaborations, and case studies.',
    building: {
      position: { x: 0, y: 6, z: -32 },
      size: { x: 12, y: 12, z: 7 },
      labelSide: 'front'
    }
  },
  {
    id: 'products',
    title: 'PRODUCTS',
    placeholder: 'A future home for products, tools, prototypes, and digital objects.',
    building: {
      position: { x: 18, y: 5, z: -24 },
      size: { x: 8, y: 10, z: 8 },
      labelSide: 'front'
    }
  },
  {
    id: 'press',
    title: 'PRESS',
    placeholder: 'Press mentions, interviews, features, and external references can be collected here.',
    building: {
      position: { x: -22, y: 3.5, z: -7 },
      size: { x: 7, y: 7, z: 10 },
      labelSide: 'right'
    }
  },
  {
    id: 'contact',
    title: 'CONTACT',
    placeholder: 'Contact details, social links, and booking information will replace this placeholder.',
    building: {
      position: { x: 22, y: 4, z: -8 },
      size: { x: 7, y: 8, z: 9 },
      labelSide: 'left'
    }
  }
];

export function getSectionById(id) {
  return SECTIONS.find((section) => section.id === id);
}
