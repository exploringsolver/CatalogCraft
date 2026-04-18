import React from "react";
import { Link } from "react-router-dom";
import { Typography, Button } from "@material-tailwind/react";

function Services() {
  return (
    <div className="lux-shell">
      <div className="lux-container py-12">
        <div className="mb-10">
          <span className="lux-chip">Services</span>
          <Typography variant="h2" className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white md:text-6xl">
            Services
          </Typography>
          <Typography variant="paragraph" className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            Everything you need to build catalogues faster, standardize data,
            and present products with confidence.
          </Typography>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="lux-panel p-6">
              <Typography variant="h5" className="mb-2 font-bold text-white">
                Catalogue Digitization
              </Typography>
              <Typography variant="paragraph" className="text-slate-300">
                Upload templates, match products, and generate structured
                catalogues with consistent fields.
              </Typography>
          </div>

          <div className="lux-panel p-6">
              <Typography variant="h5" className="mb-2 font-bold text-white">
                Image-based Similarity
              </Typography>
              <Typography variant="paragraph" className="text-slate-300">
                Leverage similarity search to speed up product mapping and
                reduce manual work.
              </Typography>
          </div>

          <div className="lux-panel p-6">
              <Typography variant="h5" className="mb-2 font-bold text-white">
                Seller Workflows
              </Typography>
              <Typography variant="paragraph" className="text-slate-300">
                Add products, manage inventory, and keep seller catalogues
                updated in a clear dashboard experience.
              </Typography>
          </div>

          <div className="lux-panel p-6">
              <Typography variant="h5" className="mb-2 font-bold text-white">
                Admin + Templates
              </Typography>
              <Typography variant="paragraph" className="text-slate-300">
                Maintain templates and mapping rules with a dedicated admin
                interface.
              </Typography>
          </div>
        </div>

        <div className="mt-10 flex justify-center gap-3">
          <Button
            className="rounded-full bg-[#ff5a1f] px-8 shadow-[0_10px_30px_rgba(255,90,31,0.35)] hover:shadow-[0_18px_60px_rgba(255,90,31,0.25)]"
            as={Link}
            to="/catalogs"
          >
            Browse Products
          </Button>
          <Button variant="outlined" color="white" as={Link} to="/help" className="rounded-full border-white/20 px-8 text-slate-100">
            See How It Works
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Services;

