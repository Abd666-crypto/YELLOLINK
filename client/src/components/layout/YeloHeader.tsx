import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ChevronDown, Car, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function YeloHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-3 px-4 mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="font-bold text-2xl bg-gradient-to-r from-yellow-500 to-green-600 bg-clip-text text-transparent">
                YeloLink
              </span>
              <span className="ml-2 text-xs text-muted-foreground hidden md:block">
                Tamale's Ride-Sharing Platform
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/">
              <span className={`text-sm font-medium hover:text-primary transition-colors ${
                isActive("/") ? "text-primary" : "text-muted-foreground"
              }`}>
                Home
              </span>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium flex items-center gap-1 focus:ring-0">
                  <User className="h-4 w-4 mr-1" />
                  Riders
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/rider-request" className="w-full cursor-pointer">
                    Request a Ride
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/rider-status" className="w-full cursor-pointer">
                    Check Ride Status
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium flex items-center gap-1 focus:ring-0">
                  <Car className="h-4 w-4 mr-1" />
                  Drivers
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/driver-register" className="w-full cursor-pointer">
                    Register as Driver
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/driver-dashboard" className="w-full cursor-pointer">
                    Driver Dashboard
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="#about">
              <span className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                About
              </span>
            </Link>
            <Link href="#contact">
              <span className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Contact
              </span>
            </Link>
            <Link href="/subscription/1">
              <span className={`text-sm font-medium transition-colors px-3 py-1 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200 ${
                isActive("/subscription/1") ? "bg-amber-200 font-semibold" : ""
              }`}>
                ✨ Premium
              </span>
            </Link>
          </nav>

          {/* Authentication Button */}
          <div className="hidden md:block">
            <Button className="bg-gradient-to-r from-yellow-500 to-green-600 hover:from-yellow-600 hover:to-green-700 text-white">
              Log In / Sign Up
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle Menu"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <span className={`block py-2 ${
                  isActive("/") ? "text-primary" : "text-foreground"
                }`}>
                  Home
                </span>
              </Link>
              <div className="py-1 border-t"></div>
              <span className="text-sm font-medium text-muted-foreground">Riders</span>
              <Link href="/rider-request" onClick={() => setMobileMenuOpen(false)}>
                <span className={`block py-2 pl-4 ${
                  isActive("/rider-request") ? "text-primary" : "text-foreground"
                }`}>
                  Request a Ride
                </span>
              </Link>
              <Link href="/rider-status" onClick={() => setMobileMenuOpen(false)}>
                <span className={`block py-2 pl-4 ${
                  isActive("/rider-status") ? "text-primary" : "text-foreground"
                }`}>
                  Check Ride Status
                </span>
              </Link>
              <div className="py-1 border-t"></div>
              <span className="text-sm font-medium text-muted-foreground">Drivers</span>
              <Link href="/driver-register" onClick={() => setMobileMenuOpen(false)}>
                <span className={`block py-2 pl-4 ${
                  isActive("/driver-register") ? "text-primary" : "text-foreground"
                }`}>
                  Register as Driver
                </span>
              </Link>
              <Link href="/driver-dashboard" onClick={() => setMobileMenuOpen(false)}>
                <span className={`block py-2 pl-4 ${
                  isActive("/driver-dashboard") ? "text-primary" : "text-foreground"
                }`}>
                  Driver Dashboard
                </span>
              </Link>
              <div className="py-1 border-t"></div>
              <Link href="#about" onClick={() => setMobileMenuOpen(false)}>
                <span className="block py-2">About</span>
              </Link>
              <Link href="#contact" onClick={() => setMobileMenuOpen(false)}>
                <span className="block py-2">Contact</span>
              </Link>
              <div className="py-1 border-t"></div>
              <Link href="/subscription/1" onClick={() => setMobileMenuOpen(false)}>
                <span className={`block py-2 px-3 my-2 bg-amber-100 text-amber-800 rounded-md ${
                  isActive("/subscription/1") ? "bg-amber-200 font-semibold" : ""
                }`}>
                  ✨ Premium Plans
                </span>
              </Link>
              <div className="pt-4">
                <Button className="w-full bg-gradient-to-r from-yellow-500 to-green-600 hover:from-yellow-600 hover:to-green-700 text-white">
                  Log In / Sign Up
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}