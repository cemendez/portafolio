import { describe, expect, it } from "vitest";
import { validarContacto } from "./contacto";

const valido = {
    nombre: "Ana López",
    email: "ana@ejemplo.com",
    telefono: "+52 222 123 4567",
    servicio: "gestion_clientes",
    mensaje: "Hola, quiero automatizar mis citas.",
    privacidad: true,
};

describe("validarContacto", () => {
    it("acepta datos correctos", () => {
        const r = validarContacto(valido);
        expect(r.ok).toBe(true);
        if (r.ok) expect(r.datos.servicio).toBe("gestion_clientes");
    });

    it("el teléfono es opcional y el servicio por defecto es 'otro'", () => {
        const { telefono, servicio, ...resto } = valido;
        const r = validarContacto(resto);
        expect(r.ok).toBe(true);
        if (r.ok) {
            expect(r.datos.telefono).toBe("");
            expect(r.datos.servicio).toBe("otro");
        }
    });

    it("rechaza campos vacíos, correo inválido y mensaje corto", () => {
        const r = validarContacto({
            ...valido,
            nombre: "",
            email: "no-es-correo",
            mensaje: "hola",
        });
        expect(r.ok).toBe(false);
        if (!r.ok) {
            expect(Object.keys(r.errores).sort()).toEqual([
                "email",
                "mensaje",
                "nombre",
            ]);
        }
    });

    it("exige haber leído el aviso de privacidad", () => {
        const r = validarContacto({ ...valido, privacidad: false });
        expect(r.ok).toBe(false);
        if (!r.ok) expect(r.errores.privacidad).toBeDefined();
    });

    it("rechaza un servicio que no existe y un teléfono con letras", () => {
        const r = validarContacto({
            ...valido,
            servicio: "hackeo",
            telefono: "abc",
        });
        expect(r.ok).toBe(false);
        if (!r.ok) {
            expect(r.errores.servicio).toBeDefined();
            expect(r.errores.telefono).toBeDefined();
        }
    });

    it("quita saltos de línea de nombre y correo (inyección en cabeceras)", () => {
        const r = validarContacto({
            ...valido,
            nombre: "Ana\r\nBcc: otro@malo.com",
        });
        expect(r.ok).toBe(true);
        if (r.ok) expect(r.datos.nombre).not.toMatch(/[\r\n]/);
    });

    it("conserva los saltos de línea del mensaje", () => {
        const r = validarContacto({
            ...valido,
            mensaje: "Primera línea\nSegunda línea",
        });
        expect(r.ok).toBe(true);
        if (r.ok) expect(r.datos.mensaje).toBe("Primera línea\nSegunda línea");
    });

    it("rechaza límites excedidos y entradas que no son objeto", () => {
        expect(
            validarContacto({ ...valido, mensaje: "x".repeat(2001) }).ok,
        ).toBe(false);
        expect(validarContacto(null).ok).toBe(false);
        expect(validarContacto("hola").ok).toBe(false);
    });
});
