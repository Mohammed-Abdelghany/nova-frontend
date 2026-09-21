export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  finalPrice: number;
  imageUrl: string;
  images: string[];
  category: string;
  available: boolean;
  bestSeller: boolean;
  createdAt?: string;
}

export interface ProductCreateRequest {
  title: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  discountPercentage: number;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  available?: boolean;
}
