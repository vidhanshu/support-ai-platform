import slugify from "slugify";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 5);

export const normalizeSlug = (value: string) => {
  return slugify(value, { lower: true, strict: true });
};

export const generateSlug = (name: string) => {
  return `${normalizeSlug(name)}-${nanoid(5)}`;
};
