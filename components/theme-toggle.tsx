"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "sefa-theme";

/**
 * Dugme za tamnu / svetlu temu.
 *
 * Tema živi na `<html data-theme>`; početnu vrednost postavlja skripta u
 * app/layout.tsx pre iscrtavanja. Ikonica se bira CSS-om (`.theme-toggle__*`
 * u globals.css), pa dugme nema stanja i ne može da se razlikuje između
 * servera i pretraživača.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    root.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* privatni prozor — tema važi samo dok je stranica otvorena */
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
      onClick={toggle}
      aria-label="Promeni temu (tamna / svetla)"
    >
      <Sun className="theme-toggle__sun size-5" />
      <Moon className="theme-toggle__moon size-5" />
    </Button>
  );
}
