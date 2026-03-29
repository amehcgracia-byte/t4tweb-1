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
        isScrolled ? "bg-background/75 backdrop-blur-xl border-b border-white/10" : "bg-transparent"
      }`}
      style={{ boxShadow: isScrolled ? "0 10px 30px rgba(0,0,0,0.25)" : "none" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 md:h-24 flex items-center justify-between">
          <div className="hidden md:flex items-center w-full justify-center">
            <div className="h-14 inline-flex items-center gap-1 rounded-full border border-white/10 bg-card/70 backdrop-blur-md px-2 shadow-xl shadow-black/25">
              <a href="#" className="h-10 w-10 p-0 rounded-full overflow-hidden shrink-0 transition-transform duration-300 hover:scale-[1.02]">
                <Image
                  src="/images/logo-qr.png"
                  alt="Tales for the Tillerman"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full"
                />
              </a>

              <div className="h-10 w-px bg-white/15 mx-1" aria-hidden="true" />

              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="h-10 px-4 flex items-center justify-center p-0 rounded-full text-base font-medium leading-none text-muted-foreground hover:text-foreground hover:bg-white/8 transition-all duration-200"
                >
                  {link.label}
                </a>
              ))}

              <a
                href="mailto:talesforthetillerman@gmail.com"
                className="h-10 px-5 flex items-center justify-center p-0 rounded-full text-base font-semibold leading-none bg-primary text-primary-foreground shadow-md shadow-primary/30 hover:bg-primary/85 transition-all duration-200"
              >
                Book Now
              </a>
            </div>
          </div>

          <div className="md:hidden flex items-center justify-between w-full">
            <a href="#" className="h-11 w-11 p-0 rounded-full overflow-hidden">
              <Image
                src="/images/logo-qr.png"
                alt="Tales for the Tillerman"
                width={44}
                height={44}
                className="h-11 w-11 rounded-full"
              />
            </a>

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
          <div className="md:hidden pb-4">
            <div className="rounded-2xl border border-white/10 bg-card/90 backdrop-blur-md p-2 flex flex-col gap-1.5 shadow-xl shadow-black/25">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="h-11 px-4 w-full flex items-center p-0 rounded-xl text-base font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="mailto:talesforthetillerman@gmail.com"
                className="h-11 px-4 w-full flex items-center justify-center p-0 bg-primary text-primary-foreground rounded-xl text-base font-semibold text-center hover:bg-primary/80 transition-all duration-300 mt-1"
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
