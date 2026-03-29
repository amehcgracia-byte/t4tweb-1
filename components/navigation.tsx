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
          ? "bg-background/75 backdrop-blur-xl border-b border-white/10 shadow-xl shadow-black/25"
          : "bg-transparent"
      }`}
      style={{ boxShadow: isScrolled ? "0 10px 30px rgba(0,0,0,0.25)" : "none" }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-7 lg:px-10">
        <div className="flex items-center justify-between h-20 md:h-[5.5rem]">
          <a href="#" className="flex items-center p-0 transition-transform duration-300 hover:-translate-y-0.5">
            <Image
              src="/images/logo-qr.png"
              alt="Tales for the Tillerman"
              width={68}
              height={68}
              className="h-14 w-14 md:h-[4.25rem] md:w-[4.25rem] rounded-full shadow-lg shadow-black/30"
            />
          </a>

          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="h-12 px-4 flex items-center justify-center p-0 rounded-lg text-base lg:text-lg font-medium leading-none text-muted-foreground hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
            <a
              href="mailto:talesforthetillerman@gmail.com"
              className="h-12 px-5 flex items-center justify-center p-0 bg-primary text-primary-foreground rounded-lg text-base lg:text-lg font-semibold leading-none shadow-lg shadow-primary/25 hover:bg-primary/80 transition-all duration-300"
            >
              Book Now
            </a>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="h-11 w-11 p-0 inline-flex items-center justify-center text-foreground rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border bg-background/95 backdrop-blur-sm">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="h-11 px-4 w-full flex items-center p-0 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="mailto:talesforthetillerman@gmail.com"
                className="h-11 px-4 w-full flex items-center justify-center p-0 bg-primary text-primary-foreground rounded-lg text-base font-semibold text-center hover:bg-primary/80 transition-all duration-300 mt-1"
              >
                Book Now
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
