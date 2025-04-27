import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Car, Menu, User, MapPin, DollarSign } from "lucide-react";

export default function YeloHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  
  // Navigation links
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/rider-request", label: "Request Ride" },
    { href: "/rider-status", label: "Ride Status" },
    { href: "/driver-register", label: "Become a Driver" },
  ];
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Car className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl yelo-text-gradient">YeloLink</span>
          </Link>
        </div>
        
        {/* Mobile menu trigger */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <div className="px-7">
              <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                <Car className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">YeloLink</span>
              </Link>
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center text-base ${
                      location === link.href
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link 
                  href="/driver-dashboard" 
                  className="flex items-center py-2 px-4 bg-primary/10 rounded-md text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  <Car className="mr-2 h-5 w-5" />
                  Driver Dashboard
                </Link>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Desktop navigation */}
        <nav className="flex-1 hidden md:flex items-center space-x-6 justify-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                location === link.href
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        
        {/* Right side buttons */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild className="hidden md:flex">
            <Link href="/driver-dashboard">
              <Car className="mr-2 h-4 w-4" />
              Driver Dashboard
            </Link>
          </Button>
          
          <Button className="hidden sm:flex yelo-gradient">
            <Link href="/rider-request">
              <MapPin className="mr-2 h-4 w-4" />
              Request a Ride
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}