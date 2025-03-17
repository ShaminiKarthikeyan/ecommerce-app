import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/RootNavigator';
import { fetchProducts, searchProducts } from '../services/api';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';

type ProductsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const ProductsScreen = () => {
  const navigation = useNavigation<ProductsScreenNavigationProp>();
  const { state, dispatch } = useProducts();
  const [searchText, setSearchText] = useState('');
  
  // Fetch products with React Query for caching
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  useEffect(() => {
    if (products) {
      dispatch({ type: 'SET_PRODUCTS', payload: products });
    }
  }, [products, dispatch]);

  // Handle search
  const handleSearch = async (text: string) => {
    setSearchText(text);
    dispatch({ type: 'SET_SEARCH_QUERY', payload: text });
    
    if (text.trim() === '') {
      // If search is empty, show all products
      dispatch({ type: 'SET_FILTERED_PRODUCTS', payload: products || [] });
    } else {
      // Otherwise filter products by title
      const filtered = products?.filter(product => 
        product.title.toLowerCase().includes(text.toLowerCase())
      ) || [];
      dispatch({ type: 'SET_FILTERED_PRODUCTS', payload: filtered });
    }
  };

  const clearSearch = () => {
    setSearchText('');
    dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
    dispatch({ type: 'SET_FILTERED_PRODUCTS', payload: products || [] });
  };


  const handleProductPress = (productId: number) => {
    navigation.navigate('ProductDetail', { productId });
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error loading products</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchText}
          onChangeText={handleSearch}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={state.filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ProductCard 
            product={item} 
            onPress={() => handleProductPress(item.id)} 
          />
        )}
        numColumns={2}
        contentContainerStyle={styles.productList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  productList: {
    padding: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default ProductsScreen;