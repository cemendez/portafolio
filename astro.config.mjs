import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { readdirSync, readFileSync } from "node:fs";

// lastmod del sitemap: la config no puede usar astro:content, asi que las
// fechas se leen del frontmatter (la mas reciente entre publishDate y
// updatedDate). Cada proyecto/ficha usa su fecha; las paginas indice, la mas
// reciente de su coleccion.
function readDates(relativeDir) {
    const dir = new URL(relativeDir, import.meta.url);
    const dateOf = (text, key) => {
        const match = text.match(
            new RegExp(`^${key}:\\s*["']?(\\d{4}-\\d{2}-\\d{2})`, "m"),
        );
        return match ? new Date(match[1]) : null;
    };

    return new Map(
        readdirSync(dir)
            .filter((file) => file.endsWith(".md") && !file.startsWith("_"))
            .map((file) => {
                const text = readFileSync(new URL(file, dir), "utf8");
                const dates = [
                    dateOf(text, "publishDate"),
                    dateOf(text, "updatedDate"),
                ].filter((date) => date && !isNaN(date));
                return [
                    file.replace(/\.md$/, ""),
                    dates.length ? new Date(Math.max(...dates)) : null,
                ];
            })
            .filter(([, date]) => date),
    );
}

const newest = (dates) => new Date(Math.max(...dates));

const projectDates = readDates("./src/content/projects/");
const labDates = readDates("./src/content/lab/");
const latestLab = labDates.size ? newest(labDates.values()) : undefined;
const latestSite = newest([...projectDates.values(), ...labDates.values()]);

function lastmodFor(pathname) {
    const project = pathname.match(/^\/projects\/([^/]+)\/?$/)?.[1];
    if (project) return projectDates.get(project);

    const lab = pathname.match(/^\/lab\/([^/]+)\/?$/)?.[1];
    if (lab) return labDates.get(lab);

    if (/^\/lab\/?$/.test(pathname)) return latestLab;
    if (pathname === "/") return latestSite;
    return undefined; // /radar cambia a diario: sin lastmod
}

// https://astro.build/config
export default defineConfig({
    devToolbar: {
        enabled: false,
    },
    site: "https://carlosemendez.com",
    integrations: [
        sitemap({
            serialize(item) {
                const date = lastmodFor(new URL(item.url).pathname);
                if (date) item.lastmod = date.toISOString();
                return item;
            },
        }),
    ],
});
