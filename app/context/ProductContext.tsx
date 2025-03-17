import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ProductsState, Product } from '../types';

type ProductAction =
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_FILTERED_PRODUCTS'; payload: Product[] }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SELECTED_CATEGORY'; payload: number | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: ProductsState = {
  products: [],
  filteredProducts: [],
  searchQuery: '',
  selectedCategory: null,
  isLoading: false,
  error: null,
};

const ProductContext = createContext<{
  state: ProductsState;
  dispatch: React.Dispatch<ProductAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

const productReducer = (state: ProductsState, action: ProductAction): ProductsState => {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload, filteredProducts: action.payload };
    case 'SET_FILTERED_PRODUCTS':
      return { ...state, filteredProducts: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(productReducer, initialState);

  return (
    <ProductContext.Provider value={{ state, dispatch }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);