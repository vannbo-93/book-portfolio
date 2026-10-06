/** @format */

export interface Img {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface Book {
  slug: string;
  title: string;
  year: number;
  description: string;
  cover: Img;
  spreads: Img[];
}
