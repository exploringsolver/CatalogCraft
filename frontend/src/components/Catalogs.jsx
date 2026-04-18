import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import Link from React Router
import { EcommerceCard } from './Utils/EcommerceCard';
import { Spinner } from '@material-tailwind/react';
import { formatINR } from '../utils/currency';

function Catalogs() {
  const [catalogsByCategory, setCatalogsByCategory] = useState({});
  const [loading, setLoading] = useState(true); // Add loading state
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
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
       <Spinner/>
      </div>
    );
  }

  return (
    <div className="lux-shell">
      <div className="lux-container py-12">
        <div className="lux-panel-highlight p-8 md:p-10">
          <span className="lux-chip">Catalogue showcase</span>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-white md:text-6xl">
            Browse curated products in a premium commerce interface.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            Explore categories, scan visual inventory quickly, and open products
            in a cleaner, more detailed experience designed for modern ecommerce.
          </p>
        </div>

        <div className="mt-10 space-y-10">
      <h2 className="text-sm uppercase tracking-[0.26em] text-slate-500">Catalogs by Category</h2>
      {Object.entries(catalogsByCategory).map(([category, catalogs]) => (
        <section key={category} className="lux-panel p-6 md:p-8">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Category</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white md:text-3xl">{category}</h2>
            </div>
            <p className="text-sm text-slate-400">{catalogs.length} curated products</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
        </section>
      ))}
        </div>
      </div>
    </div>
  );
}

export default Catalogs;
