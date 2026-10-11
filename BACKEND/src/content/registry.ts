/** @format */

import { z } from "zod";
import type { Model } from "mongoose";
import { mediaInput } from "../lib/mediaInput.js";
import {
  Cover,
  Experience,
  Faq,
  Service,
  Stat,
  Testimonial,
} from "./models.js";

// كل نوع محتوى: نموذجه في قاعدة البيانات، وفحص بياناته، وما يراه الزائر منه.
// لإضافة نوع جديد: أضف نموذجًا في models.ts ثم سطرًا هنا، فتعمل له كل المسارات تلقائيًا
interface ContentType {
  model: Model<any>;
  fields: z.ZodRawShape; // الحقول الإلزامية عند الإنشاء
  publicFilter?: Record<string, unknown>; // شرط إضافي للظهور للزوار (فوق visible)
}

const text = (max = 300) => z.string().trim().max(max);
const required = (max = 300) => text(max).min(1, "Required");

export const CONTENT: Record<string, ContentType> = {
  covers: {
    model: Cover,
    fields: { title: text(200).default(""), image: mediaInput("image") },
  },
  testimonials: {
    model: Testimonial,
    fields: {
      quote: required(2000),
      name: required(120),
      role: text(200).default(""),
      photo: mediaInput("image").nullable().default(null),
      consent: z.boolean().default(false),
    },
    publicFilter: { consent: true },
  },
  faqs: {
    model: Faq,
    fields: {
      question: required(300),
      tag: text(60).default(""),
      answer: required(3000),
    },
  },
  services: {
    model: Service,
    fields: {
      title: required(150),
      tag: text(100).default(""),
      description: text(1000).default(""),
      images: z.array(mediaInput("image")).max(4).default([]),
    },
  },
  stats: {
    model: Stat,
    fields: {
      value: z.number().min(0).max(1_000_000),
      suffix: text(5).default(""),
      label: required(100),
    },
  },
  experience: {
    model: Experience,
    fields: {
      role: required(120),
      type: text(60).default(""),
      place: required(150),
      years: text(30).default(""),
    },
  },
};

export const CONTENT_TYPES = Object.keys(CONTENT);

const common = {
  order: z.number().int().min(0).optional(),
  visible: z.boolean().default(true),
};

export const createSchema = (type: ContentType) =>
  z.object({ ...type.fields, ...common });
// التعديل: كل الحقول اختيارية (بدون القيم الافتراضية، حتى لا تُمسح الحقول غير المرسلة)
export const updateSchema = (type: ContentType) =>
  z
    .object(
      Object.fromEntries(
        Object.entries({ ...type.fields, ...common }).map(([k, v]) => [
          k,
          (v instanceof z.ZodDefault ? v.removeDefault() : v).optional(),
        ]),
      ),
    )
    .strict();
