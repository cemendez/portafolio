import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SOLUCIONES } from "../src/utils/soluciones";
import { onRequestPost, type Env } from "../functions/api/contacto";

const env: Env = {
    TURNSTILE_SECRET: "secreto-prueba",
    RESEND_API_KEY: "re_prueba",
    CONTACT_TO: "yo@ejemplo.com",
};

const formulario = {
    nombre: "Ana López",
    email: "ana@ejemplo.com",
    telefono: "",
    servicio: "gestion_clientes",
    mensaje: "Hola, quiero automatizar mis citas.",
    privacidad: true,
    turnstile: "token-bueno",
    empresa: "",
};

const peticion = (cuerpo: unknown, cabeceras: Record<string, string> = {}) =>
    new Request("https://carlosemendez.com/api/contacto", {
        method: "POST",
        headers: { Origin: "https://carlosemendez.com", ...cabeceras },
        body: typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo),
    });

const llamar = (req: Request) => onRequestPost({ request: req, env });

// fetch simulado: Turnstile y Resend
let fetchSimulado: ReturnType<typeof vi.fn>;
const respuesta = (cuerpo: unknown, status = 200) =>
    new Response(JSON.stringify(cuerpo), { status });

beforeEach(() => {
    fetchSimulado = vi.fn(async (url: string) =>
        url.includes("turnstile")
            ? respuesta({ success: true })
            : respuesta({ id: "correo-1" }),
    );
    vi.stubGlobal("fetch", fetchSimulado);
    vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe("POST /api/contacto", () => {
    it("envía el correo cuando todo es válido", async () => {
        const res = await llamar(peticion(formulario));
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ ok: true });

        const [turnstile, resend] = fetchSimulado.mock.calls;
        expect(turnstile[0]).toContain("turnstile");
        expect(resend[0]).toBe("https://api.resend.com/emails");
        const enviado = JSON.parse(resend[1].body);
        expect(enviado.to).toEqual(["yo@ejemplo.com"]);
        expect(enviado.reply_to).toBe("ana@ejemplo.com");
        expect(enviado.text).toContain(SOLUCIONES.gestion_clientes.nombre);
        expect(resend[1].headers.Authorization).toBe("Bearer re_prueba");
    });

    it("rechaza datos inválidos sin llamar a ningún servicio externo", async () => {
        const res = await llamar(peticion({ ...formulario, email: "nope" }));
        expect(res.status).toBe(422);
        expect((await res.json()).errores.email).toBeDefined();
        expect(fetchSimulado).not.toHaveBeenCalled();
    });

    it("rechaza si Turnstile no lo valida y no envía correo", async () => {
        fetchSimulado.mockImplementation(async () =>
            respuesta({ success: false }),
        );
        const res = await llamar(peticion(formulario));
        expect(res.status).toBe(400);
        expect(fetchSimulado).toHaveBeenCalledTimes(1);
    });

    it("sin secreto configurado responde 500 sin llamar a nadie", async () => {
        const res = await onRequestPost({
            request: peticion(formulario),
            env: { ...env, TURNSTILE_SECRET: "" },
        });
        expect(res.status).toBe(500);
        expect(fetchSimulado).not.toHaveBeenCalled();
    });

    it("el detalle del rechazo de Turnstile solo se devuelve en local", async () => {
        fetchSimulado.mockImplementation(async () =>
            respuesta({
                success: false,
                "error-codes": ["invalid-input-secret"],
            }),
        );
        // producción: sin detalle
        const prod = await (await llamar(peticion(formulario))).json();
        expect(prod.detalle).toBeUndefined();
        // local: con detalle
        const local = await onRequestPost({
            request: new Request("http://127.0.0.1:8788/api/contacto", {
                method: "POST",
                headers: { Origin: "http://127.0.0.1:8788" },
                body: JSON.stringify(formulario),
            }),
            env,
        });
        expect((await local.json()).detalle).toEqual(["invalid-input-secret"]);
    });

    it("rechaza si no llega el token de Turnstile", async () => {
        const res = await llamar(peticion({ ...formulario, turnstile: "" }));
        expect(res.status).toBe(400);
        expect(fetchSimulado).not.toHaveBeenCalled();
    });

    it("el campo trampa lleno responde bien pero no envía nada", async () => {
        const res = await llamar(
            peticion({ ...formulario, empresa: "Spam SA" }),
        );
        expect(res.status).toBe(200);
        expect(fetchSimulado).not.toHaveBeenCalled();
    });

    it("rechaza un origen distinto al del sitio", async () => {
        const res = await llamar(
            peticion(formulario, { Origin: "https://malo.example" }),
        );
        expect(res.status).toBe(403);
        expect(fetchSimulado).not.toHaveBeenCalled();
    });

    it("rechaza JSON roto y cuerpos enormes", async () => {
        expect((await llamar(peticion("{no es json"))).status).toBe(400);
        const grande = { ...formulario, mensaje: "x".repeat(20_000) };
        expect((await llamar(peticion(grande))).status).toBe(413);
    });

    it("avisa con 502 si Resend falla y no revela detalles", async () => {
        fetchSimulado.mockImplementation(async (url: string) =>
            url.includes("turnstile")
                ? respuesta({ success: true })
                : respuesta({ message: "clave inválida" }, 401),
        );
        const res = await llamar(peticion(formulario));
        expect(res.status).toBe(502);
        expect(JSON.stringify(await res.json())).not.toContain("clave");
    });
});
