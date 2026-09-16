export interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  oldPrice: number;
  discount: string;
  image: string;
  isBestseller?: boolean;
}

export interface NavItem {
  label: string;
  href: string;
  isActive?: boolean;
  hasDropdown?: boolean;
}
