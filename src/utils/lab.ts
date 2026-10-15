import { getCollection, type CollectionEntry } from "astro:content";

export type LabEntry = CollectionEntry<"lab">;

// Orden: destacados primero, luego prioridad (menor = antes), luego más reciente
export async function getLabEntries(): Promise<LabEntry[]> {
    const entries = await getCollection("lab");
    return entries.sort((a, b) => {
        if (a.data.featured !== b.data.featured)
            return a.data.featured ? -1 : 1;
        if (a.data.priority !== b.data.priority)
            return a.data.priority - b.data.priority;
        return b.data.publishDate.getTime() - a.data.publishDate.getTime();
    });
}

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
});

export const formatLabDate = (date: Date) => dateFormatter.format(date);

// Clase BEM del estado: "Online" -> lab-status--online
export const statusModifier = (status: LabEntry["data"]["status"]) =>
    status
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/\s+/g, "-");
