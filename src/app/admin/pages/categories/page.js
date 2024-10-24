'use client';
import { useEffect, useState } from 'react';
import FilterableTable from './FilterableTable';

const fetchCategories = async () => {
  try {
    const response = await fetch('/api/categories');
    const data = await response.json();
    console.log('Fetched categories:', data); // Debugging information
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

const fetchSubcategories = async (categorySlug = null) => {
  try {
    const response = await fetch(`/api/subcategories${categorySlug ? `?categorySlug=${categorySlug}` : ''}`);
    const data = await response.json();
    console.log('Fetched subcategories:', data); // Debugging information
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return [];
  }
};

const fetchProducts = async (subcategoryIds = []) => {
  try {
    const response = await fetch(`/api/products${subcategoryIds.length ? `?subcategoryIds=${subcategoryIds.join(',')}` : ''}`);
    const data = await response.json();
    console.log('Fetched products:', data); // Debugging information
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchData = async (categorySlug = null) => {
    setIsLoading(true);
    const [fetchedCategories, fetchedSubcategories, fetchedProducts] = await Promise.all([
      fetchCategories(),
      fetchSubcategories(categorySlug),
      fetchProducts(),
    ]);
    setCategories(fetchedCategories);
    setSubcategories(fetchedSubcategories);
    setProducts(fetchedProducts);
    setIsLoading(false);
  };

  const handleCategoryClick = async (categorySlug) => {
    setSelectedCategory(categorySlug);
    const fetchedSubcategories = await fetchSubcategories(categorySlug);
    const subcategoryIds = fetchedSubcategories.map((subcategory) => subcategory.id);
    const fetchedProducts = await fetchProducts(subcategoryIds);
    setSubcategories(fetchedSubcategories);
    setProducts(fetchedProducts);
  };

  useEffect(() => {
    fetchData();
  }, []);

  console.log('Categories:', categories); // Debugging information

  return (
    <div className="container mx-auto ">
      {isLoading ? (
        <div className="text-center text-2xl">Loading...</div>
      ) : (
        <>
          {/* <div className="flex space-x-4 overflow-x-auto mb-4">
            {Array.isArray(categories) && categories.length > 0 ? (
              categories.map((category) => (
                <button
                  key={category.slug}
                  className={`cursor-pointer p-2 rounded ${selectedCategory === category.slug ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
                  onClick={() => handleCategoryClick(category.slug)}
                >
                  {category.name}
                </button>
              ))
            ) : (
              <div>No categories found</div>
            )}
          </div> */}
          <FilterableTable
            products={products}
            fetchCategories={() => fetchData(selectedCategory)}
            categories={categories}
            subcategories={subcategories}
          />
        </>
      )}
    </div>
  );
};

export default ProductsPage;