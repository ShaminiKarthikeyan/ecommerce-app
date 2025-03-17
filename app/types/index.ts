export interface Product {
    id: number;
    title: string;
    price: number;
    description: string;
    category: Category;
    images: string[];
    creationAt?: string;
    updatedAt?: string;
  }
  
  export interface Category {
    id: number;
    name: string;
    image: string;
    creationAt?: string;
    updatedAt?: string;
  }
  
  export interface User {
    id: number;
    email: string;
    name: string;
    avatar?: string;
    role?: string;
  }
  
  export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  }
  
  export interface ProductsState {
    products: Product[];
    filteredProducts: Product[];
    searchQuery: string;
    selectedCategory: number | null;
    isLoading: boolean;
    error: string | null;
  }