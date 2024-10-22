import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';

const FilterableTable = () => {
  const [filter, setFilter] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newCategory, setNewCategory] = useState({
    slug: '',  // Allow user to manually enter slug
    name: '',
    imageUrl: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
  });
  const [image, setImage] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setFilteredData(data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    setFilteredData((prevData) =>
      (prevData || []).filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(filter.toLowerCase())
        )
      )
    );
  }, [filter]);

  const handleAddNewItem = async () => {
    setIsModalOpen(false);
    setIsLoading(true);
    try {
      let imageUrl = newCategory.imageUrl;

      if (image) {
        const imageBase64 = await convertToBase64(image);
        const response = await fetch('https://murshadpkdata.advanceaitool.com/uploadImage.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: imageBase64 }),
        });

        const result = await response.json();
        if (response.ok) {
          imageUrl = result.image_url;
        } else {
          throw new Error(result.error || 'Failed to upload image');
        }
      }

      const categoryToSubmit = {
        ...newCategory,
        imageUrl,
      };

      const response = newCategory.slug && filteredData.some(item => item.slug === newCategory.slug)
        ? await fetch(`/api/categories/${newCategory.slug}`, {   // Use slug for updates
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(categoryToSubmit),
          })
        : await fetch('/api/categories', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(categoryToSubmit),
          });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Response from server:', responseData);
      setIsModalOpen(false);
      setNewCategory({
        slug: '',
        name: '',
        imageUrl: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
      });
      setImage(null);
      fetchCategories(); // Refresh the data after adding or updating
    } catch (error) {
      console.error('Error adding or updating item:', error);
    }
    setIsLoading(false);
  };

  const handleDeleteItem = async (slug) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/categories/${slug}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to delete category with slug: ${slug}`);
      }
  
      fetchCategories(); // Refresh the categories after deletion
    } catch (error) {
      console.error('Error deleting item:', error);
    }
    setIsLoading(false);
  };

  const handleEditItem = (item) => {
    setNewCategory({
      slug: item.slug,           // Use slug to identify the category
      name: item.name,           // Pre-fill the name
      imageUrl: item.imageUrl,   // Existing image URL
      meta_title: item.meta_title || '',    // Pre-fill existing meta fields
      meta_description: item.meta_description || '',
      meta_keywords: item.meta_keywords || '',
    });
    setIsModalOpen(true);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className=" bg-gray-100 min-h-screen">
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="text-white text-xl">Loading...</div>
        </div>
      )}
      <div className="bg-white shadow rounded-lg p-4 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Categories List</h2>
          <div className="flex space-x-2">
            <button
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
              onClick={() => setIsSearchVisible(!isSearchVisible)}
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>
            <button
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
              onClick={() => {
                setNewCategory({
                  slug: '',  // Allow user to manually enter the slug
                  name: '',
                  imageUrl: '',
                  meta_title: '',
                  meta_description: '',
                  meta_keywords: '',
                });
                setIsModalOpen(true);
              }}
            >
              <PlusIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        {isSearchVisible && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(filteredData) && filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={item.slug} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.imageUrl && <img src={`https://murshadpkdata.advanceaitool.com/uploads/${item.imageUrl}`} alt={item.name} className="w-16 h-16 object-cover" />}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.slug}</td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.updatedAt).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="text-indigo-600 hover:text-indigo-900 transition duration-150 ease-in-out"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.slug)}  // Use slug instead of id
                        className="text-red-600 hover:text-red-900 transition duration-150 ease-in-out"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 w-[700px] rounded shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl mb-4">{newCategory.slug ? 'Edit Category' : 'Add New Category'}</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="mt-1 p-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Slug Input Field */}
            <div className="mb-4">
  <label className="block text-sm font-medium text-gray-700">Slug</label>
  <input
    type="text"
    value={newCategory.slug}
    onChange={(e) => {
      const slugValue = e.target.value.replace(/\s+/g, '-'); // Replace spaces with dashes
      setNewCategory({ ...newCategory, slug: slugValue });
    }}
    className="mt-1 p-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>

            {newCategory.imageUrl && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Current Image</label>
                <img src={`https://murshadpkdata.advanceaitool.com/${newCategory.imageUrl}`} alt={newCategory.name} className="w-32 h-32 object-cover mb-2" />
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">New Image</label>
              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
                className="mt-1 p-2 border border-gray-300 rounded w-full"
              />
            </div>

            {/* Meta Fields */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Meta Title</label>
              <input
                type="text"
                value={newCategory.meta_title}
                onChange={(e) => setNewCategory({ ...newCategory, meta_title: e.target.value })}
                className="mt-1 p-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Meta Description</label>
              <textarea
                value={newCategory.meta_description}
                onChange={(e) => setNewCategory({ ...newCategory, meta_description: e.target.value })}
                className="mt-1 p-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Meta Keywords</label>
              <input
                type="text"
                value={newCategory.meta_keywords}
                onChange={(e) => setNewCategory({ ...newCategory, meta_keywords: e.target.value })}
                className="mt-1 p-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewItem}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                {filteredData.some(item => item.slug === newCategory.slug) ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterableTable;