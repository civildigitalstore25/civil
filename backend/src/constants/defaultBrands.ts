export interface BrandCategorySeed {
  name: string;
  categories: string[];
}

/** Same brand → category tree used by civil-ecommerce. */
export const DEFAULT_BRANDS: BrandCategorySeed[] = [
  { name: 'Autodesk', categories: ['AutoCAD', '3ds MAX', 'Revit', 'Maya', 'Fusion', 'Civil 3D', 'AutoCAD LT'] },
  { name: 'Microsoft', categories: ['Microsoft 365', 'Visio Professional', 'Microsoft Projects', 'Windows'] },
  { name: 'Adobe', categories: ['Photoshop', 'Illustrator', 'Premiere Pro', 'After Effects'] },
  { name: 'Structural Softwares', categories: ['E-Tab', 'SAFE', 'SAP2000', 'Tekla'] },
  { name: 'Architectural Softwares', categories: ['Lumion', 'Twinmotion', 'SketchUp', 'ArchiCAD'] },
  { name: 'Projects', categories: ['AutoCAD Files', 'Revit Files', 'Excel Sheet Files'] },
  { name: 'Ebook', categories: ['Civil Engineering', 'AI Prompts'] },
];
