import React from "react";
import {
  Navbar,
  Collapse,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  GlobeAmericasIcon,
  SquaresPlusIcon,
  SunIcon,
  TagIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import Translator from "./Translator";

const navListMenuItems = [
  {
    title: "Products",
    description: "Find the perfect solution for your needs.",
    icon: SquaresPlusIcon,
    to: "/catalogs",
  },
  {
    title: "About Us",
    description: "Meet and learn about our dedication",
    icon: UserGroupIcon,
    to: "/about-us",
  },
  // {
  //   title: "Blog",
  //   description: "Find the perfect solution for your needs.",
  //   icon: Bars4Icon,
  // },
  {
    title: "Services",
    description: "Learn how we can help you achieve your goals.",
    icon: SunIcon,
    to: "/services",
  },
  {
    title: "Support",
    description: "Reach out to us for assistance or inquiries",
    icon: GlobeAmericasIcon,
    to: "/support",
  },
  // {
  //   title: "Contact",
  //   description: "Find the perfect solution for your needs.",
  //   icon: PhoneIcon,
  // },
  // {
  //   title: "News",
  //   description: "Read insightful articles, tips, and expert opinions.",
  //   icon: NewspaperIcon,
  // },
  // {
  //   title: "Products",
  //   description: "Find the perfect solution for your needs.",
  //   icon: RectangleGroupIcon,
  // },
  {
    title: "Help",
    description: "Know more about the app",
    icon: TagIcon,
    to: "/help",
  },
];

function NavListMenu() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const renderItems = navListMenuItems.map(
    ({ icon, title, description, to }) => (
      <Link
        key={title}
        to={to}
        className="block"
        onClick={() => {
          setIsMenuOpen(false);
          setIsMobileMenuOpen(false);
        }}
      >
        <MenuItem className="flex items-center gap-3 rounded-lg">
          <div className="flex items-center justify-center rounded-lg !bg-blue-gray-50 p-2 ">
            {" "}
            {React.createElement(icon, {
              strokeWidth: 2,
              className: "h-6 text-gray-900 w-6",
            })}
          </div>
          <div>
            <Typography
              variant="h6"
              color="blue-gray"
              className="flex items-center text-sm font-bold"
            >
              {title}
            </Typography>
            <Typography
              variant="paragraph"
              className="text-xs !font-medium text-blue-gray-500"
            >
              {description}
            </Typography>
          </div>
        </MenuItem>
      </Link>
    ),
  );

  return (
    <React.Fragment>
      <Menu
        open={isMenuOpen}
        handler={setIsMenuOpen}
        offset={{ mainAxis: 20 }}
        placement="bottom"
        allowHover={true}
      >
        <MenuHandler>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/5"
            onClick={() => setIsMobileMenuOpen((cur) => !cur)}
          >
            Resources
            <ChevronDownIcon
              strokeWidth={2.5}
              className={`hidden h-3 w-3 transition-transform lg:block ${isMenuOpen ? "rotate-180" : ""
                }`}
            />
            <ChevronDownIcon
              strokeWidth={2.5}
              className={`block h-3 w-3 transition-transform lg:hidden ${isMobileMenuOpen ? "rotate-180" : ""
                }`}
            />
          </button>
        </MenuHandler>
        <MenuList className="hidden max-w-screen-xl rounded-3xl border border-white/10 bg-[#09101d] p-3 lg:block">
          <ul className="grid grid-cols-3 gap-2 outline-none outline-0">
            {renderItems}
          </ul>
        </MenuList>
      </Menu>
      <div className="block lg:hidden">
        <Collapse open={isMobileMenuOpen}>{renderItems}</Collapse>
      </div>
    </React.Fragment>
  );
}

function NavList() {
  return (
    <div className="mt-4 mb-6 flex flex-col gap-1 p-0 lg:mt-0 lg:mb-0 lg:flex-row lg:items-center lg:p-1">
      <Link
        to="/"
        className="rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/5"
      >
        Home
      </Link>
      <NavListMenu />
      <Link
        to="/help"
        className="rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/5"
      >
        Help
      </Link>
      <a
        href={`${import.meta.env.VITE_BACKEND_URL}/media/images/CatalogCraft.apk`}
        className="rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/5"
      >
        Download App
      </a>
    </div>
  );
}

export function NavbarWithMegaMenu() {
  const [openNav, setOpenNav] = React.useState(false);

  React.useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpenNav(false),
    );
  }, []);

  return (
    <Navbar className="sticky top-4 z-50 mx-auto mt-4 max-w-7xl border border-white/10 bg-slate-950/75 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="flex items-center justify-between text-slate-100">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="mr-4 flex flex-col cursor-pointer py-1.5 lg:ml-2"
          >
            <span className="text-lg font-semibold tracking-[-0.04em] text-white">
              CatalogCraft
            </span>
            <span className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
              Premium Catalog OS
            </span>
          </Link>
        </div>
        <div className="hidden lg:block">
          <NavList />
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <Translator />
          <Link to="/login">
            <Button variant="text" size="sm" className="rounded-full px-5 text-slate-100">
              Log In
            </Button>
          </Link>
          <Link to="/signup">
            <Button size="sm" className="rounded-full bg-[#b91c1c] px-5 shadow-[0_10px_30px_rgba(127,29,29,0.35)]">
              Book Demo
            </Button>
          </Link>
        </div>
        <IconButton
          variant="text"
          color="white"
          className="lg:hidden"
          onClick={() => setOpenNav(!openNav)}
        >
          {openNav ? (
            <XMarkIcon className="h-6 w-6" strokeWidth={2} />
          ) : (
            <Bars3Icon className="h-6 w-6" strokeWidth={2} />
          )}
        </IconButton>
      </div>
      <Collapse open={openNav} className="pt-3">
        <NavList />
        <div className="flex w-full flex-nowrap items-center gap-2 lg:hidden">
          <Link to="/login" className="w-full">
            <Button variant="outlined" size="sm" color="white" fullWidth className="rounded-full border-white/20 text-slate-100">
              Log In
            </Button>
          </Link>
          <Link to="/signup" className="w-full">
            <Button size="sm" fullWidth className="rounded-full bg-[#b91c1c]">
              Book Demo
            </Button>
          </Link>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
          <ArrowRightIcon className="h-4 w-4 text-[#ff5a1f]" />
          Catalog digitization, product enrichment, and portfolio-grade storefronts.
        </div>
      </Collapse>
    </Navbar>
  );
}