"use client";

import {
  Armchair,
  Award,
  Bath,
  Camera,
  ChefHat,
  Clock,
  Compass,
  DoorClosed,
  Hammer,
  Laptop,
  Layers,
  Palette,
  Phone,
  Scissors,
  Shield,
  Sliders,
  Store,
  Utensils,
  Wrench,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

const iconMap: Record<string, ComponentType<LucideProps>> = {
  Armchair,
  Award,
  Bath,
  Camera,
  ChefHat,
  Clock,
  Compass,
  DoorClosed,
  Hammer,
  Laptop,
  Layers,
  Palette,
  Phone,
  Scissors,
  Shield,
  Sliders,
  Store,
  Utensils,
  Wrench,
};

interface ServiceIconProps {
  name: string;
  className?: string;
}

export function ServiceIcon({ name, className }: ServiceIconProps) {
  const Icon = iconMap[name] ?? Wrench;
  return <Icon className={className} aria-hidden="true" />;
}
