import type { ProductCategory, SoftwareCompatibility } from '../types/product';

export interface CategoryDefinition {
  name: string;
  slug: string;
  filterType: 'software' | 'category';
  filterValue: SoftwareCompatibility | ProductCategory;
  description: string;
}

export const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    name: 'AutoCAD',
    slug: 'autocad-software',
    filterType: 'software',
    filterValue: 'AutoCAD',
    description: 'AutoCAD 2D/3D CAD drawings, DWG block libraries, structural details & blueprints.'
  },
  {
    name: 'Revit',
    slug: 'revit',
    filterType: 'software',
    filterValue: 'Revit',
    description: 'Autodesk Revit BIM family libraries, RFA models & structural templates.'
  },
  {
    name: 'Excel Sheets',
    slug: 'excel-sheets',
    filterType: 'category',
    filterValue: 'Excel Sheets',
    description: 'Civil engineering estimation spreadsheets, BOQ calculators & BBS sheets.'
  },
  {
    name: '3ds Max',
    slug: '3ds-max',
    filterType: 'software',
    filterValue: '3ds Max',
    description: '3ds Max interior/exterior photorealistic V-Ray & Corona scenes.'
  },
  {
    name: 'SketchUp',
    slug: 'sketchup',
    filterType: 'software',
    filterValue: 'SketchUp',
    description: 'SketchUp 3D elevation models, architectural components & texture packs.'
  },
  {
    name: 'Lumion',
    slug: 'lumion',
    filterType: 'software',
    filterValue: 'Lumion',
    description: 'Lumion exterior visualization presets, atmospheric scene packs & effects.'
  },
  {
    name: 'MS Office',
    slug: 'ms-office',
    filterType: 'software',
    filterValue: 'MS Office',
    description: 'MS Office templates, project reports & civil engineering ebooks.'
  },
  {
    name: 'Tekla Structures',
    slug: 'tekla',
    filterType: 'software',
    filterValue: 'Tekla',
    description: 'Tekla structural steel models, PEB components & rebar detailing presets.'
  },
  {
    name: 'eBooks',
    slug: 'ebooks',
    filterType: 'category',
    filterValue: 'eBooks',
    description: 'Civil engineering textbooks, IS code standards & structural handbooks.'
  },
  {
    name: 'Projects',
    slug: 'projects',
    filterType: 'category',
    filterValue: 'Projects',
    description: 'Full civil engineering projects, MS Project Gantt charts & 3D elevation packs.'
  },
  {
    name: 'Softwares',
    slug: 'softwares',
    filterType: 'category',
    filterValue: 'Softwares',
    description: 'Civil engineering and architecture software digital bundles.'
  }
];

export const getCategoryBySlug = (slug: string): CategoryDefinition | undefined => {
  const normalized = slug.trim().toLowerCase().replace(/^\/+|\/+$/g, '');
  return CATEGORY_DEFINITIONS.find((cat) => cat.slug.toLowerCase() === normalized);
};
