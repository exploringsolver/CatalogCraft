import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { Button, Typography } from '@material-tailwind/react';
import {
  ArrowLeftIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { formatINR } from '../utils/currency';

function Catalogue() {
  const { id } = useParams();
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const url = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const response = await axios.get(`${url}/catalogue/get-by-id/${id}`);
        setCatalog(response.data);
        setActiveImageIndex(0);
      } catch (requestError) {
        console.error('Error fetching catalog:', requestError);
        setError(requestError?.response?.data?.error || requestError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [id, url]);

  const safeName = catalog?.product_name || 'Product';
  const fallbackImage = `https://source.unsplash.com/featured/1200x900?${encodeURIComponent(
    safeName
  )}`;

  const categoryName =
    catalog && typeof catalog.category === 'object'
      ? catalog.category?.category
      : catalog?.category;

  const imageUrls = useMemo(() => {
    if (!catalog) {
      return [fallbackImage];
    }

    const candidates = [
      catalog.product_image_1,
      catalog.product_image_2,
      catalog.product_image_3,
      catalog.product_image_4,
      catalog.product_image_5,
    ]
      .filter(Boolean)
      .map((image) => (String(image).startsWith('http') ? image : `${url}${image}`));

    return candidates.length > 0 ? candidates : [fallbackImage];
  }, [catalog, fallbackImage, url]);

  const activeImage = imageUrls[activeImageIndex] || fallbackImage;

  if (loading) {
    return (
      <div className="lux-shell">
        <div className="lux-container py-16">
          <div className="lux-panel p-10 text-center text-slate-300">
            Loading premium product view...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lux-shell">
        <div className="lux-container py-16">
          <div className="lux-panel p-10">
            <Typography className="text-2xl font-semibold text-white">
              Unable to load product
            </Typography>
            <Typography className="mt-3 text-slate-300">{error}</Typography>
            <Link to="/catalogs" className="lux-button-secondary mt-6">
              Back to catalogue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lux-shell">
      <div className="lux-container py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link to="/catalogs" className="lux-button-secondary">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to catalogue
          </Link>
          <span className="lux-chip">{categoryName || 'Premium product'}</span>
        </div>

        <div className="mb-10 max-w-4xl">
          <Typography className="text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl lg:text-6xl">
            {catalog.product_name}
          </Typography>
          <Typography className="mt-4 max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
            {catalog.description ||
              'Premium catalogue view with richer product storytelling and structured commercial detail.'}
          </Typography>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <div className="lux-panel overflow-hidden p-4 md:p-5">
              <div className="overflow-hidden rounded-[24px] bg-slate-950/60">
                <img
                  src={activeImage}
                  alt={safeName}
                  className="h-[340px] w-full object-contain md:h-[520px]"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = fallbackImage;
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {imageUrls.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`overflow-hidden rounded-2xl border p-1 transition-all ${
                    activeImageIndex === index
                      ? 'border-[#ff5a1f]/50 bg-[#ff5a1f]/10'
                      : 'border-white/10 bg-white/[0.03]'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${safeName} ${index + 1}`}
                    className="h-20 w-full rounded-xl object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = fallbackImage;
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="lux-panel-highlight p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Typography className="text-sm uppercase tracking-[0.26em] text-slate-400">
                    Premium pricing
                  </Typography>
                  <div className="mt-4 flex items-end gap-4">
                    <Typography className="text-4xl font-semibold tracking-[-0.04em] text-white">
                      {catalog.selling_price ? formatINR(catalog.selling_price) : 'Price on request'}
                    </Typography>
                    {catalog.mrp ? (
                      <Typography className="pb-1 text-base text-slate-500 line-through">
                        {formatINR(catalog.mrp)}
                      </Typography>
                    ) : null}
                  </div>
                </div>
                <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-emerald-300">
                  {catalog.standardized ? 'Verified' : 'Draft'}
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Brand</p>
                  <p className="mt-2 text-sm font-medium text-slate-100">
                    {catalog.brand || 'Independent label'}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Category</p>
                  <p className="mt-2 text-sm font-medium text-slate-100">
                    {categoryName || 'General merchandise'}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button className="rounded-full bg-[#ff5a1f] px-6 shadow-[0_10px_30px_rgba(255,90,31,0.35)]">
                  Contact sales
                </Button>
                <Button
                  variant="outlined"
                  color="white"
                  className="rounded-full border-white/20 px-6 text-slate-100"
                >
                  Request catalogue
                </Button>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="lux-panel p-6">
                <div className="mb-4 inline-flex rounded-2xl border border-[#ff5a1f]/20 bg-[#ff5a1f]/10 p-3 text-[#ff5a1f]">
                  <ShieldCheckIcon className="h-6 w-6" />
                </div>
                <Typography className="text-xl font-semibold tracking-[-0.03em] text-white">
                  Structured product intelligence
                </Typography>
                <Typography className="mt-3 text-sm leading-7 text-slate-300">
                  Clean, enriched fields make this product ready for premium catalog display and downstream workflows.
                </Typography>
              </div>

              <div className="lux-panel p-6">
                <div className="mb-4 inline-flex rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-emerald-300">
                  <CheckBadgeIcon className="h-6 w-6" />
                </div>
                <Typography className="text-xl font-semibold tracking-[-0.03em] text-white">
                  Presentation-ready commerce asset
                </Typography>
                <Typography className="mt-3 text-sm leading-7 text-slate-300">
                  Use this page in demos, portfolios, or investor walkthroughs without it feeling like a raw admin record.
                </Typography>
              </div>
            </div>

            <div className="lux-panel p-6">
              <Typography className="text-sm uppercase tracking-[0.26em] text-slate-500">
                Product intelligence
              </Typography>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  ['Category', categoryName],
                  ['EAN', catalog.ean],
                  ['Brand', catalog.brand],
                  ['Color', catalog.color],
                  ['Size', catalog.size],
                  ['ASIN', catalog.asin],
                  ['UPC / MPN', catalog.upc],
                  ['Standardized', catalog.standardized ? 'Yes' : 'No'],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      {label}
                    </p>
                    <p className="mt-2 break-words text-sm font-medium text-slate-100">
                      {value || 'Not available'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lux-panel p-6">
              <Typography className="text-sm uppercase tracking-[0.26em] text-slate-500">
                Description
              </Typography>
              <Typography className="mt-4 text-base leading-8 text-slate-300">
                {catalog.description || 'No description available for this product.'}
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Catalogue;
