import React from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";

function Support() {
  return (
    <div className="lux-shell">
      <div className="lux-container py-12">
        <div className="mb-10">
          <span className="lux-chip">Support</span>
          <Typography variant="h2" className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white md:text-6xl">
            Support
          </Typography>
          <Typography variant="paragraph" className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            Questions, onboarding, or technical help—start here and we’ll guide
            you to the right place.
          </Typography>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="lux-panel">
            <CardBody>
              <Typography variant="h5" className="mb-2 font-bold text-white">
                Quick Links
              </Typography>
              <ul className="space-y-2 text-slate-300">
                <li>
                  <Link to="/help" className="text-[#ff5a1f] hover:underline">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    to="/product-search"
                    className="text-[#ff5a1f] hover:underline"
                  >
                    Search Products
                  </Link>
                </li>
                <li>
                  <Link to="/bulk-data" className="text-[#ff5a1f] hover:underline">
                    Bulk Upload
                  </Link>
                </li>
              </ul>
            </CardBody>
          </Card>

          <Card className="lux-panel">
            <CardBody>
              <Typography variant="h5" className="mb-2 font-bold text-white">
                Contact (Demo)
              </Typography>
              <Typography variant="paragraph" className="text-slate-300">
                For VC/investor demos, we keep support simple and clean. Replace
                this section with your real email/WhatsApp form later.
              </Typography>

              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <Typography variant="small" className="text-slate-500">
                    Email
                  </Typography>
                  <Typography className="font-medium text-white">
                    support@catalogcraft.example
                  </Typography>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <Typography variant="small" className="text-slate-500">
                    Response Time
                  </Typography>
                  <Typography className="font-medium text-white">
                    Within 24 hours
                  </Typography>
                </div>
              </div>

              <div className="mt-5 flex gap-3 flex-wrap">
                <Button as={Link} to="/help" className="rounded-full bg-[#ff5a1f]">
                  Go to Help Center
                </Button>
                <Button as={Link} to="/catalogs" variant="outlined" color="white" className="rounded-full border-white/20 text-slate-100">
                  Explore Products
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Support;

