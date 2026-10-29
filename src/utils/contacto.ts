// Validación del formulario de contacto. Se usa en el navegador (para avisar
// antes de enviar) y en la función de Cloudflare (que es la que manda: nunca
// se confía en lo que valida el navegador).
import {
    CLAVES_SOLUCIONES,
    SOLUCIONES,
    type ClaveSolucion,
} from "./soluciones";

export const LIMITES = {
    nombre: { min: 2, max: 100 },
    email: { max: 254 },
    telefono: { max: 30 },
    mensaje: { min: 10, max: 2000 },
} as const;

/** Soluciones de /negocios (incluyen las de la calculadora) más "otro". */
export const SERVICIOS_CONTACTO: readonly string[] = [
    ...CLAVES_SOLUCIONES,
    "otro",
];
export type ServicioContacto = ClaveSolucion | "otro";

/** Nombre legible de una opción del formulario (para el correo). */
export const nombreServicio = (clave: ServicioContacto): string =>
    clave === "otro" ? "Otro" : SOLUCIONES[clave].nombre;

export interface DatosContacto {
    nombre: string;
    email: string;
    telefono: string;
    servicio: ServicioContacto;
    mensaje: string;
}

export type ResultadoValidacion =
    | { ok: true; datos: DatosContacto }
    | {
          ok: false;
          errores: Partial<Record<keyof DatosContacto | "privacidad", string>>;
      };

// Campos de una sola línea: sin saltos ni caracteres de control, para que no
// se puedan colar en el asunto o en las cabeceras del correo.
const unaLinea = (valor: unknown): string =>
    typeof valor === "string"
        ? valor.replace(/[\u0000-\u001f\u007f]+/g, " ").trim()
        : "";

// El mensaje conserva los saltos de línea.
const textoLibre = (valor: unknown): string =>
    typeof valor === "string"
        ? valor
              .replace(/\r\n/g, "\n")
              .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
              .trim()
        : "";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEFONO = /^[\d\s()+\-.]*$/;

export function validarContacto(entrada: unknown): ResultadoValidacion {
    const e = (
        typeof entrada === "object" && entrada !== null ? entrada : {}
    ) as Record<string, unknown>;

    const nombre = unaLinea(e.nombre);
    const email = unaLinea(e.email);
    const telefono = unaLinea(e.telefono);
    const mensaje = textoLibre(e.mensaje);
    const servicio = unaLinea(e.servicio) || "otro";

    const errores: Extract<ResultadoValidacion, { ok: false }>["errores"] = {};

    if (
        nombre.length < LIMITES.nombre.min ||
        nombre.length > LIMITES.nombre.max
    ) {
        errores.nombre = `Escribe tu nombre (${LIMITES.nombre.min} a ${LIMITES.nombre.max} caracteres).`;
    }
    if (!EMAIL.test(email) || email.length > LIMITES.email.max) {
        errores.email = "Escribe un correo válido.";
    }
    if (telefono.length > LIMITES.telefono.max || !TELEFONO.test(telefono)) {
        errores.telefono =
            "El teléfono solo puede llevar números, espacios, + y -.";
    }
    if (
        mensaje.length < LIMITES.mensaje.min ||
        mensaje.length > LIMITES.mensaje.max
    ) {
        errores.mensaje = `Cuéntame un poco más (${LIMITES.mensaje.min} a ${LIMITES.mensaje.max} caracteres).`;
    }
    if (!SERVICIOS_CONTACTO.includes(servicio)) {
        errores.servicio = "Elige una opción de la lista.";
    }
    if (e.privacidad !== true) {
        errores.privacidad = "Confirma que leíste el aviso de privacidad.";
    }

    if (Object.keys(errores).length > 0) return { ok: false, errores };

    return {
        ok: true,
        datos: {
            nombre,
            email,
            telefono,
            servicio: servicio as ServicioContacto,
            mensaje,
        },
    };
}
