import { defineCollection } from "astro:content";
import { z } from "astro/zod";
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
                "E-learning",
                "FullStack",
                "Web App",
                "Freelance",
            ]),
            tags: z.array(z.string()),
            status: z.enum([
                "Online",
                "Offline",
                "Privado",
                "Fase de Lanzamiento",
            ]),
            role: z.string(),
            featured: z.boolean().default(false),
            priority: z.number().default(999),
            demoUrl: z.string().url().optional(),
            repoUrl: z.string().url().optional(),
            // Video de demostracion: solo el ID de YouTube (lo que va despues
            // de ?v=); se carga al hacer clic. videoDate = fecha de subida.
            youtubeId: z
                .string()
                .regex(/^[\w-]{11}$/)
                .optional(),
            videoDate: z.coerce.date().optional(),
        }),
});

// Laboratorio técnico: proyectos de aprendizaje (Node, React, etc.).
// Los archivos que empiezan con "_" se ignoran (plantillas, borradores).
const lab = defineCollection({
    loader: glob({ pattern: "[^_]*.md", base: "./src/content/lab" }),
    schema: ({ image }) =>
        z.object({
            title: z.string(),
            // Una o dos líneas: se usa en la tarjeta y como meta description
            description: z.string().max(220),
            // Opcionales: titulo (<= 60) y descripcion (<= 160) pensados para
            // buscadores; si faltan se usan title y description
            seoTitle: z.string().max(60).optional(),
            seoDescription: z.string().max(160).optional(),
            publishDate: z.coerce.date(),
            updatedDate: z.coerce.date().optional(),
            // Portada opcional: sin ella la tarjeta muestra un bloque con el título
            cover: image().optional(),
            coverAlt: z.string().optional(),
            gallery: z
                .array(
                    z.object({
                        src: image(),
                        alt: z.string(),
                        caption: z.string().optional(),
                    }),
                )
                .default([]),
            // Solo el ID de YouTube (lo que va después de ?v=)
            youtubeId: z
                .string()
                .regex(/^[\w-]{11}$/)
                .optional(),
            // Fecha de subida del video (VideoObject); por defecto la de la ficha
            videoDate: z.coerce.date().optional(),
            stack: z.array(z.string()).min(1),
            status: z.enum(["En desarrollo", "Online", "Offline", "Archivado"]),
            version: z.string().optional(),
            // Página dentro del portafolio (p. ej. /radar), demo externa y repo
            internalUrl: z.string().startsWith("/").optional(),
            demoUrl: z.string().url().optional(),
            demoNote: z.string().optional(),
            repoUrl: z.string().url().optional(),
            // Puntos clave que se muestran como lista en la ficha
            highlights: z.array(z.string()).default([]),
            featured: z.boolean().default(false),
            priority: z.number().int().default(100),
        }),
});

export const collections = { projects, lab };
