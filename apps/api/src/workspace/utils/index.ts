import slugify from "slugify";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 5);

export const generateSlug = (name: string) => {
  return `${slugify(name, { lower: true, strict: true })}-${nanoid(5)}`;
};
