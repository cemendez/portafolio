export const youtubeThumbnail = (id: string) =>
    `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

interface VideoSchemaInput {
    id: string;
    name: string;
    description: string;
    uploadDate: Date;
}

// VideoObject (schema.org) para que Google pueda indexar el video de la ficha
export function videoObject({
    id,
    name,
    description,
    uploadDate,
}: VideoSchemaInput) {
    return {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name,
        description,
        thumbnailUrl: [youtubeThumbnail(id)],
        uploadDate: uploadDate.toISOString(),
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
        contentUrl: `https://www.youtube.com/watch?v=${id}`,
        inLanguage: "es-MX",
    };
}
