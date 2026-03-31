import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const projects = defineCollection({
    loader: glob({
        pattern: "**/[^_]*.{md,mdx}",
        base: "./src/content/projects",
    }),
    schema: ({ image }) =>
        z.object({
            title: z.string(),
            description: z.string(),
            publishDate: z.coerce.date(),
            image: image(),
            category: z.enum([
                "GIS",
                "Gobierno",
                "E-commerce",
                "FullStack",
                "Web App",
                "Freelance",
            ]),
            tags: z.array(z.string()),
            status: z.enum(["Online", "Offline", "Privado"]),
            role: z.string(),
            featured: z.boolean().default(false),
            demoUrl: z.string().url().optional(),
            repoUrl: z.string().url().optional(),
        }),
});

export const collections = { projects };
