import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  preview: {
    buckets: {
      pictures: { access: "public_read" },
    },
  },
});
