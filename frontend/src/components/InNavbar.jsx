import React, { useContext } from "react";
import {
  Navbar,
  MobileNav,
  Typography,
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  // Card,
  IconButton,
  Collapse,
} from "@material-tailwind/react";
import {
  CubeTransparentIcon,
  UserCircleIcon,
  CodeBracketSquareIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  LifebuoyIcon,
  PowerIcon,
  Bars2Icon,
  ChartBarSquareIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/solid";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import AuthContext from "./Context/Auth/AuthContext";
import Translator from "./Translator";
import { Link } from "react-router-dom";

function ProfileMenu() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const closeMenu = () => setIsMenuOpen(false);
  const { user } = useContext(AuthContext);
  // profile menu component
  const profileMenuItems = [

    {
      label: `${user.name}`,
      icon: UserCircleIcon,
      to: '/profile'
    },
    {
      label: "Edit Profile",
      icon: Cog6ToothIcon,
      to: '/profile'
    },
    {
      label: "Catalogues",
      icon: ShoppingBagIcon,
      to: '/my-cata'
    },
    {
      label: "Help",
      icon: LifebuoyIcon,
      to: '/help'
    },
    // {
    //   label: "Help",
    //   icon: LifebuoyIcon,
    //   to:'/help'
    // },
    //TODO: Logout functionality and profile editing and preview functionality
    //TODO: Help page content
    {
      label: "Sign Out",
      icon: PowerIcon,
      to: '/logout'
    },
  ];

  return (
    <Menu open={isMenuOpen} handler={setIsMenuOpen} placement="bottom-end">
      <MenuHandler>
        <Button
          variant="text"
          color="blue-gray"
          className="flex items-center gap-1 rounded-full py-0.5 pr-2 pl-0.5 lg:ml-auto"
        >
          <Avatar
            variant="circular"
            size="sm"
            alt="tania andrew"
            className="border border-gray-900 p-0.5"
            src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80"
          />
          <ChevronDownIcon
            strokeWidth={2.5}
            className={`h-3 w-3 transition-transform ${isMenuOpen ? "rotate-180" : ""
              }`}
          />
        </Button>
      </MenuHandler>
      <MenuList className="p-1">
        {profileMenuItems.map(({ label, icon, to }, key) => {
          const isLastItem = key === profileMenuItems.length - 1;
          return (
            <Link key={label} to={to} className="block">
              <MenuItem
                onClick={closeMenu}
                className={`flex items-center gap-2 rounded ${isLastItem
                  ? "hover:bg-red-500/10 focus:bg-red-500/10 active:bg-red-500/10"
                  : ""
                  }`}
              >
                {React.createElement(icon, {
                  className: `h-4 w-4 ${isLastItem ? "text-red-500" : ""}`,
                  strokeWidth: 2,
                })}
                <Typography
                  as="span"
                  variant="small"
                  className="font-normal"
                  color={isLastItem ? "red" : "inherit"}
                >
                  {label}
                </Typography>
              </MenuItem>
            </Link>
          );
        })}
      </MenuList>
    </Menu>
  );
}

const navListItems = [
  // {
  //   label: "",
  //   icon: UserCircleIcon,
  // },
  {
    label: "Dashboard",
    icon: ChartBarSquareIcon,
    to: "/dashboard"
  },
  {
    label: "All Catalogues",
    icon: CubeTransparentIcon,
    to: "/catalogs"
  },
  {
    label: "Add Catalog",
    icon: CodeBracketSquareIcon,
    to: "/add-catalog"
  },
  {
    label: "Manage Catalog",
    icon: BuildingLibraryIcon,
    to: "/cata-admin"
  },
];

function NavList() {
  return (
    <ul className="mt-2 flex flex-col gap-2 lg:mt-0 lg:mb-0 lg:flex-row lg:items-center">
      {navListItems.map(({ label, icon, to }) => (
        <li key={label}>
          <Link
            to={to}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/5"
          >
            {React.createElement(icon, { className: "h-[18px] w-[18px] text-[#ef4444]" })}
            <span>{label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function ComplexNavbar() {
  const [isNavOpen, setIsNavOpen] = React.useState(false);

  const toggleIsNavOpen = () => setIsNavOpen((cur) => !cur);

  React.useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setIsNavOpen(false),
    );
  }, []);

  const { logout } = useContext(AuthContext);
  return (
    <Navbar className="sticky top-4 z-50 mx-auto mt-4 max-w-7xl border border-white/10 bg-slate-950/75 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="relative mx-auto flex items-center justify-between text-slate-100">
        <Typography
          as={Link}
          to="/"
          className="mr-4 ml-2 flex flex-col cursor-pointer py-1.5 font-semibold"
        >
          <span className="text-lg tracking-[-0.04em] text-white">CatalogCraft</span>
          <span className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
            Premium Catalog OS
          </span>
        </Typography>
        <div className="hidden lg:block">
          <NavList />
        </div>
        <IconButton
          size="sm"
          color="blue-gray"
          variant="text"
          onClick={toggleIsNavOpen}
          className="ml-auto mr-2 lg:hidden"
        >
          <Bars2Icon className="h-6 w-6" />
        </IconButton>

        <div className="hidden lg:block">
          <Translator />
        </div>
        <ProfileMenu />
        <Button
          size="sm"
          variant="text"
          onClick={logout}
          className="rounded-full text-slate-200 hover:bg-white/5"
        >
          <span className="font-medium">Log out</span>
        </Button>
      </div>
      <Collapse open={isNavOpen} className="overflow-scroll">
        <NavList />
      </Collapse>
    </Navbar>
  );
}