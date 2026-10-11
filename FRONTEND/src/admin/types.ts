/** @format */
import type { FormatKey } from "../data/formats";

// أشكال البيانات كما يرسلها الخادم للأدمن (مع _id والحقول المخفية عن الزوار)

export interface Media {
  url: string;
  publicId: string;
  resourceType?: "image" | "video";
  width: number;
  height: number;
  alt?: string;
}

export interface AdminBook {
  _id: string;
  slug: string;
  title: string;
  year: number;
  format: FormatKey;
  description: string[];
  client: string;
  services: string;
  location: string;
  cover: Media | null;
  spreads: Media[];
  order: number;
  status: "draft" | "published";
  updatedAt: string;
}

// عنصر من قوائم المحتوى (أغلفة، آراء، أسئلة...): حقوله تختلف حسب النوع
export interface ContentItem {
  _id: string;
  order: number;
  visible: boolean;
  [field: string]: unknown;
}

export interface Message {
  _id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface SettingsDoc {
  email: string;
  location: string;
  responseTime: string;
  city: string;
  timezone: string;
  available: boolean;
  availableText: string;
  busyText: string;
  socials: { label: string; href: string }[];
  videos: Record<"reel" | "stackLeft" | "stackRight", Media | null>;
}
