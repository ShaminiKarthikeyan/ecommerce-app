import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  FlatList
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/RootNavigator';
import { fetchProductById, fetchProductsByCategory } from '../services/api';
import { formatPrice, generateImageAlt } from '../utils/formatters';
import ProductCard from '../components/ProductCard';

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;
type ProductDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>;

const { width } = Dimensions.get('window');

const ProductDetailScreen = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const navigation = useNavigation<ProductDetailNavigationProp>();
  const { productId } = route.params;
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Fetch product details
  const { 
    data: product, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProductById(productId),
  });

  // Fetch related products (same category)
  const {
    data: relatedProducts,
    isLoading: isLoadingRelated,
  } = useQuery({
    queryKey: ['relatedProducts', product?.category?.id],
    queryFn: () => fetchProductsByCategory(product?.category?.id || 0),
    enabled: !!product?.category?.id,
  });

  // Filter out the current product from related products
  const filteredRelatedProducts = relatedProducts?.filter(
    (item) => item.id !== productId
  ) || [];

  const handleImageChange = (index: number) => {
    setActiveImageIndex(index);
  };

  const handleRelatedProductPress = (id: number) => {
    navigation.push('ProductDetail', { productId: id });
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error loading product details</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Image Carousel */}
      <View style={styles.carouselContainer}>
        <View style={styles.imageContainer}>
          <Text style={styles.altText}>
            {generateImageAlt(product)}
          </Text>
        </View>
        
        {/* Image Indicators */}
        <View style={styles.indicatorsContainer}>
          {product.images.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.indicator,
                activeImageIndex === index && styles.activeIndicator,
              ]}
              onPress={() => handleImageChange(index)}
            />
          ))}
        </View>
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
        </View>
        
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryLabel}>Category:</Text>
          <Text style={styles.categoryValue}>{product.category.name}</Text>
        </View>
        
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionLabel}>Description:</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>
        
        <TouchableOpacity style={styles.addToCartButton}>
          <Ionicons name="cart" size={20} color="white" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>

      {/* Related Products */}
      <View style={styles.relatedContainer}>
        <Text style={styles.relatedTitle}>Related Products</Text>
        
        {isLoadingRelated ? (
          <ActivityIndicator size="small" color="#3498db" />
        ) : filteredRelatedProducts.length > 0 ? (
          <FlatList
            data={filteredRelatedProducts.slice(0, 6)}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() => handleRelatedProductPress(item.id)}
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.relatedList}
          />
        ) : (
          <Text style={styles.noRelatedText}>No related products found</Text>
        )}
      </View>
    </ScrollView>
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
  carouselContainer: {
    width: width,
    height: 300,
    backgroundColor: 'white',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  altText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    padding: 20,
  },
  indicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#3498db',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  infoContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  categoryValue: {
    fontSize: 16,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  addToCartButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  addToCartText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  relatedContainer: {
    margin: 16,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  relatedList: {
    paddingBottom: 16,
  },
  noRelatedText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default ProductDetailScreen;