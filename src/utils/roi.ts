// Calculadora de ROI: toda la lógica vive aquí (sin servidor) para que el
// navegador calcule al instante. La interfaz (/roi) solo captura datos y
// pinta lo que devuelven estas funciones.

export type Servicio =
    | "sitio_web"
    | "automatizacion_administrativa"
    | "gestion_clientes"
    | "inventario";

/** Semanas promedio por mes (52 / 12). */
export const SEMANAS_POR_MES = 4.33;
export const MARGEN_DEFAULT = 0.35;

// ---------- Precios ----------

export const TARIFA_HORA = 350;
/** Parte del precio de lista que se paga al inicio en el plan mensual. */
export const PLAN_INICIAL_PCT = 0.3;
/** Mensualidades del plan; al terminarlas el sitio se entrega al cliente. */
export const PLAN_MESES = 18;

/**
 * Supuestos y horas por servicio.
 * - horas: esfuerzo real estimado; con TARIFA_HORA define el precio de lista.
 * - eficiencia: fracción del tiempo manual que se elimina.
 * - recuperacion: fracción de las pérdidas mensuales que se recupera.
 * - aplicaMargen: si lo perdido es una venta (hay margen) o un costo directo
 *   (una multa o un error no tienen margen).
 * Son deliberadamente conservadores: ajústalos solo con evidencia.
 */
export const SERVICIOS: Record<
    Servicio,
    {
        nombre: string;
        horas: number;
        eficiencia: number;
        recuperacion: number;
        aplicaMargen: boolean;
        /** Hosting y dominio al mes (MXN) necesarios para que funcione. */
        hostingMensual: number;
        /** Horas de soporte y cambios menores al mes que cubre el mantenimiento. */
        horasSoporte: number;
    }
> = {
    sitio_web: {
        nombre: "Sitio web nuevo o renovado",
        horas: 20,
        eficiencia: 0.15,
        recuperacion: 0.2,
        aplicaMargen: true,
        hostingMensual: 100,
        horasSoporte: 1,
    },
    automatizacion_administrativa: {
        nombre: "Automatización administrativa / contable",
        horas: 35,
        eficiencia: 0.6,
        recuperacion: 0.3,
        aplicaMargen: false,
        hostingMensual: 300,
        horasSoporte: 1,
    },
    gestion_clientes: {
        nombre: "Agenda y gestión de clientes",
        horas: 50,
        eficiencia: 0.45,
        recuperacion: 0.4,
        aplicaMargen: true,
        hostingMensual: 300,
        horasSoporte: 2,
    },
    inventario: {
        nombre: "Control de inventario",
        horas: 70,
        eficiencia: 0.4,
        recuperacion: 0.35,
        aplicaMargen: true,
        hostingMensual: 400,
        horasSoporte: 2,
    },
};

/** Multiplicadores aplicados a los supuestos base. */
export const ESCENARIOS = [
    { nombre: "conservador", factor: 0.5 },
    { nombre: "esperado", factor: 1 },
    { nombre: "optimista", factor: 1.4 },
] as const;

export type NombreEscenario = (typeof ESCENARIOS)[number]["nombre"];

/**
 * Cómo se paga: un monto inicial, mensualidades durante `mesesCuotas` y un
 * mantenimiento (hosting, dominio y soporte) que se paga cada mes mientras el
 * sitio esté en operación. El mantenimiento es independiente del precio: sin
 * él, el cliente tendría que hospedar y mantener el sitio por su cuenta.
 */
export interface Opcion {
    inicial: number;
    mensualidad: number;
    mesesCuotas: number;
    mantenimiento: number;
}

export interface Precios {
    /** Pago único: horas x tarifa. */
    lista: number;
    /** Plan mensual (sin mantenimiento): `total` es lo que suma al terminar las cuotas. */
    plan: Omit<Opcion, "mantenimiento"> & { total: number };
    /** Hosting + dominio + horas de soporte, al mes. */
    mantenimiento: number;
}

const redondear = (n: number, decimales = 2): number => {
    const f = 10 ** decimales;
    return Math.round(n * f) / f;
};

// La mensualidad sube al siguiente múltiplo de 5 para que se vea limpia y el
// plan nunca quede por debajo de la lista.
const sube5 = (n: number): number => Math.ceil(n / 5) * 5;

export function precios(servicio: Servicio): Precios {
    const { horas, hostingMensual, horasSoporte } = SERVICIOS[servicio];
    const lista = horas * TARIFA_HORA;
    const mantenimiento = hostingMensual + horasSoporte * TARIFA_HORA;
    const inicial = Math.round(lista * PLAN_INICIAL_PCT);
    const mensualidad = sube5((lista - inicial) / PLAN_MESES);
    return {
        lista,
        plan: {
            inicial,
            mensualidad,
            mesesCuotas: PLAN_MESES,
            total: inicial + mensualidad * PLAN_MESES,
        },
        mantenimiento,
    };
}

// ---------- Cálculo ----------

export interface EntradaRoi {
    servicio: Servicio;
    /** Horas por semana que hoy se dedican al proceso manual. */
    horasSemana: number;
    /** Costo por hora (MXN) de quien hace el proceso. */
    costoHora: number;
    /** Clientes, citas o ventas que se pierden al mes por este problema. */
    perdidasMes: number;
    /** Ingreso (o costo) promedio por cada caso (MXN). */
    valorPorCliente: number;
    /** Margen de utilidad del negocio (0 a 1). Default 0.35. */
    margen?: number;
    /**
     * Mantenimiento mensual (hosting, dominio, soporte) que el cliente decide
     * incluir. 0 si lo resolverá por su cuenta.
     */
    mantenimientoMensual?: number;
}

export interface ResultadoEscenario {
    escenario: NombreEscenario;
    ahorroTiempoMensual: number;
    utilidadRecuperadaMensual: number;
    /** Lo que el negocio gana cada mes, sin restar lo que paga por el servicio. */
    beneficioMensual: number;
    /** Meses para que lo ganado cubra lo pagado; null si nunca lo cubre. */
    mesesRecuperacion: number | null;
    /** Ganancia de los primeros 12 meses entre lo pagado en esos 12 meses. */
    roiPrimerAnioPct: number;
}

export interface ResultadoRoi {
    /** Lo que cuesta hoy el problema: tiempo perdido + pérdidas, al mes. */
    costoActualMensual: number;
    /** Parte del costo actual que es tiempo: horas x semanas x costo por hora. */
    tiempoMensualActual: number;
    /** Parte del costo actual que son pérdidas (con margen si aplica). */
    perdidaMensualActual: number;
    opcion: Opcion;
    /** Total pagado durante los primeros 12 meses (incluye mantenimiento). */
    costoPrimerAnio: number;
    escenarios: ResultadoEscenario[];
    supuestos: {
        semanasPorMes: number;
        eficiencia: number;
        recuperacion: number;
        margen: number;
        /** Si lo perdido se multiplica por el margen (ventas) o no (costos). */
        aplicaMargen: boolean;
        nota: string;
    };
}

function validar(e: EntradaRoi): void {
    const rango = (valor: number, min: number, max: number, campo: string) => {
        if (!Number.isFinite(valor) || valor < min || valor > max) {
            throw new RangeError(`${campo} debe estar entre ${min} y ${max}`);
        }
    };
    if (!(e.servicio in SERVICIOS)) throw new RangeError("servicio no válido");
    rango(e.horasSemana, 0, 168, "horasSemana");
    rango(e.costoHora, 0, 5000, "costoHora");
    rango(e.perdidasMes, 0, 10000, "perdidasMes");
    rango(e.valorPorCliente, 0, 10_000_000, "valorPorCliente");
    if (e.margen !== undefined) rango(e.margen, 0.01, 1, "margen");
    if (e.mantenimientoMensual !== undefined) {
        rango(e.mantenimientoMensual, 0, 1_000_000, "mantenimientoMensual");
    }
}

/**
 * Meses para que lo ganado cubra lo pagado. Cada mes el negocio gana
 * `beneficioMensual` y paga el mantenimiento; durante las cuotas paga además la
 * mensualidad. Al terminar las cuotas desaparece solo la mensualidad.
 */
export function mesesParaRecuperar(
    beneficioMensual: number,
    { inicial, mensualidad, mesesCuotas, mantenimiento }: Opcion,
): number | null {
    const durante = beneficioMensual - mantenimiento - mensualidad;
    const despues = beneficioMensual - mantenimiento;
    // Si ni terminadas las cuotas deja ganancia, nunca se recupera.
    if (despues <= 0) return null;

    // ¿Se recupera mientras aún se pagan cuotas?
    if (durante > 0) {
        const meses = inicial / durante;
        if (meses <= mesesCuotas) return meses;
    }
    // Si no, lo que falta al terminar las cuotas se cubre al ritmo "después".
    const pendiente = inicial - durante * mesesCuotas;
    return mesesCuotas + pendiente / despues;
}

/** Total pagado al cabo de `meses` con esta forma de pago. */
export function costoAcumulado(opcion: Opcion, meses: number): number {
    return (
        opcion.inicial +
        opcion.mensualidad * Math.min(meses, opcion.mesesCuotas) +
        opcion.mantenimiento * meses
    );
}

export function calcularRoi(entrada: EntradaRoi, opcion: Opcion): ResultadoRoi {
    validar(entrada);
    if (!(opcion.inicial > 0)) {
        throw new RangeError("el pago inicial debe ser mayor que 0");
    }
    if (!(opcion.mantenimiento >= 0)) {
        throw new RangeError("el mantenimiento no puede ser negativo");
    }

    const { eficiencia, recuperacion, aplicaMargen } =
        SERVICIOS[entrada.servicio];
    const margen = entrada.margen ?? MARGEN_DEFAULT;
    const factorMargen = aplicaMargen ? margen : 1;

    // Lo que el negocio ya paga hoy por no resolver el problema.
    const tiempoMensualActual =
        entrada.horasSemana * SEMANAS_POR_MES * entrada.costoHora;
    const perdidaActual =
        entrada.perdidasMes * entrada.valorPorCliente * factorMargen;

    const costoPrimerAnio = costoAcumulado(opcion, 12);

    const escenarios = ESCENARIOS.map(({ nombre, factor }) => {
        const ahorroTiempo = tiempoMensualActual * eficiencia * factor;
        const utilidadRecuperada =
            entrada.perdidasMes *
            entrada.valorPorCliente *
            recuperacion *
            factor *
            factorMargen;
        const beneficio = ahorroTiempo + utilidadRecuperada;
        const meses = mesesParaRecuperar(beneficio, opcion);
        const roi =
            ((beneficio * 12 - costoPrimerAnio) / costoPrimerAnio) * 100;

        return {
            escenario: nombre,
            ahorroTiempoMensual: redondear(ahorroTiempo),
            utilidadRecuperadaMensual: redondear(utilidadRecuperada),
            beneficioMensual: redondear(beneficio),
            mesesRecuperacion: meses === null ? null : redondear(meses, 1),
            roiPrimerAnioPct: redondear(roi, 1),
        } satisfies ResultadoEscenario;
    });

    return {
        costoActualMensual: redondear(tiempoMensualActual + perdidaActual),
        tiempoMensualActual: redondear(tiempoMensualActual),
        perdidaMensualActual: redondear(perdidaActual),
        opcion,
        costoPrimerAnio,
        escenarios,
        supuestos: {
            semanasPorMes: SEMANAS_POR_MES,
            eficiencia,
            recuperacion,
            margen,
            aplicaMargen,
            nota:
                "Estimación basada en los datos que capturaste y supuestos " +
                "conservadores. Los resultados reales dependen de tu operación.",
        },
    };
}

/** Otra cotización que el visitante ya tiene y quiere comparar. */
export interface OtraCotizacion {
    /** Precio único de la otra propuesta (MXN). */
    precio: number;
    /** Lo que esa propuesta cobra al mes por hosting o soporte, si aplica. */
    mantenimientoMensual?: number;
}

/**
 * Calcula las formas de pago con los mismos datos, para compararlas. Si se
 * pasa `otra`, también calcula esa cotización como un pago único; por
 * defecto usa el mismo mantenimiento que se eligió para las nuestras.
 */
export function compararOpciones(entrada: EntradaRoi, otra?: OtraCotizacion) {
    const p = precios(entrada.servicio);
    const mantenimiento = entrada.mantenimientoMensual ?? 0;
    const pagoUnico: Opcion = {
        inicial: p.lista,
        mensualidad: 0,
        mesesCuotas: 0,
        mantenimiento,
    };
    const plan: Opcion = {
        inicial: p.plan.inicial,
        mensualidad: p.plan.mensualidad,
        mesesCuotas: p.plan.mesesCuotas,
        mantenimiento,
    };
    return {
        precios: p,
        pagoUnico: calcularRoi(entrada, pagoUnico),
        plan: calcularRoi(entrada, plan),
        otra: otra
            ? calcularRoi(entrada, {
                  inicial: otra.precio,
                  mensualidad: 0,
                  mesesCuotas: 0,
                  mantenimiento: otra.mantenimientoMensual ?? mantenimiento,
              })
            : undefined,
    };
}
