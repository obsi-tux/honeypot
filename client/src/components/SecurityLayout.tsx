import { Link, useLocation } from "wouter";
import { ArrowUpRight, Menu, Moon, ShieldCheck, Sun, X } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

const navItems = [
  ["Scan", "/scan"],
  ["Docs", "/docs"],
  ["Pricing", "/pricing"],
  ["About", "/about"],
] as const;

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b hairline bg-background/95 backdrop-blur-sm">
        <div className="container flex h-[72px] items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <ShieldCheck size={19} strokeWidth={2.5} />
            </span>
            <span className="display-font text-[17px] font-bold tracking-[-0.04em]">secret leak detector</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
            {navItems.map(([label, href]) => (
              <Link key={href} href={href} className={`text-sm font-semibold transition-colors ${location === href ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button onClick={toggleTheme} className="flex h-9 w-9 items-center justify-center rounded-full border hairline text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <Link href="/scan" className="button-primary py-2.5 text-sm">Open scanner <ArrowUpRight size={15} /></Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button onClick={toggleTheme} className="flex h-9 w-9 items-center justify-center rounded-full border hairline text-muted-foreground" aria-label="Toggle color theme">
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button onClick={() => setOpen(value => !value)} className="flex h-9 w-9 items-center justify-center rounded-full border hairline" aria-label="Toggle menu">
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {open && (
          <div className="border-t hairline bg-background md:hidden">
            <nav className="container flex flex-col gap-1 py-3" aria-label="Mobile navigation">
              {navItems.map(([label, href]) => (
                <Link key={href} href={href} onClick={() => setOpen(false)} className={`rounded-lg px-3 py-3 text-sm font-semibold ${location === href ? "bg-secondary text-primary" : "text-muted-foreground"}`}>
                  {label}
                </Link>
              ))}
              <Link href="/scan" onClick={() => setOpen(false)} className="button-primary mt-2">Open scanner <ArrowUpRight size={15} /></Link>
            </nav>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="border-t hairline">
        <div className="container grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:py-16">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"><ShieldCheck size={16} /></span>
              <span className="display-font font-bold">secret leak detector</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">A local-first layer for the moment between writing code and sharing it with the world.</p>
            <p className="mono-font mt-6 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">signal over spectacle</p>
          </div>
          <div>
            <p className="eyebrow mb-4">Product</p>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground"><Link href="/scan" className="hover:text-foreground">Live scanner</Link><Link href="/docs" className="hover:text-foreground">Documentation</Link><Link href="/pricing" className="hover:text-foreground">Pricing</Link></div>
          </div>
          <div>
            <p className="eyebrow mb-4">Company</p>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground"><Link href="/about" className="hover:text-foreground">About</Link><Link href="/privacy" className="hover:text-foreground">Privacy policy</Link><Link href="/terms" className="hover:text-foreground">Terms & conditions</Link></div>
          </div>
          <div>
            <p className="eyebrow mb-4">Security posture</p>
            <p className="text-sm leading-6 text-muted-foreground">Raw values are masked as soon as they are detected. Findings are designed to be safe to review in logs and CI output.</p>
          </div>
        </div>
        <div className="container flex flex-col gap-2 border-t hairline py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span>© 2026 Secret Leak Detector</span><span className="mono-font">v0.1 / detector engine online</span></div>
      </footer>
    </div>
  );
}
