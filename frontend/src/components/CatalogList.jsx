import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import Link from React Router
import { EcommerceCard } from './Utils/EcommerceCard';
import { formatINR } from '../utils/currency';


function CatalogList() {
  const [catalogsByCategory, setCatalogsByCategory] = useState({});
  const url = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/catalogue/get-all`);
        const catalogs = response.data;

        // Group catalogs by category
        const catalogsGroupedByCategory = {};
        catalogs.forEach(catalog => {
          const categoryKey =
            typeof catalog?.category === "object"
              ? catalog?.category?.category
              : catalog?.category;
          const safeKey = categoryKey || "Uncategorized";

          if (safeKey in catalogsGroupedByCategory) {
            catalogsGroupedByCategory[safeKey].push(catalog);
          } else {
            catalogsGroupedByCategory[safeKey] = [catalog];
          }
        });
        
        setCatalogsByCategory(catalogsGroupedByCategory);
      } catch (error) {
        console.error('Error fetching catalogs:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-700">Catalogues by Category</h1>
      {Object.entries(catalogsByCategory).map(([category, catalogs]) => (
        <div key={category} className="mb-8 shadow-lg shadow-black px-5 py-5 rounded">
          <h2 className="text-xl font-bold mb-4 text-orange-700">{category}</h2>
          <hr />
          <div className="flex flex-wrap gap-10 ">
            {catalogs.map((catalog) => {
              const catalogId = catalog?._id || catalog?.id;
              if (!catalogId) return null;

              const productImage = catalog?.product_image_1;
              const imageUrl = productImage
                ? String(productImage).startsWith("http")
                  ? productImage
                  : `${url}${productImage}`
                : null;

              return (
                <Link key={catalogId} to={`/catalogue/${catalogId}`} className="block">
                  <EcommerceCard
                    imageUrl={imageUrl}
                    productName={catalog.product_name}
                    price={formatINR(catalog.selling_price)}
                    description={catalog.description || `MRP: ${catalog.mrp}`}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default CatalogList;
