import { describe, expect, it } from "vitest";
import {
    compararOpciones,
    calcularRoi,
    costoAcumulado,
    mesesParaRecuperar,
    precios,
    type EntradaRoi,
} from "./roi";

// Todos los resultados esperados se calcularon a mano (ver comentarios).
const base: EntradaRoi = {
    servicio: "gestion_clientes", // eficiencia 0.45, recuperación 0.40, con margen
    horasSemana: 10,
    costoHora: 100,
    perdidasMes: 4,
    valorPorCliente: 800,
    margen: 0.35,
};

const pagoUnico = {
    inicial: 17500,
    mensualidad: 0,
    mesesCuotas: 0,
    mantenimiento: 0,
};

describe("precios", () => {
    it("lista = horas x $350; plan = 30% inicial + 18 mensualidades", () => {
        // sitio: 20 h -> 7,000 | inicial 2,100 | (4,900 / 18 = 272.2) -> 275
        expect(precios("sitio_web")).toEqual({
            lista: 7000,
            mantenimiento: 450,
            plan: {
                inicial: 2100,
                mensualidad: 275,
                mesesCuotas: 18,
                total: 7050,
            },
        });
        expect(precios("automatizacion_administrativa").plan).toMatchObject({
            inicial: 3675,
            mensualidad: 480,
            total: 12315,
        });
        expect(precios("gestion_clientes").plan).toMatchObject({
            inicial: 5250,
            mensualidad: 685,
            total: 17580,
        });
        expect(precios("inventario").plan).toMatchObject({
            inicial: 7350,
            mensualidad: 955,
            total: 24540,
        });
    });

    it("el plan nunca cuesta menos que la lista", () => {
        for (const s of [
            "sitio_web",
            "automatizacion_administrativa",
            "gestion_clientes",
            "inventario",
        ] as const) {
            const p = precios(s);
            expect(p.plan.total).toBeGreaterThanOrEqual(p.lista);
        }
    });
});

describe("calcularRoi (pago único)", () => {
    const r = calcularRoi(base, pagoUnico);
    const esc = (n: string) => r.escenarios.find((e) => e.escenario === n)!;

    it("calcula el costo actual de no resolver el problema", () => {
        // tiempo: 10 * 4.33 * 100 = 4,330 ; pérdida: 4 * 800 * 0.35 = 1,120
        expect(r.costoActualMensual).toBe(5450);
        expect(r.tiempoMensualActual).toBe(4330);
        expect(r.perdidaMensualActual).toBe(1120);
    });

    it("escenario esperado", () => {
        // ahorro: 4,330 * 0.45 = 1,948.5 ; utilidad: 4 * 800 * 0.40 * 0.35 = 448
        // beneficio = 2,396.5 -> 17,500 / 2,396.5 = 7.3 meses
        // ROI = (2,396.5 * 12 - 17,500) / 17,500 = 64.3 %
        expect(esc("esperado")).toMatchObject({
            ahorroTiempoMensual: 1948.5,
            utilidadRecuperadaMensual: 448,
            beneficioMensual: 2396.5,
            mesesRecuperacion: 7.3,
            roiPrimerAnioPct: 64.3,
        });
    });

    it("escenarios conservador (x0.5) y optimista (x1.4)", () => {
        // conservador: 1,198.25 -> 14.6 meses ; ROI (14,379 - 17,500)/17,500 = -17.8 %
        expect(esc("conservador")).toMatchObject({
            beneficioMensual: 1198.25,
            mesesRecuperacion: 14.6,
            roiPrimerAnioPct: -17.8,
        });
        // optimista: 3,355.1 -> 5.2 meses ; ROI (40,261.2 - 17,500)/17,500 = 130.1 %
        expect(esc("optimista")).toMatchObject({
            beneficioMensual: 3355.1,
            mesesRecuperacion: 5.2,
            roiPrimerAnioPct: 130.1,
        });
    });

    it("sin beneficio no hay recuperación", () => {
        const sin = calcularRoi(
            { ...base, horasSemana: 0, perdidasMes: 0 },
            pagoUnico,
        );
        sin.escenarios.forEach((e) => {
            expect(e.mesesRecuperacion).toBeNull();
            expect(e.roiPrimerAnioPct).toBe(-100);
        });
    });

    it("usa margen de 35% si no se envía", () => {
        const { margen, ...sinMargen } = base;
        expect(calcularRoi(sinMargen, pagoUnico).supuestos.margen).toBe(0.35);
    });
});

describe("margen según el servicio", () => {
    it("una pérdida que es un costo directo no se multiplica por el margen", () => {
        // tiempo: 4,330 ; pérdida: 4 * 800 = 3,200 (sin margen) -> 7,530
        const r = calcularRoi(
            { ...base, servicio: "automatizacion_administrativa" },
            { ...pagoUnico, inicial: 12250 },
        );
        expect(r.costoActualMensual).toBe(7530);
    });
});

describe("plan mensual", () => {
    const { plan: p } = precios("gestion_clientes"); // 5,250 + 685 x 18
    const plan = { ...p, mantenimiento: 0 };
    const r = calcularRoi(base, plan);
    const esc = (n: string) => r.escenarios.find((e) => e.escenario === n)!;

    it("el costo del primer año incluye 12 mensualidades", () => {
        // 5,250 + 685 * 12 = 13,470
        expect(r.costoPrimerAnio).toBe(13470);
    });

    it("recupera antes que el pago único porque se paga menos al inicio", () => {
        // esperado: 5,250 / (2,396.5 - 685) = 3.1 meses ;
        // ROI = (28,758 - 13,470) / 13,470 = 113.5 %
        expect(esc("esperado")).toMatchObject({
            mesesRecuperacion: 3.1,
            roiPrimerAnioPct: 113.5,
        });
        // conservador: 5,250 / (1,198.25 - 685) = 10.2 meses ; ROI 6.7 %
        expect(esc("conservador")).toMatchObject({
            mesesRecuperacion: 10.2,
            roiPrimerAnioPct: 6.7,
        });
    });
});

describe("mesesParaRecuperar", () => {
    const plan = {
        inicial: 2100,
        mensualidad: 275,
        mesesCuotas: 18,
        mantenimiento: 0,
    };

    it("después de las cuotas ya no se paga nada más", () => {
        // 300 > 275: 2,100 / 25 = 84 meses (> 18), así que se recupera cuando
        // todo está pagado: (2,100 + 275 * 18) / 300 = 23.5
        expect(mesesParaRecuperar(300, plan)).toBeCloseTo(23.5);
    });

    it("si el beneficio no alcanza la mensualidad, también espera al final", () => {
        // 7,050 / 200 = 35.25
        expect(mesesParaRecuperar(200, plan)).toBeCloseTo(35.25);
    });

    it("beneficio cero o negativo nunca recupera", () => {
        expect(mesesParaRecuperar(0, plan)).toBeNull();
    });

    it("el mantenimiento se paga todos los meses, también al terminar las cuotas", () => {
        const conHosting = { ...plan, mantenimiento: 100 };
        // 500: durante cuotas 500 - 100 - 275 = 125 -> 2,100 / 125 = 16.8
        expect(mesesParaRecuperar(500, conHosting)).toBeCloseTo(16.8);
        // 450: durante 75 -> 28 > 18; faltan 2,100 - 75*18 = 750 a 350/mes
        // -> 18 + 750 / 350 = 20.14
        expect(mesesParaRecuperar(450, conHosting)).toBeCloseTo(20.1429);
        // 350: durante -25 (la deuda crece); faltan 2,550 a 250/mes -> 28.2
        expect(mesesParaRecuperar(350, conHosting)).toBeCloseTo(28.2);
        // 100 = mantenimiento: nunca deja ganancia
        expect(mesesParaRecuperar(100, conHosting)).toBeNull();
    });
});

describe("mantenimiento (hosting, dominio y soporte)", () => {
    const entrada = { ...base, mantenimientoMensual: 1000 };
    const c = compararOpciones(entrada);
    const esperado = (r: typeof c.pagoUnico) =>
        r.escenarios.find((e) => e.escenario === "esperado")!;

    it("el precio sugerido es hosting + horas de soporte x tarifa", () => {
        // gestión: 300 + 2 h * 350 = 1,000
        expect(c.precios.mantenimiento).toBe(1000);
        expect(precios("sitio_web").mantenimiento).toBe(450); // 100 + 1 h
    });

    it("lo suma al costo del primer año de ambas formas de pago", () => {
        // único: 17,500 + 12 * 1,000 = 29,500
        expect(c.pagoUnico.costoPrimerAnio).toBe(29500);
        // plan: 5,250 + 12 * 685 + 12 * 1,000 = 25,470
        expect(c.plan.costoPrimerAnio).toBe(25470);
    });

    it("baja el beneficio real: se tarda más y el ROI cae", () => {
        // único: 17,500 / (2,396.5 - 1,000) = 12.5 meses ; ROI (28,758 - 29,500)/29,500 = -2.5 %
        expect(esperado(c.pagoUnico)).toMatchObject({
            mesesRecuperacion: 12.5,
            roiPrimerAnioPct: -2.5,
        });
        // plan: 5,250 / (2,396.5 - 1,000 - 685) = 7.4 meses ; ROI (28,758 - 25,470)/25,470 = 12.9 %
        expect(esperado(c.plan)).toMatchObject({
            mesesRecuperacion: 7.4,
            roiPrimerAnioPct: 12.9,
        });
    });

    it("sin mantenimiento marcado, el costo es solo el del servicio", () => {
        expect(compararOpciones(base).pagoUnico.costoPrimerAnio).toBe(17500);
    });
});

describe("costoAcumulado", () => {
    const plan = {
        inicial: 5250,
        mensualidad: 685,
        mesesCuotas: 18,
        mantenimiento: 1000,
    };

    it("deja de sumar mensualidades al terminar las cuotas, no el mantenimiento", () => {
        // 12 meses: 5,250 + 685*12 + 1,000*12 = 25,470
        expect(costoAcumulado(plan, 12)).toBe(25470);
        // 24 meses: 5,250 + 685*18 + 1,000*24 = 41,580
        expect(costoAcumulado(plan, 24)).toBe(41580);
    });

    it("pagado todo el plan equivale casi al pago único (sin mantenimiento)", () => {
        const sin = { ...plan, mantenimiento: 0 };
        expect(costoAcumulado(sin, 18)).toBe(17580); // lista 17,500
        expect(costoAcumulado(sin, 60)).toBe(17580);
    });
});

describe("compararOpciones", () => {
    it("devuelve precios y las dos formas de pago", () => {
        const c = compararOpciones(base);
        expect(c.precios.lista).toBe(17500);
        expect(c.pagoUnico.opcion.inicial).toBe(17500);
        expect(c.plan.opcion.mensualidad).toBe(685);
        expect(c.plan.opcion.mantenimiento).toBe(0);
    });
});

describe("comparar con otra cotización", () => {
    const esperado = (r: { escenarios: { escenario: string }[] }) =>
        r.escenarios.find((e) => e.escenario === "esperado")!;

    it("sin otra cotización no devuelve nada extra", () => {
        expect(compararOpciones(base).otra).toBeUndefined();
    });

    it("la trata como un pago único con el precio que dio el visitante", () => {
        // 10,000 / 2,396.5 = 4.2 meses ; ROI (28,758 - 10,000) / 10,000 = 187.6 %
        const c = compararOpciones(base, { precio: 10000 });
        expect(c.otra!.opcion).toEqual({
            inicial: 10000,
            mensualidad: 0,
            mesesCuotas: 0,
            mantenimiento: 0,
        });
        expect(esperado(c.otra!)).toMatchObject({
            mesesRecuperacion: 4.2,
            roiPrimerAnioPct: 187.6,
        });
    });

    it("usa el mantenimiento de la otra propuesta si lo indica", () => {
        // 10,000 + 12 * 200 = 12,400 el primer año
        const c = compararOpciones(
            { ...base, mantenimientoMensual: 1000 },
            { precio: 10000, mantenimientoMensual: 200 },
        );
        expect(c.otra!.costoPrimerAnio).toBe(12400);
        // y si no lo indica, usa el que se eligió para las nuestras
        const d = compararOpciones(
            { ...base, mantenimientoMensual: 1000 },
            { precio: 10000 },
        );
        expect(d.otra!.costoPrimerAnio).toBe(22000);
    });
});

describe("validación", () => {
    it("rechaza datos fuera de rango", () => {
        expect(() =>
            calcularRoi({ ...base, horasSemana: -1 }, pagoUnico),
        ).toThrow(RangeError);
        expect(() =>
            calcularRoi({ ...base, horasSemana: 200 }, pagoUnico),
        ).toThrow(RangeError);
        expect(() =>
            calcularRoi({ ...base, valorPorCliente: Number.NaN }, pagoUnico),
        ).toThrow(RangeError);
        expect(() => calcularRoi({ ...base, margen: 0 }, pagoUnico)).toThrow(
            RangeError,
        );
    });

    it("rechaza un pago inicial de cero", () => {
        expect(() => calcularRoi(base, { ...pagoUnico, inicial: 0 })).toThrow(
            RangeError,
        );
    });

    it("rechaza un mantenimiento negativo", () => {
        expect(() =>
            calcularRoi({ ...base, mantenimientoMensual: -5 }, pagoUnico),
        ).toThrow(RangeError);
    });
});
