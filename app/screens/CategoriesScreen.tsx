import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories, fetchProductsByCategory } from '../services/api';
import { useProducts } from '../context/ProductContext';
import { RootStackParamList } from '../navigation/RootNavigator';

type CategoriesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const CategoriesScreen = () => {
  const navigation = useNavigation<CategoriesScreenNavigationProp>();
  const { dispatch } = useProducts();
  
  const { 
    data: categories, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const handleCategoryPress = async (categoryId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const products = await fetchProductsByCategory(categoryId);
      dispatch({ type: 'SET_FILTERED_PRODUCTS', payload: products });
      dispatch({ type: 'SET_SELECTED_CATEGORY', payload: categoryId });
      dispatch({ type: 'SET_LOADING', payload: false });
      
      // Navigate to products tab
      navigation.navigate('Products');
    } catch (error) {
      console.error('Error fetching category products:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load category products' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
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
        <Text style={styles.errorText}>Error loading categories</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.categoryItem}
            onPress={() => handleCategoryPress(item.id)}
          >
            <View style={styles.categoryContent}>
              <View style={styles.imageContainer}>
                <Text style={styles.altText}>
                  {`Image of ${item.name} category`}
                </Text>
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={styles.categoryAction}>View Products</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
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
  list: {
    padding: 16,
  },
  categoryItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  altText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  categoryInfo: {
    flex: 1,
    padding: 16,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  categoryAction: {
    color: '#3498db',
    fontWeight: '600',
  },
});

export default CategoriesScreen;