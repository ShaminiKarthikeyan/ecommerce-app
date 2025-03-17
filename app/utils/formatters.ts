export const formatPrice = (price: number, currency = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(price);
  };
  
  // Function to generate alt text for broken images
  export const generateImageAlt = (product: { title: string; category?: { name: string } }): string => {
    const category = product.category?.name || 'product';
    return `Image of ${product.title} - ${category}`;
  };