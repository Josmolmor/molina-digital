import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Shapes',
};

export default function ShapesLayout({ children }: { children: ReactNode }) {
  return children;
}
