import { useState } from "react";
import { Link, useLocation } from "wouter";
import Logo from "./logo";
import { Button } from "./button";
import { useUser } from "../user-context";
import { signOut } from "@/lib/supabase";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import AuthModals from "../auth-modals";

const Header = () => {
  const { user, isLoading } = useUser();
  const [location] = useLocation();
  const [showAuthModal, setShowAuthModal] = useState<"login" | "signup" | null>(null);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  const isActive = (path: string) => location === path;

  const navLinks = [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Demo", href: "/#demo" },
    { label: "Contact", href: "/#contact" }
  ];

  // Auth links based on authentication state
  const authLinks = user ? (
    <>
      <Link href="/dashboard">
        <Button variant="ghost">Dashboard</Button>
      </Link>
      <Button variant="ghost" onClick={handleSignOut}>Log out</Button>
    </>
  ) : (
    <>
      <Button variant="ghost" onClick={() => setShowAuthModal("login")}>Log in</Button>
      <Button variant="default" onClick={() => setShowAuthModal("signup")}>Sign up</Button>
    </>
  );

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/">
                <a className="flex-shrink-0 flex items-center">
                  <Logo />
                </a>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <a className={`text-slate-600 px-3 py-2 text-sm font-medium ${
                    isActive(link.href) ? "text-primary" : "hover:text-primary"
                  }`}>
                    {link.label}
                  </a>
                </Link>
              ))}
            </nav>

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center space-x-2">
              {isLoading ? (
                <div className="h-10 w-20 bg-slate-100 animate-pulse rounded-md"></div>
              ) : (
                authLinks
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Menu">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="flex flex-col gap-6 mt-6">
                    <Link href="/">
                      <a className="flex items-center">
                        <Logo />
                      </a>
                    </Link>
                    <nav className="flex flex-col space-y-4">
                      {navLinks.map((link) => (
                        <Link key={link.href} href={link.href}>
                          <a className={`text-slate-600 py-2 text-base font-medium ${
                            isActive(link.href) ? "text-primary" : "hover:text-primary"
                          }`}>
                            {link.label}
                          </a>
                        </Link>
                      ))}
                      <div className="pt-4 border-t border-slate-200">
                        {user ? (
                          <>
                            <Link href="/dashboard">
                              <a className="block py-2 text-base font-medium text-slate-600 hover:text-primary">
                                Dashboard
                              </a>
                            </Link>
                            <button 
                              onClick={handleSignOut}
                              className="block py-2 text-base font-medium text-slate-600 hover:text-primary"
                            >
                              Log out
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => setShowAuthModal("login")}
                              className="block py-2 text-base font-medium text-slate-600 hover:text-primary"
                            >
                              Log in
                            </button>
                            <button 
                              onClick={() => setShowAuthModal("signup")}
                              className="block py-2 text-base font-medium text-primary hover:text-primary-dark"
                            >
                              Sign up
                            </button>
                          </>
                        )}
                      </div>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Authentication Modals */}
      <AuthModals 
        showModal={showAuthModal} 
        onClose={() => setShowAuthModal(null)} 
      />
    </>
  );
};

export default Header;
