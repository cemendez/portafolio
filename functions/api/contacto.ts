// Cloudflare Pages Function: POST /api/contacto
// Recibe el formulario, valida, comprueba Turnstile y envía el correo con
// Resend. Los secretos viven en Cloudflare (Settings > Variables), no en el repo.
import { nombreServicio, validarContacto } from "../../src/utils/contacto";

export interface Env {
    /** Clave secreta de Turnstile. */
    TURNSTILE_SECRET: string;
    /** API key de Resend. */
    RESEND_API_KEY: string;
    /** Correo que recibe los mensajes. */
    CONTACT_TO: string;
    /** Remitente. Por defecto, el de pruebas de Resend. */
    CONTACT_FROM?: string;
}

const MAX_BYTES = 10_000;

const responder = (status: number, cuerpo: Record<string, unknown>) =>
    new Response(JSON.stringify(cuerpo), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
        },
    });

async function turnstileValido(
    token: string,
    secreto: string,
    ip: string | null,
): Promise<{ ok: boolean; codigos: string[] }> {
    const cuerpo = new FormData();
    cuerpo.append("secret", secreto);
    cuerpo.append("response", token);
    if (ip) cuerpo.append("remoteip", ip);

    const res = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        { method: "POST", body: cuerpo },
    );
    if (!res.ok) return { ok: false, codigos: [`http-${res.status}`] };
    const datos = (await res.json()) as {
        success?: boolean;
        "error-codes"?: string[];
    };
    return {
        ok: datos.success === true,
        codigos: datos["error-codes"] ?? [],
    };
}

// El detalle técnico solo se devuelve al probar en local, nunca en producción
const esLocal = (request: Request) =>
    ["localhost", "127.0.0.1"].includes(new URL(request.url).hostname);

export const onRequestPost = async ({
    request,
    env,
}: {
    request: Request;
    env: Env;
}): Promise<Response> => {
    // Solo se acepta el formulario enviado desde este mismo sitio
    const origen = request.headers.get("Origin");
    if (origen && origen !== new URL(request.url).origin) {
        return responder(403, { ok: false, error: "Origen no permitido." });
    }

    const texto = await request.text();
    if (texto.length > MAX_BYTES) {
        return responder(413, {
            ok: false,
            error: "El mensaje es demasiado largo.",
        });
    }

    let entrada: unknown;
    try {
        entrada = JSON.parse(texto);
    } catch {
        return responder(400, { ok: false, error: "Datos no válidos." });
    }

    const crudo = entrada as Record<string, unknown>;

    // Trampa para bots: este campo está oculto y una persona nunca lo llena.
    // Se responde como si todo hubiera salido bien para no darles pistas.
    if (typeof crudo.empresa === "string" && crudo.empresa !== "") {
        return responder(200, { ok: true });
    }

    const validacion = validarContacto(entrada);
    if (!validacion.ok) {
        return responder(422, { ok: false, errores: validacion.errores });
    }

    const token = typeof crudo.turnstile === "string" ? crudo.turnstile : "";
    if (!env.TURNSTILE_SECRET) {
        console.error("Falta la variable TURNSTILE_SECRET");
        return responder(500, {
            ok: false,
            error: "El formulario no está configurado todavía.",
            ...(esLocal(request) && { detalle: "Falta TURNSTILE_SECRET" }),
        });
    }

    const verificacion =
        token === ""
            ? { ok: false, codigos: ["sin-token"] }
            : await turnstileValido(
                  token,
                  env.TURNSTILE_SECRET,
                  request.headers.get("CF-Connecting-IP"),
              );
    if (!verificacion.ok) {
        console.error("Turnstile rechazó el envío:", verificacion.codigos);
        return responder(400, {
            ok: false,
            error: "No pude verificar que eres una persona. Recarga e inténtalo de nuevo.",
            ...(esLocal(request) && { detalle: verificacion.codigos }),
        });
    }

    const { nombre, email, telefono, servicio, mensaje } = validacion.datos;
    const interes = nombreServicio(servicio);

    const correo = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: env.CONTACT_FROM ?? "Portafolio <onboarding@resend.dev>",
            to: [env.CONTACT_TO],
            reply_to: email,
            subject: `Contacto del portafolio: ${nombre}`,
            // Solo texto plano: lo que escribió el visitante nunca se interpreta como HTML
            text: [
                `Nombre: ${nombre}`,
                `Correo: ${email}`,
                `Teléfono: ${telefono || "(no indicó)"}`,
                `Interés: ${interes}`,
                "",
                mensaje,
            ].join("\n"),
        }),
    });

    if (!correo.ok) {
        console.error("Resend respondió", correo.status, await correo.text());
        return responder(502, {
            ok: false,
            error: "No pude enviar tu mensaje en este momento. Inténtalo de nuevo más tarde.",
        });
    }

    return responder(200, { ok: true });
};

// Cualquier otro método
export const onRequest = (): Response =>
    responder(405, { ok: false, error: "Método no permitido." });
