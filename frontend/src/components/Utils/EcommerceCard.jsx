import {
  Card,
  Typography,
} from "@material-tailwind/react";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import { formatINR } from "../../utils/currency";

export function EcommerceCard({ imageUrl, productName, price, description, ean }) {
  const safeName = productName || "Product";
  const fallbackImage = `https://source.unsplash.com/featured/600x400?${encodeURIComponent(
    safeName
  )}`;

  return (
    <Card className="group h-full overflow-hidden rounded-[28px] border border-red-900/25 bg-white/[0.04] shadow-[0_18px_55px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-[#ef4444]/35 hover:bg-white/[0.06]">
      <div className="p-4">
        <div className="relative overflow-hidden rounded-[24px] border border-red-900/20 bg-[radial-gradient(circle_at_top,rgba(127,29,29,0.22),transparent_42%),linear-gradient(180deg,rgba(11,11,11,0.96),rgba(7,7,7,0.98))]">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" />
          <div className="flex aspect-[4/3] items-center justify-center p-6">
            <img
              src={imageUrl || fallbackImage}
              alt={safeName}
              loading="lazy"
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = fallbackImage;
              }}
            />
          </div>
        </div>

        <div className="px-1 pb-1 pt-5">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <Typography className="line-clamp-2 text-lg font-semibold tracking-[-0.03em] text-white">
                {productName || "Untitled product"}
              </Typography>
              <Typography className="mt-1 text-sm text-slate-400">
                {ean ? `EAN ${ean}` : "Imported premium catalogue item"}
              </Typography>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 p-2 text-white transition-colors duration-200 group-hover:border-[#ef4444]/40 group-hover:bg-[#7f1d1d]/20">
              <ArrowUpRightIcon className="h-4 w-4" />
            </div>
          </div>

          <Typography className="line-clamp-3 min-h-[72px] text-sm leading-6 text-slate-300">
            {description || "No description available"}
          </Typography>

          <div className="mt-4 flex items-center justify-between">
            <span className="rounded-full border border-red-800/30 bg-red-900/20 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-red-200">
              View catalogue
            </span>
            <Typography className="text-base font-semibold text-white">
              {price ? formatINR(price) : "Discover"}
            </Typography>
          </div>
        </div>
      </div>
    </Card>
  );
}
