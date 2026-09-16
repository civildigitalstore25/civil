import type { CustomerReview } from '../types/product';

export const MOCK_REVIEWS: CustomerReview[] = [
  {
    id: 'review_001',
    userId: 'user_001',
    userName: 'Kiran Patel',
    productId: 'autocad-architecture-complete-bundle-2024',
    productName: 'AutoCAD Architecture Complete Bundle 2024',
    rating: 5,
    comment: 'Absolutely worth every rupee. The DWG files were well-organized and saved me days of custom drawing work.',
    createdAt: '2026-09-05T10:00:00.000Z',
    avatar: 'KP'
  },
  {
    id: 'review_002',
    userId: 'user_002',
    userName: 'Sunita Rao',
    productId: 'revit-bim-complete-family-library-2024',
    productName: 'Revit BIM Complete Family Library 2024',
    rating: 5,
    comment: 'Super fast download speed and clean Revit families. Parametric controls work seamlessly in Revit 2024!',
    createdAt: '2026-09-04T14:30:00.000Z',
    avatar: 'SR'
  },
  {
    id: 'review_003',
    userId: 'user_003',
    userName: 'Manoj Kumar',
    productId: 'civil-estimation-excel-sheet-bundle',
    productName: 'Civil Estimation Excel Sheet Bundle',
    rating: 5,
    comment: 'Calculates steel weights, concrete volume, and rate analysis automatically. Essential tool for site engineers.',
    createdAt: '2026-09-03T09:15:00.000Z',
    avatar: 'MK'
  },
  {
    id: 'review_004',
    userId: 'user_004',
    userName: 'Deepa Krishnan',
    productId: '3ds-max-interior-design-mega-pack',
    productName: '3ds Max Interior Design Mega Pack',
    rating: 5,
    comment: 'Mind-blowing V-Ray scene setup! Photorealistic materials and lighting pre-configured ready for client presentations.',
    createdAt: '2026-09-02T16:45:00.000Z',
    avatar: 'DK'
  },
  {
    id: 'review_005',
    userId: 'user_005',
    userName: 'Arun Verma',
    productId: '3d-home-elevation-design-bundle',
    productName: '3D Home Elevation Design Bundle',
    rating: 5,
    comment: 'Clients love these modern house elevation designs! High quality models rendered smoothly in SketchUp.',
    createdAt: '2026-09-01T11:20:00.000Z',
    avatar: 'AV'
  },
  {
    id: 'review_006',
    userId: 'user_006',
    userName: 'Priya Sharma',
    productId: 'lumion-exterior-visualization-scene-pack',
    productName: 'Lumion Exterior Visualization Scene Pack',
    rating: 5,
    comment: 'The lighting preset and landscape effects in Lumion give an immediate photorealistic boost to our exterior renders.',
    createdAt: '2026-08-30T18:10:00.000Z',
    avatar: 'PS'
  },
  {
    id: 'review_007',
    userId: 'user_007',
    userName: 'Rajesh Sharma',
    productId: 'civil-engineering-ebooks-stock-pack',
    productName: 'Civil Engineering Ebooks Stock Pack',
    rating: 4,
    comment: 'Comprehensive IS code reference library and site inspection handbooks. Very easy to search on phone or tablet.',
    createdAt: '2026-08-28T12:00:00.000Z',
    avatar: 'RS'
  },
  {
    id: 'review_008',
    userId: 'user_008',
    userName: 'Neha Gupta',
    productId: 'ms-project-planning-templates',
    productName: 'MS Project Planning Templates',
    rating: 5,
    comment: 'WBS structures and Gantt chart templates match commercial construction scheduling requirements perfectly.',
    createdAt: '2026-08-25T15:00:00.000Z',
    avatar: 'NG'
  }
];
