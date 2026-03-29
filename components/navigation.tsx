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

  const navButtonClass =
    "inline-flex items-center justify-center min-w-[5.25rem] px-4 lg:px-5 h-11 lg:h-12 rounded-xl bg-orange-500/85 text-white text-[0.98rem] lg:text-[1.03rem] font-medium leading-none tracking-[0.01em] whitespace-nowrap hover:bg-orange-400 transition-all duration-200 shadow-lg shadow-orange-900/20"

  const mobileNavButtonClass = `${navButtonClass} w-full`

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-2xl border-b border-white/10 shadow-xl shadow-black/25"
          : "bg-transparent"
      }`}
      style={{ boxShadow: isScrolled ? "0 10px 30px rgba(0,0,0,0.25)" : "none" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 md:h-[5.5rem] flex items-center">
          <div className="w-full h-16 md:h-[4.5rem] px-3 md:px-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03]">
            <a
              href="#"
              className="h-12 w-12 md:h-14 md:w-14 shrink-0 p-0 inline-flex items-center justify-center rounded-full transition-transform duration-300 hover:-translate-y-0.5"
            >
              <Image
                src="/images/logo-qr.png"
                alt="Tales for the Tillerman"
                width={56}
                height={56}
                className="h-full w-full rounded-full shadow-lg shadow-black/30"
              />
            </a>

            <div className="hidden md:flex flex-1 items-center justify-end gap-1.5 lg:gap-2 pl-3 lg:pl-4">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className={navButtonClass}>
                  {link.label}
                </a>
              ))}
              <a
                href="mailto:talesforthetillerman@gmail.com"
                className={`${navButtonClass} ml-1 font-semibold`}
              >
                Book Now
              </a>
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="h-10 w-10 p-0 inline-flex items-center justify-center text-foreground rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 -mt-1">
            <div className="rounded-xl border border-white/10 bg-background/95 backdrop-blur-sm p-2.5 flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={mobileNavButtonClass}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="mailto:talesforthetillerman@gmail.com"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`${mobileNavButtonClass} mt-1 font-semibold text-center`}
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
