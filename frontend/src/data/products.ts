import type { Product } from '../types/product';
import bundleImage from '../assets/autocad_bundle.png';

// Generate SVG data URLs for high quality product illustrations
const createProductSvg = (title: string, color1: string, color2: string, icon: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1}" />
        <stop offset="100%" stop-color="${color2}" />
      </linearGradient>
      <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="600" height="400" fill="url(#grad)" />
    <rect width="600" height="400" fill="url(#grid)" />
    <circle cx="500" cy="80" r="120" fill="rgba(245,166,35,0.15)" filter="blur(20px)" />
    <g transform="translate(300, 170)" text-anchor="middle" fill="#FFFFFF">
      <text font-family="system-ui, sans-serif" font-weight="900" font-size="44" y="-10" letter-spacing="1">${icon}</text>
      <text font-family="system-ui, sans-serif" font-weight="800" font-size="22" y="45" fill="#F5A623">${title}</text>
      <text font-family="system-ui, sans-serif" font-weight="600" font-size="14" y="75" fill="#E2E8F0">PREMIUM DIGITAL BUNDLE • INSTANT ACCESS</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'revit-bim-complete-family-library-2024',
    slug: 'revit-bim-complete-family-library-2024',
    categorySlug: 'revit',
    aliases: ['autodesk-revit-2014'],
    name: 'Revit BIM Complete Family Library 2024',
    category: 'Softwares',
    software: 'Revit',
    format: 'RFA / RVT',
    fileSize: '3.1 GB',
    price: 1999,
    oldPrice: 4999,
    discountPercent: 60,
    rating: 4.9,
    reviewCount: 218,
    downloadsCount: 987,
    badge: 'New',
    isBestSeller: true,
    isNewArrival: true,
    createdAt: '2026-09-01T10:00:00.000Z',
    status: 'active',
    shortDescription: '1000+ fully parametric Revit families for structural, MEP, and architectural BIM projects.',
    description: [
      'The ultimate Revit BIM Family Library 2024 delivers over 1,000+ high-quality, fully parametric RFA families designed specifically for architectural, structural, and MEP engineering projects.',
      'Includes ready-to-use doors, windows, structural columns, beams, furniture, lighting fixtures, plumbing equipment, HVAC components, and annotations. Save hundreds of modeling hours with pre-configured parameters, materials, and LOD 300-400 geometry.'
    ],
    includedFiles: [
      '1,200+ Parametric .RFA Family Files',
      '50+ Template .RVT Project Files',
      'Complete Material Library (.adsklib)',
      'PDF Quick Reference Catalog with Thumbnail Index',
      'Step-by-Step Installation & Integration Guide'
    ],
    images: [
      bundleImage,
      createProductSvg('REVIT BIM FAMILY LIBRARY', '#0F172A', '#1E293B', '🏗️'),
      createProductSvg('STRUCTURAL & MEP PACK', '#1E1B4B', '#312E81', '⚙️'),
      createProductSvg('INTERIOR & ARCHITECTURE', '#064E3B', '#047857', '🏠')
    ],
    specifications: {
      format: 'RFA / RVT',
      fileSize: '3.1 GB',
      software: 'Autodesk Revit',
      version: '2024',
      compatibility: 'Revit 2020 – 2024',
      delivery: 'Instant Digital Download',
      access: 'Lifetime Access'
    },
    compatibility: {
      supportedSoftware: 'Autodesk Revit (Architecture, Structure, MEP)',
      compatibleVersions: 'Revit 2020, 2021, 2022, 2023, 2024 (Full & LT)',
      os: 'Windows 10 / 11 (64-bit)',
      fileTypes: '.RFA, .RVT, .ADSKLIB',
      requirements: 'Requires minimum 8 GB RAM and 4 GB free disk space'
    },
    reviews: [
      {
        id: 'rev-1',
        author: 'Kiran Patel',
        avatar: 'KP',
        date: 'Aug 2024',
        rating: 5,
        comment: 'Absolutely worth every rupee. The files are well-organized and immediately usable in my office BIM projects.',
        verified: true
      },
      {
        id: 'rev-2',
        author: 'Sunita Rao',
        avatar: 'SR',
        date: 'Jul 2024',
        rating: 5,
        comment: 'Super fast download speed and clean Revit families. Parametric controls work seamlessly!',
        verified: true
      },
      {
        id: 'rev-3',
        author: 'Manoj Kumar',
        avatar: 'MK',
        date: 'Jul 2024',
        rating: 5,
        comment: 'Saved me days of custom modeling work. The doors, windows, and MEP families are top tier.',
        verified: true
      },
      {
        id: 'rev-4',
        author: 'Deepa Krishnan',
        avatar: 'DK',
        date: 'Jun 2024',
        rating: 4,
        comment: 'Great collection! Comes with useful material libraries and easy installation instructions.',
        verified: true
      }
    ]
  },
  {
    id: 'autocad-architecture-complete-bundle-2024',
    slug: 'autocad-architecture-complete-bundle-2024',
    categorySlug: 'autocad-software',
    aliases: ['autocad-2007'],
    name: 'AutoCAD Architecture Complete Bundle 2024',
    category: 'Softwares',
    software: 'AutoCAD',
    format: 'DWG',
    fileSize: '4.5 GB',
    price: 1499,
    oldPrice: 3999,
    discountPercent: 62,
    rating: 4.9,
    reviewCount: 342,
    downloadsCount: 1540,
    badge: 'Bestseller',
    isBestSeller: true,
    isNewArrival: false,
    createdAt: '2026-08-15T10:00:00.000Z',
    status: 'active',
    shortDescription: 'Comprehensive 2D & 3D AutoCAD drawings, block libraries, elevation templates, and hatch patterns.',
    description: [
      'Complete AutoCAD drawing library containing over 5,000+ standard CAD blocks, residential house plans, structural detail drawings, electrical layouts, and landscape symbols.',
      'Fully layered DWG files compliant with international CAD standards, ready to drag-and-drop into any AutoCAD project.'
    ],
    includedFiles: [
      '5,000+ Dynamic CAD Blocks (.DWG)',
      '150+ Full Architectural House Plans',
      'Structural Details & Foundation Sheets',
      'Hatch Patterns & Font Libraries'
    ],
    images: [
      bundleImage,
      createProductSvg('AUTOCAD COMPLETE BUNDLE', '#0F172A', '#1E293B', '📐'),
      createProductSvg('CAD BLOCKS & ELEVATIONS', '#311B92', '#4527A0', '🏛️')
    ],
    specifications: {
      format: 'DWG / DXF',
      fileSize: '4.5 GB',
      software: 'Autodesk AutoCAD',
      version: '2024',
      compatibility: 'AutoCAD 2010 – 2024',
      delivery: 'Instant Digital Download',
      access: 'Lifetime Access'
    },
    compatibility: {
      supportedSoftware: 'AutoCAD, AutoCAD LT, BricsCAD, ZWCAD',
      compatibleVersions: 'AutoCAD 2010 through 2024',
      os: 'Windows 10 / 11 & macOS',
      fileTypes: '.DWG, .DXF, .PAT, .SHX',
      requirements: 'Any CAD application capable of opening .DWG files'
    },
    reviews: [
      {
        id: 'rev-cad-1',
        author: 'Rajesh Sharma',
        avatar: 'RS',
        date: 'Aug 2024',
        rating: 5,
        comment: 'Huge time saver! Blocks are neatly organized into folders with proper CAD layers.',
        verified: true
      }
    ]
  },
  {
    id: '3d-home-elevation-design-bundle',
    slug: '3d-home-elevation-design-bundle',
    categorySlug: 'projects',
    aliases: ['sketchup-2017'],
    name: '3D Home Elevation Design Bundle',
    category: 'Projects',
    software: 'SketchUp',
    format: 'SKP / OBJ',
    fileSize: '8.2 GB',
    price: 2499,
    oldPrice: 5999,
    discountPercent: 58,
    rating: 4.8,
    reviewCount: 185,
    downloadsCount: 820,
    badge: 'Popular',
    isBestSeller: true,
    isNewArrival: false,
    createdAt: '2026-08-20T10:00:00.000Z',
    status: 'active',
    shortDescription: 'Modern, contemporary, and traditional exterior elevation 3D models with texture maps.',
    description: [
      'Over 200+ ready-to-render exterior 3D home elevation models with full PBR textures, lighting presets, and materials.',
      'Compatible with SketchUp, V-Ray, Lumion, and Enscape for ultra-fast client presentation renders.'
    ],
    includedFiles: [
      '200+ High Poly 3D House Models (.SKP)',
      '4K Texture Maps & Material Packs',
      'V-Ray Lighting Presets & Scenes'
    ],
    images: [
      createProductSvg('3D HOME ELEVATIONS', '#1E293B', '#334155', '🏡'),
      createProductSvg('MODERN & CLASSIC FACADES', '#4C1D95', '#6D28D9', '✨')
    ],
    specifications: {
      format: 'SKP / OBJ / FBX',
      fileSize: '8.2 GB',
      software: 'SketchUp / V-Ray',
      version: '2024',
      compatibility: 'SketchUp 2018 – 2024',
      delivery: 'Instant Digital Download',
      access: 'Lifetime Access'
    },
    compatibility: {
      supportedSoftware: 'Trimble SketchUp, V-Ray, Lumion, Enscape',
      compatibleVersions: 'SketchUp 2018+',
      os: 'Windows 10 / 11 & macOS',
      fileTypes: '.SKP, .OBJ, .FBX',
      requirements: 'Requires dedicated GPU with 4GB VRAM for rendering'
    },
    reviews: [
      {
        id: 'rev-3d-1',
        author: 'Arun Verma',
        avatar: 'AV',
        date: 'Jul 2024',
        rating: 5,
        comment: 'Clients love these designs! Textures and models render amazingly fast in Lumion.',
        verified: true
      }
    ]
  },
  {
    id: 'civil-estimation-excel-sheet-bundle',
    slug: 'civil-estimation-excel-sheet-bundle',
    categorySlug: 'excel-sheets',
    aliases: ['microsoft-office-2007'],
    name: 'Civil Estimation Excel Sheet Bundle',
    category: 'Excel Sheets',
    software: 'MS Office',
    format: 'XLSX',
    fileSize: '150 MB',
    price: 799,
    oldPrice: 1999,
    discountPercent: 60,
    rating: 4.9,
    reviewCount: 410,
    downloadsCount: 2300,
    badge: 'Bestseller',
    isBestSeller: true,
    isNewArrival: false,
    createdAt: '2026-08-10T10:00:00.000Z',
    status: 'active',
    shortDescription: 'Automated BOQ, rate analysis, concrete quantity, bar bending schedules (BBS), and cost estimation templates.',
    description: [
      'Professional civil engineering estimation spreadsheet suite packed with automated formulas for structural steel, concrete volume, brickwork, plastering, tiles, and project cost budgeting.',
      'Includes IS code formulas and customizable rate analysis databases.'
    ],
    includedFiles: [
      '50+ Fully Automated Excel Spreadsheets (.XLSX)',
      'Bar Bending Schedule (BBS) Calculator',
      'BOQ & Rate Analysis Master Template',
      'Material Requirement Estimator'
    ],
    images: [
      createProductSvg('CIVIL ESTIMATION EXCEL', '#064E3B', '#047857', '📊'),
      createProductSvg('BOQ & RATE ANALYSIS', '#065F46', '#10B981', '📈')
    ],
    specifications: {
      format: 'XLSX / XLSM',
      fileSize: '150 MB',
      software: 'Microsoft Excel / Office',
      version: '2024',
      compatibility: 'Excel 2013 – 2024 / Office 365',
      delivery: 'Instant Digital Download',
      access: 'Lifetime Access'
    },
    compatibility: {
      supportedSoftware: 'Microsoft Excel, Google Sheets, WPS Office',
      compatibleVersions: 'Excel 2013+',
      os: 'Windows, Mac, iOS, Android',
      fileTypes: '.XLSX, .XLSM',
      requirements: 'Excel macros enabled for advanced automated calculators'
    },
    reviews: [
      {
        id: 'rev-exc-1',
        author: 'Venkatesh Rao',
        avatar: 'VR',
        date: 'Aug 2024',
        rating: 5,
        comment: 'Essential for site engineers and contractors. Calculates steel weights and concrete in seconds!',
        verified: true
      }
    ]
  },
  {
    id: '3ds-max-interior-design-mega-pack',
    slug: '3ds-max-interior-design-mega-pack',
    categorySlug: '3ds-max',
    aliases: ['3ds-max-2014'],
    name: '3ds Max Interior Design Mega Pack',
    category: 'Softwares',
    software: '3ds Max',
    format: 'MAX / OBJ',
    fileSize: '12.4 GB',
    price: 2999,
    oldPrice: 7499,
    discountPercent: 60,
    rating: 4.9,
    reviewCount: 156,
    downloadsCount: 640,
    badge: 'Hot',
    isBestSeller: true,
    isNewArrival: true,
    createdAt: '2026-09-05T10:00:00.000Z',
    status: 'active',
    shortDescription: 'High-end photorealistic 3ds Max interior scenes with V-Ray and Corona materials.',
    description: [
      'Includes living room, luxury bedroom, modular kitchen, commercial office, and hotel lobby 3ds Max scenes.',
      'Fully configured light rigs, high-resolution textures, and camera setups for photorealistic architectural renderings.'
    ],
    includedFiles: [
      '100+ Complete Interior Scenes (.MAX)',
      'V-Ray & Corona Shader Libraries',
      'HDRI Environment Maps & IES Lights'
    ],
    images: [
      createProductSvg('3DS MAX INTERIOR MEGA PACK', '#831843', '#BE185D', '🛋️'),
      createProductSvg('V-RAY & CORONA SCENES', '#9F1239', '#F43F5E', '🛋️')
    ],
    specifications: {
      format: 'MAX / FBX / OBJ',
      fileSize: '12.4 GB',
      software: 'Autodesk 3ds Max',
      version: '2024',
      compatibility: '3ds Max 2019 – 2024',
      delivery: 'Instant Digital Download',
      access: 'Lifetime Access'
    },
    compatibility: {
      supportedSoftware: 'Autodesk 3ds Max + V-Ray / Corona Renderer',
      compatibleVersions: '3ds Max 2019+',
      os: 'Windows 10 / 11 (64-bit)',
      fileTypes: '.MAX, .FBX, .OBJ, .MAT',
      requirements: 'Requires 16GB RAM and GPU with 6GB VRAM'
    },
    reviews: [
      {
        id: 'rev-3ds-1',
        author: 'Neha Gupta',
        avatar: 'NG',
        date: 'Aug 2024',
        rating: 5,
        comment: 'Mind-blowing render quality! Material setups and lighting saved our deadline.',
        verified: true
      }
    ]
  },
  {
    id: 'sketchup-architecture-model-collection',
    slug: 'sketchup-architecture-model-collection',
    categorySlug: 'sketchup',
    name: 'SketchUp Architecture Model Collection',
    category: 'Softwares',
    software: 'SketchUp',
    format: 'SKP',
    fileSize: '6.8 GB',
    price: 1899,
    oldPrice: 4499,
    discountPercent: 58,
    rating: 4.7,
    reviewCount: 198,
    downloadsCount: 790,
    badge: 'Popular',
    isBestSeller: false,
    isNewArrival: true,
    createdAt: '2026-09-02T10:00:00.000Z',
    status: 'active',
    shortDescription: 'Vast SketchUp 3D asset library of modern furniture, landscaping, lighting, and facade elements.',
    description: [
      'Streamline your SketchUp workflow with thousands of curated 3D components optimized for low file size and fast viewport performance.',
      'Organized into neat categories: Living, Dining, Office, Plants, Lighting, Vehicles, and Street Furniture.'
    ],
    includedFiles: [
      '3,500+ Low Poly & Detailed 3D Components (.SKP)',
      'Landscape Trees & Vegetation Models',
      'Material Swatch Collections'
    ],
    images: [
      createProductSvg('SKETCHUP ARCHITECTURE PACK', '#1E3A8A', '#2563EB', '🏠'),
      createProductSvg('FURNITURE & LANDSCAPE', '#1D4ED8', '#3B82F6', '🌿')
    ],
    specifications: {
      format: 'SKP',
      fileSize: '6.8 GB',
      software: 'Trimble SketchUp',
      version: '2024',
      compatibility: 'SketchUp 2017 – 2024',
      delivery: 'Instant Digital Download',
      access: 'Lifetime Access'
    },
    compatibility: {
      supportedSoftware: 'Trimble SketchUp (Free, Pro, Studio)',
      compatibleVersions: 'SketchUp 2017+',
      os: 'Windows & Mac',
      fileTypes: '.SKP',
      requirements: 'Runs on standard workstation hardware'
    },
    reviews: [
      {
        id: 'rev-skp-1',
        author: 'Prakash Nair',
        avatar: 'PN',
        date: 'Jul 2024',
        rating: 5,
        comment: 'Clean poly counts, no lag in SketchUp viewport. Very useful library!',
        verified: true
      }
    ]
  },
  {
    id: 'civil-engineering-ebooks-stock-pack',
    slug: 'civil-engineering-ebooks-stock-pack',
    categorySlug: 'ebooks',
    name: 'Civil Engineering Ebooks Stock Pack',
    category: 'eBooks',
    software: 'MS Office',
    format: 'PDF',
    fileSize: '1.2 GB',
    price: 599,
    oldPrice: 1499,
    discountPercent: 60,
    rating: 4.8,
    reviewCount: 275,
    downloadsCount: 1890,
    badge: 'Bestseller',
    isBestSeller: true,
    isNewArrival: false,
    createdAt: '2026-08-05T10:00:00.000Z',
    status: 'active',
    shortDescription: 'Ultimate reference library of civil engineering textbooks, IS codes, structural handbooks, and site guides.',
    description: [
      'Comprehensive digital library featuring fundamental reference guides for civil engineering students, site engineers, structural designers, and project managers.',
      'Includes Indian Standard (IS) codes, structural design handbooks, site execution checklists, and estimation guides in searchable PDF format.'
    ],
    includedFiles: [
      '100+ Civil Engineering Handbooks & Guides (PDF)',
      'Complete IS Code Reference Collection (IS 456, IS 800, etc.)',
      'Site Checklist & Inspection Manuals'
    ],
    images: [
      createProductSvg('CIVIL ENGINEERING EBOOKS', '#7C2D12', '#C2410C', '📚'),
      createProductSvg('HANDBOOKS & IS CODES', '#9A3412', '#EA580C', '📖')
    ],
    specifications: {
      format: 'PDF',
      fileSize: '1.2 GB',
      software: 'PDF Reader',
      version: '2024',
      compatibility: 'All PDF Viewers',
      delivery: 'Instant Digital Download',
      access: 'Lifetime Access'
    },
    compatibility: {
      supportedSoftware: 'Adobe Acrobat, Foxit Reader, Google Drive, Apple Books',
      compatibleVersions: 'Universal PDF standard',
      os: 'Windows, Mac, iOS, Android',
      fileTypes: '.PDF',
      requirements: 'Any device capable of opening PDF files'
    },
    reviews: [
      {
        id: 'rev-ebk-1',
        author: 'Anil Deshmukh',
        avatar: 'AD',
        date: 'Aug 2024',
        rating: 5,
        comment: 'Searchable PDFs make finding structural formulas so quick during site visits.',
        verified: true
      }
    ]
  },
  {
    id: 'lumion-exterior-visualization-scene-pack',
    slug: 'lumion-exterior-visualization-scene-pack',
    categorySlug: 'lumion',
    aliases: ['lumion-10'],
    name: 'Lumion Exterior Visualization Scene Pack',
    category: 'Softwares',
    software: 'Lumion',
    format: 'LS / SKP',
    fileSize: '15.1 GB',
    price: 3499,
    oldPrice: 7999,
    discountPercent: 56,
    rating: 4.9,
    reviewCount: 130,
    downloadsCount: 450,
    badge: 'New',
    isBestSeller: false,
    isNewArrival: true,
    createdAt: '2026-09-07T10:00:00.000Z',
    status: 'active',
    shortDescription: 'Photorealistic Lumion preset scenes with realistic atmosphere effects, lighting styles, and foliage presets.',
    description: [
      'Elevate your architectural renders with 25+ fully configured Lumion scene templates including rainy day, sunset, interior daylight, and cinematic night renders.',
      'Pre-loaded with high-resolution PBR grass, trees, animated people, and custom cinematic camera paths.'
    ],
    includedFiles: [
      '25+ Lumion Project Files (.LS)',
      'Custom Effect Presets & Real Skies',
      'High-Resolution Foliage & Asset Packs'
    ],
    images: [
      createProductSvg('LUMION VISUALIZATION PACK', '#0369A1', '#0284C7', '🌅'),
      createProductSvg('CINEMATIC ATMOSPHERE SCENES', '#075985', '#38BDF8', '🌄')
    ],
    specifications: {
      format: 'LS / SKP',
      fileSize: '15.1 GB',
      software: 'Lumion Pro',
      version: '2024',
      compatibility: 'Lumion 10 – 2024',
      delivery: 'Instant Digital Download',
      access: 'Lifetime Access'
    },
    compatibility: {
      supportedSoftware: 'Lumion 10 Pro, Lumion 11 Pro, Lumion 12 Pro, Lumion 2023/2024',
      compatibleVersions: 'Lumion 10+',
      os: 'Windows 10 / 11 (64-bit)',
      fileTypes: '.LS, .LME, .LPR',
      requirements: 'Requires Nvidia RTX 2060 / AMD RX 5600 or higher GPU'
    },
    reviews: [
      {
        id: 'rev-lum-1',
        author: 'Siddharth Mehta',
        avatar: 'SM',
        date: 'Jul 2024',
        rating: 5,
        comment: 'These effect stacks saved me hours of tweaking lights and shadows in Lumion.',
        verified: true
      }
    ]
  },
  {
    id: 'tekla-structural-model-library',
    slug: 'tekla-structural-model-library',
    categorySlug: 'tekla',
    name: 'Tekla Structural Model Library',
    category: 'Softwares',
    software: 'Tekla',
    format: 'DB1 / DWG',
    fileSize: '5.4 GB',
    price: 2799,
    oldPrice: 6499,
    discountPercent: 57,
    rating: 4.8,
    reviewCount: 94,
    downloadsCount: 380,
    badge: 'Popular',
    isBestSeller: false,
    isNewArrival: true,
    createdAt: '2026-09-06T10:00:00.000Z',
    status: 'active',
    shortDescription: 'Parametric steel connection details, industrial shed models, and rebar detailing templates for Tekla Structures.',
    description: [
      'Professional structural steel and reinforced concrete detailing package for Tekla Structures.',
      'Includes PEB (Pre-Engineered Building) shed templates, bolted truss connections, foundation detailing components, and automated drawing setting attributes.'
    ],
    includedFiles: [
      '150+ Parametric Tekla Components (.uel)',
      '20 PEB Industrial Shed Model Templates',
      'Automated GA & Assembly Drawing Settings'
    ],
    images: [
      createProductSvg('TEKLA STRUCTURAL LIBRARY', '#374151', '#4B5563', '🏗️'),
      createProductSvg('STEEL CONNECTIONS & REBAR', '#1F2937', '#6B7280', '⚙️')
    ],
    specifications: {
      format: 'UEL / DB1 / DWG',
      fileSize: '5.4 GB',
      software: 'Tekla Structures',
      version: '2024',
      compatibility: 'Tekla 2019 – 2024',
      delivery: 'Instant Digital Download',
      access: 'Lifetime Access'
    },
    compatibility: {
      supportedSoftware: 'Trimble Tekla Structures (Primary & Structural Steel)',
      compatibleVersions: 'Tekla Structures 2019+',
      os: 'Windows 10 / 11 (64-bit)',
      fileTypes: '.UEL, .DB1, .DWG',
      requirements: 'Requires installed copy of Tekla Structures'
    },
    reviews: [
      {
        id: 'rev-tek-1',
        author: 'Rohan Joshi',
        avatar: 'RJ',
        date: 'Aug 2024',
        rating: 5,
        comment: 'PEB steel components match Indian fabricator standards perfectly.',
        verified: true
      }
    ]
  },
  {
    id: 'autocad-civil-design-bundle',
    slug: 'autocad-civil-design-bundle',
    categorySlug: 'autocad-software',
    name: 'AutoCAD Civil Design Bundle',
    category: 'Softwares',
    software: 'AutoCAD',
    format: 'DWG / DXF',
    fileSize: '3.8 GB',
    price: 1699,
    oldPrice: 3999,
    discountPercent: 57,
    rating: 4.9,
    reviewCount: 215,
    downloadsCount: 1120,
    badge: 'Popular',
    isBestSeller: true,
    isNewArrival: false,
    createdAt: '2026-08-25T10:00:00.000Z',
    status: 'active',
    shortDescription: 'Road cross-sections, drainage layouts, culvert structural details, and land survey DWG files.',
    description: [
      'Comprehensive CAD drafting set geared towards civil infrastructure engineers.',
      'Contains highway cross-section templates, retaining wall reinforcement details, storm drainage piping blocks, and bridge girder CAD drawings.'
    ],
    includedFiles: [
      '300+ Infrastructure CAD Drawings (.DWG)',
      'Road Cross Section & Longitudinal Profile Templates',
      'Retaining Wall & Culvert Reinforcement Sheets'
    ],
    images: [
      createProductSvg('AUTOCAD CIVIL DESIGN BUNDLE', '#1E1B4B', '#4338CA', '🛣️'),
      createProductSvg('INFRASTRUCTURE & DRAINAGE', '#312E81', '#6366F1', '🌉')
    ],
    specifications: {
      format: 'DWG / DXF',
      fileSize: '3.8 GB',
      software: 'AutoCAD Civil 3D',
      version: '2024',
      compatibility: 'AutoCAD 2012 – 2024',
      delivery: 'Instant Digital Download',
      access: 'Lifetime Access'
    },
    compatibility: {
      supportedSoftware: 'AutoCAD, Civil 3D, MicroStation',
      compatibleVersions: 'AutoCAD 2012+',
      os: 'Windows & Mac',
      fileTypes: '.DWG, .DXF',
      requirements: 'Standard CAD system requirements'
    },
    reviews: [
      {
        id: 'rev-civ-1',
        author: 'Gaurav Kulkarni',
        avatar: 'GK',
        date: 'Jul 2024',
        rating: 5,
        comment: 'Excellent road cross section and drainage details. Ready to drop into municipal submissions.',
        verified: true
      }
    ]
  },
  {
    id: 'ms-project-planning-templates',
    slug: 'ms-project-planning-templates',
    categorySlug: 'projects',
    name: 'MS Project Planning Templates',
    category: 'Projects',
    software: 'MS Project',
    format: 'MPP / XLSX',
    fileSize: '95 MB',
    price: 899,
    oldPrice: 2199,
    discountPercent: 59,
    rating: 4.8,
    reviewCount: 162,
    downloadsCount: 940,
    badge: 'New',
    isBestSeller: false,
    isNewArrival: true,
    createdAt: '2026-09-04T10:00:00.000Z',
    status: 'active',
    shortDescription: 'Gantt charts, WBS breakdown structures, and scheduling templates for high-rise residential & commercial projects.',
    description: [
      'Master project schedules formatted for Microsoft Project and Excel.',
      'Features pre-built Work Breakdown Structures (WBS), resource allocation tables, critical path method (CPM) network diagrams, and milestone trackers tailored for construction management.'
    ],
    includedFiles: [
      '30+ Ready Construction Schedules (.MPP)',
      'Excel Gantt Chart & S-Curve Dashboard',
      'Resource & Labor Histogram Templates'
    ],
    images: [
      createProductSvg('MS PROJECT TEMPLATES', '#065F46', '#059669', '📅'),
      createProductSvg('GANTT CHARTS & CPM SCHEDULES', '#047857', '#34D399', '⏱️')
    ],
    specifications: {
      format: 'MPP / XLSX',
      fileSize: '95 MB',
      software: 'Microsoft Project',
      version: '2024',
      compatibility: 'MS Project 2013 – 2024',
      delivery: 'Instant Digital Download',
      access: 'Lifetime Access'
    },
    compatibility: {
      supportedSoftware: 'Microsoft Project, Primavera P6 (via XML import), Excel',
      compatibleVersions: 'MS Project 2013+',
      os: 'Windows 10 / 11',
      fileTypes: '.MPP, .XLSX, .XML',
      requirements: 'MS Project installed for editing .MPP files'
    },
    reviews: [
      {
        id: 'rev-msp-1',
        author: 'Vikram Singh',
        avatar: 'VS',
        date: 'Aug 2024',
        rating: 5,
        comment: 'Saved me hours setting up WBS codes for a 15-story residential tower schedule.',
        verified: true
      }
    ]
  },
  {
    id: 'excel-construction-estimation-sheets',
    slug: 'excel-construction-estimation-sheets',
    categorySlug: 'excel-sheets',
    name: 'Excel Construction Estimation Sheets',
    category: 'Excel Sheets',
    software: 'MS Office',
    format: 'XLSX',
    fileSize: '120 MB',
    price: 699,
    oldPrice: 1799,
    discountPercent: 61,
    rating: 4.9,
    reviewCount: 310,
    downloadsCount: 1670,
    badge: 'Popular',
    isBestSeller: true,
    isNewArrival: false,
    createdAt: '2026-08-12T10:00:00.000Z',
    status: 'active',
    shortDescription: 'Contractor billing spreadsheets, DPR reports, cash flow forecast models, and measurement sheets.',
    description: [
      'Complete set of financial management and estimation workbooks for building contractors, site managers, and quantity surveyors.',
      'Includes Daily Progress Report (DPR) generators, client running account (RA) bill formats, material reconciliation sheets, and subcontractor payout tracking.'
    ],
    includedFiles: [
      '40+ Contractor Spreadsheet Templates (.XLSX)',
      'RA Bill & Quantity Measurement Workbook',
      'Daily Site Progress Report (DPR) Tool',
      'Labor Payout & Cash Flow Calculator'
    ],
    images: [
      createProductSvg('CONSTRUCTION ESTIMATION SHEETS', '#0F766E', '#14B8A6', '📈'),
      createProductSvg('RA BILLS & CASH FLOW', '#115E59', '#2DD4BF', '📝')
    ],
    specifications: {
      format: 'XLSX',
      fileSize: '120 MB',
      software: 'Microsoft Excel',
      version: '2024',
      compatibility: 'Excel 2010 – 2024',
      delivery: 'Instant Digital Download',
      access: 'Lifetime Access'
    },
    compatibility: {
      supportedSoftware: 'Microsoft Excel, Google Sheets, WPS Office',
      compatibleVersions: 'Excel 2010+',
      os: 'Windows, Mac, Mobile',
      fileTypes: '.XLSX',
      requirements: 'Standard spreadsheet program'
    },
    reviews: [
      {
        id: 'rev-est-1',
        author: 'Deepak Choudhary',
        avatar: 'DC',
        date: 'Aug 2024',
        rating: 5,
        comment: 'RA bill templates match PWD/CPWD billing formats. Highly recommended!',
        verified: true
      }
    ]
  }
];

export const getProductBySlug = (slug: string): Product | undefined => {
  const normalized = slug.trim().toLowerCase().replace(/^\/+|\/+$/g, '');
  return MOCK_PRODUCTS.find(
    (p) =>
      p.slug.toLowerCase() === normalized ||
      p.id.toLowerCase() === normalized ||
      (p.aliases && p.aliases.some((a) => a.toLowerCase() === normalized))
  );
};

