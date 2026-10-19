// Eventos de GA4. Solo existen en producción (Analytics.astro define window.gtag);
// en local o con el bloqueador activo no hace nada. Nunca enviar datos personales.
type Parametros = Record<string, string | number | boolean>;

export function registrarEvento(
    nombre: string,
    parametros: Parametros = {},
): void {
    const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
    gtag?.("event", nombre, parametros);
}
