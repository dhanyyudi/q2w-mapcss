import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ dist: "dist" });
  eleventyConfig.addPassthroughCopy({ "public/uploads": "uploads" });
  eleventyConfig.addPassthroughCopy({ "public/brand": "brand" });
  eleventyConfig.addPassthroughCopy({ "src/site/examples/_data": "examples/_data" });
  eleventyConfig.addPassthroughCopy({ snippets: "snippets" });
  eleventyConfig.addPassthroughCopy({ "snippets/templates": "snippets/templates" });
  eleventyConfig.addPassthroughCopy({
    "public/examples/categorized-real": "examples/categorized-real",
  });
  eleventyConfig.addPassthroughCopy("src/site/_headers");
  eleventyConfig.addPassthroughCopy("src/site/_redirects");

  eleventyConfig.addWatchTarget("dist/");

  eleventyConfig.addShortcode("icon", function (name, size = "16", cls = "") {
    const iconPath = join(
      __dirname,
      "node_modules/lucide-static/icons",
      `${name}.svg`
    );

    try {
      let svg = readFileSync(iconPath, "utf8");
      svg = svg
        .replace(/width="[^"]*"/, `width="${size}"`)
        .replace(/height="[^"]*"/, `height="${size}"`);
      if (cls) {
        svg = svg.replace("<svg", `<svg class="${cls}"`);
      }
      return svg;
    } catch {
      return `<!-- icon "${name}" not found -->`;
    }
  });

  return {
    dir: {
      input: "src/site",
      output: "site",
      includes: "_includes",
      layouts: "_layouts",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
