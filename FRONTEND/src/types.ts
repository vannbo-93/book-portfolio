/** @format */
import type { FormatKey } from "./data/formats";

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
  // مقاس الكتاب: يحدد شكل غلافه في قسم آخر الأعمال
  format: FormatKey;
  // نبذة عن المشروع: تظهر تحت "About the project". مصفوفة = عدة فقرات
  description: string | string[];
  // تفاصيل المشروع (اختيارية): ما لم يُكتب لا يظهر
  client?: string;
  services?: string;
  location?: string;
  cover: Img;
  spreads: Img[];
}
