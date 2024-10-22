import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';

const FilterableTable = ({ subcategories = [], fetchSubcategories }) => {
  const [filter, setFilter] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newSubcategory, setNewSubcategory] = useState({
    name: '',
    slug: '', // Allow user to input slug
    categoryId: '',
    imageUrl: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
  });
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (Array.isArray(subcategories)) {
      setFilteredData(
        subcategories.filter((item) =>
          Object.values(item).some((val) =>
            String(val).toLowerCase().includes(filter.toLowerCase())
          )
        )
      );
    }
  }, [filter, subcategories]);

  const handleAddNewItem = async () => {
    console.log("Sending slug for update:", newSubcategory.slug); // Log the slug before sending
    
    setIsLoading(true);
    try {
      let imageUrl = newSubcategory.imageUrl;
  
      // Upload new image if provided
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
  
      // Use user-provided slug or auto-generate one from name if not provided
      const updatedSlug = newSubcategory.slug ? newSubcategory.slug : generateSlug(newSubcategory.name);
      
      console.log('Slug being sent to the API:', updatedSlug); // Log the slug being sent to the API
  
      const subcategoryToSubmit = {
        ...newSubcategory,
        slug: updatedSlug,
        categoryId: parseInt(newSubcategory.categoryId, 10),
        imageUrl,
      };
  
      // Perform PUT request if slug is present
      const response = newSubcategory.slug
        ? await fetch(`/api/subcategories/${newSubcategory.slug}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(subcategoryToSubmit),
          })
        : await fetch('/api/subcategories', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(subcategoryToSubmit),
          });
  
      const result = await response.json();
  
      if (response.ok) {
        fetchSubcategories(); // Refresh the data after adding or updating
        setIsModalOpen(false);
        resetForm(); // Reset form after submission
      } else {
        console.error('Failed to add/update subcategory:', result.message);
      }
    } catch (error) {
      console.error('Error adding or updating subcategory:', error);
    }
    setIsLoading(false);
  };
  

  const handleDeleteItem = async (slug) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/subcategories/${slug}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete subcategory');
      }

      fetchSubcategories(); // Refresh the data after deletion
    } catch (error) {
      console.error('Error deleting subcategory:', error);
    }
    setIsLoading(false);
  };

  const handleEditItem = (item) => {
    console.log("Editing item with slug:", item.slug); // Add a log to check the slug
    setNewSubcategory({
      ...item,
      slug: item.slug, // Make sure this is the string slug
      image: null, // Reset image for edit
      imageUrl: item.imageUrl,
      meta_title: item.meta_title || '',
      meta_description: item.meta_description || '',
      meta_keywords: item.meta_keywords || '',
    });
    setIsModalOpen(true);
  };
  

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log('Fetched categories:', result); // Log categories for debugging
      setCategories(result.data || []); // Store the categories in state
    } catch (error) {
      console.error('Failed to fetch categories:', error.message); // Log the exact error message
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      fetchCategories();
    }
  }, [isModalOpen]);

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const resetForm = () => {
    setNewSubcategory({
      name: '',
      slug: '', // Reset slug field
      categoryId: '',
      imageUrl: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
    });
    setImage(null);
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  return (
    <div className=" bg-gray-100 w-full min-h-screen">
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="text-white text-xl">Loading...</div>
        </div>
      )}
      <div className="bg-white shadow rounded-lg pb-8 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Sub Categories List</h2>
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
                resetForm();
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(filteredData) && filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.slug}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.imageUrl && (
                        <img
                          src={`https://murshadpkdata.advanceaitool.com/uploads/${item.imageUrl}`}
                          alt={item.name}
                          className="w-16 h-16 object-cover"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="text-indigo-600 hover:text-indigo-900 transition duration-150 ease-in-out"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.slug)}
                        className="text-red-600 hover:text-red-900 transition duration-150 ease-in-out"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-3xl max-h-[90vh] overflow-auto">
            <h2 className="text-xl mb-4">{newSubcategory.slug ? 'Edit Subcategory' : 'Add New Subcategory'}</h2>

            <div className="mb-4 mt-8">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={newSubcategory.name}
                onChange={(e) => setNewSubcategory({ ...newSubcategory, name: e.target.value })}
                className="mt-1 p-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Slug</label>
              <input
                type="text"
                value={newSubcategory.slug}
                onChange={(e) => {
                  const updatedSlug = e.target.value.replace(/\s+/g, '-');
                  setNewSubcategory({ ...newSubcategory, slug: updatedSlug });
                }}
                className="mt-1 p-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={newSubcategory.categoryId}
                onChange={(e) => setNewSubcategory({ ...newSubcategory, categoryId: e.target.value })}
                className="mt-1 p-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {Array.isArray(categories) &&
                  categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>

            {newSubcategory.imageUrl && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Current Image</label>
                <img
                  src={`https://murshadpkdata.advanceaitool.com/uploads/${newSubcategory.imageUrl}`}
                  alt={newSubcategory.name}
                  className="w-32 h-32 object-cover mb-2"
                />
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

            {/* Meta fields */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Meta Title</label>
              <input
                type="text"
                value={newSubcategory.meta_title}
                onChange={(e) => setNewSubcategory({ ...newSubcategory, meta_title: e.target.value })}
                className="mt-1 p-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Meta Description</label>
              <textarea
                value={newSubcategory.meta_description}
                onChange={(e) => setNewSubcategory({ ...newSubcategory, meta_description: e.target.value })}
                className="mt-1 p-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Meta Keywords</label>
              <input
                type="text"
                value={newSubcategory.meta_keywords}
                onChange={(e) => setNewSubcategory({ ...newSubcategory, meta_keywords: e.target.value })}
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
                {newSubcategory.slug ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterableTable;

