import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { readdirSync, readFileSync } from "node:fs";

// lastmod del sitemap: la config no puede usar astro:content, asi que se lee
// publishDate del frontmatter. Cada proyecto usa su fecha; la home, la mas reciente.
const projectsDir = new URL("./src/content/projects/", import.meta.url);
const publishDates = new Map(
    readdirSync(projectsDir)
        .filter((file) => file.endsWith(".md"))
        .map((file) => {
            const match = readFileSync(new URL(file, projectsDir), "utf8").match(
                /^publishDate:\s*["']?(\d{4}-\d{2}-\d{2})/m,
            );
            return [file.replace(/\.md$/, ""), match && new Date(match[1])];
        })
        .filter(([, date]) => date && !isNaN(date)),
);
const latestDate = new Date(Math.max(...publishDates.values()));

// https://astro.build/config
export default defineConfig({
    devToolbar: {
        enabled: false,
    },
    site: "https://carlosemendez.com",
    integrations: [
        sitemap({
            serialize(item) {
                const { pathname } = new URL(item.url);
                const id = pathname.match(/^\/projects\/([^/]+)\/?$/)?.[1];
                const date = id ? publishDates.get(id) : pathname === "/" ? latestDate : undefined;
                if (date) item.lastmod = date.toISOString();
                return item;
            },
        }),
    ],
});
