import type { LucideProps } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

export type Icon = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

export interface Benefit {
  icon: Icon;
  title: string;
  description: string;
}

export interface HowItWorksStep {
  icon: Icon;
  title: string;
  description: string;
}