import React from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";

function AboutUs() {
  return (
    <div className="lux-shell">
      <div className="lux-container py-12">
        <div className="mb-10">
          <span className="lux-chip">About</span>
          <Typography variant="h2" className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white md:text-6xl">
            About CatalogCraft
          </Typography>
          <Typography variant="paragraph" className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            A clean, fast catalogue digitization experience designed for sellers,
            teams, and enterprises that want professional outcomes in minutes—not
            days.
          </Typography>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="lux-panel">
            <CardBody>
              <Typography variant="h5" className="mb-2 font-bold text-white">
                Elegant UI for real workflows
              </Typography>
              <Typography variant="paragraph" className="text-slate-300">
                We focus on readable layouts, sensible states, and smooth
                interaction patterns so your users stay confident.
              </Typography>
            </CardBody>
          </Card>

          <Card className="lux-panel">
            <CardBody>
              <Typography variant="h5" className="mb-2 font-bold text-white">
                Reliable catalogue creation
              </Typography>
              <Typography variant="paragraph" className="text-slate-300">
                Turn product data into structured catalogues with upload + mapping
                flows built for speed.
              </Typography>
            </CardBody>
          </Card>

          <Card className="lux-panel">
            <CardBody>
              <Typography variant="h5" className="mb-2 font-bold text-white">
                Portfolio-grade presentation
              </Typography>
              <Typography variant="paragraph" className="text-slate-300">
                The UI is designed to look premium for investors and demo sessions:
                consistent spacing, typography, and clear product detail pages.
              </Typography>
            </CardBody>
          </Card>
        </div>

        <div className="mt-10 flex justify-center gap-3">
          <Button
            className="rounded-full bg-[#ff5a1f] px-8 shadow-[0_10px_30px_rgba(255,90,31,0.35)] hover:shadow-[0_18px_60px_rgba(255,90,31,0.25)]"
            as={Link}
            to="/catalogs"
          >
            Explore Catalogs
          </Button>
          <Button variant="outlined" color="white" as={Link} to="/help" className="rounded-full border-white/20 px-8 text-slate-100">
            Read Help
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;

