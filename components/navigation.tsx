"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false)
    }

    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleEsc)
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleEsc)
    }
  }, [isMobileMenuOpen])

  const navLinks = [
    { href: "#about", label: "About" },
    { href: "#press-kit", label: "Press" },
    { href: "#band", label: "Band" },
    { href: "#live", label: "Live" },
    { href: "#contact", label: "Contact" },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/70 backdrop-blur-xl border-b border-white/10 shadow-xl shadow-black/25"
          : "bg-gradient-to-b from-black/75 via-black/45 to-transparent border-b border-white/10"
      }`}
      style={{ boxShadow: isScrolled ? "0 10px 30px rgba(0,0,0,0.25)" : "none" }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-7 lg:px-10">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Logo izquierdo */}
          <a href="#hero" aria-label="Go to top section" className="flex items-center transition-transform duration-300 hover:-translate-y-0.5">
            <Image
              src="/images/logo-qr.png"
              alt="Tales for the Tillerman"
              width={90}
              height={90}
              className="rounded-full shadow-lg shadow-black/40 ring-1 ring-white/30"
            />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-14">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-lg md:text-xl text-gray-200/90 hover:text-foreground transition-all duration-200 font-medium hover:text-white"
                style={{ lineHeight: 1.2 }}
              >
                {link.label}
              </a>
            ))}
            <a
              href="mailto:talesforthetillerman@gmail.com"
              className="px-8 py-4 bg-primary text-primary-foreground rounded-xl text-lg md:text-xl font-semibold shadow-lg shadow-primary/30 hover:bg-primary/80 transition-all duration-300"
            >
              Book Now
            </a>
          </div>

          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-3 text-foreground rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav-menu"
            >
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <>
            <button
              aria-label="Close menu overlay"
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 top-20 z-40 bg-black/60 md:hidden"
            />
            <div id="mobile-nav-menu" className="relative z-50 md:hidden py-4 border-t border-border bg-background/95 backdrop-blur-sm">
              <div className="flex flex-col gap-5">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base md:text-lg text-gray-200 hover:text-foreground transition-colors py-3"
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href="mailto:talesforthetillerman@gmail.com"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-5 py-4 bg-primary text-primary-foreground rounded-xl text-base md:text-lg font-semibold text-center hover:bg-primary/80 transition-all duration-300 mt-3"
                >
                  Book Now
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  )
}
