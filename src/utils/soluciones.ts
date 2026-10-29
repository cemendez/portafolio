// Catálogo de soluciones para negocios (/negocios). Escrito en lenguaje de
// cliente: qué problema resuelve y qué gana el negocio, no qué tecnología uso.
// Las claves también son las opciones del formulario de contacto, así que
// cambiar una clave rompe enlaces del tipo /negocios?servicio=clave.
import type { Servicio } from "./roi";

export type ClaveSolucion =
    | "gestion_clientes"
    | "inventario"
    | "facturacion"
    | "automatizacion_administrativa"
    | "crm"
    | "cursos"
    | "sitio_web";

export interface Evidencia {
    texto: string;
    /** Página del portafolio con el caso; sin ella es solo una nota. */
    href?: string;
}

export interface Solucion {
    nombre: string;
    /** El dolor, en una frase que el dueño reconoce como suya. */
    problema: string;
    /** Lo que obtiene el negocio. */
    resultado: string;
    paraQuien: string;
    incluye: string[];
    evidencia: Evidencia[];
    /** Servicio de la calculadora con el que se estima el retorno. */
    calculadora?: Servicio;
}

export const SOLUCIONES: Record<ClaveSolucion, Solucion> = {
    gestion_clientes: {
        nombre: "Agenda en línea y expediente para consultorios",
        problema:
            "Las citas llegan por WhatsApp a cualquier hora, se pierden mensajes y los pacientes faltan sin avisar.",
        resultado:
            "Tus pacientes agendan solos, tu equipo deja de confirmar a mano y cada historial queda en un solo lugar.",
        paraQuien:
            "Centros de psicología, fisioterapia y clínicas dentales con varios especialistas.",
        incluye: [
            "Reservas en línea con los horarios reales de cada especialista",
            "Recordatorios antes de la cita",
            "Historial del paciente con acceso solo para personal autorizado",
        ],
        evidencia: [
            {
                texto: "Ya tengo terminado un sistema de reservas con historial clínico; te lo muestro en la llamada.",
            },
        ],
        calculadora: "gestion_clientes",
    },
    inventario: {
        nombre: "Inventario para pequeños negocios",
        problema:
            "No sabes con certeza cuánto tienes, se acaban productos sin aviso y el conteo te quita tardes enteras.",
        resultado:
            "Existencias al día en el celular, alertas antes de quedarte sin producto y menos ventas perdidas.",
        paraQuien:
            "Abarrotes, ferreterías, distribuidores, tiendas y comercios de la Central de Abastos.",
        incluye: [
            "Entradas, salidas y ventas registradas al momento",
            "Alertas de existencia mínima",
            "Reportes de lo que más se vende y lo que no se mueve",
        ],
        evidencia: [
            {
                texto: "Abastos IA: control de taras y ventas dictado por voz",
                href: "/projects/abastos-ia",
            },
            {
                texto: "Alpec: tienda en línea con inventario y panel propio",
                href: "/projects/alpec",
            },
        ],
        calculadora: "inventario",
    },
    facturacion: {
        nombre: "Facturación electrónica (CFDI 4.0)",
        problema:
            "Facturas una por una en el portal del SAT, capturas los mismos datos cada vez y persigues complementos de pago.",
        resultado:
            "Facturas desde tu propio sistema en segundos, con el XML y el PDF enviados al cliente automáticamente.",
        paraQuien:
            "Comercios, despachos y prestadores de servicios que facturan todos los días.",
        incluye: [
            "Timbrado con un proveedor autorizado por el SAT (PAC)",
            "Catálogo de clientes y productos para no capturar dos veces",
            "Cancelaciones, complementos de pago y envío por correo",
        ],
        evidencia: [
            {
                texto: "Cotizador: folios consecutivos, montos exactos y PDF automáticos",
                href: "/lab/cotizador",
            },
        ],
        calculadora: "automatizacion_administrativa",
    },
    automatizacion_administrativa: {
        nombre: "Automatización administrativa y contable",
        problema:
            "Cada mes repites el mismo Excel, persigues documentos y armas reportes a mano.",
        resultado:
            "Los reportes se generan solos y tu equipo dedica ese tiempo a atender clientes.",
        paraQuien:
            "Despachos contables, oficinas administrativas y negocios con procesos repetitivos.",
        incluye: [
            "Captura única: un dato se escribe una vez y se usa en todo",
            "Reportes y documentos generados automáticamente",
            "Recordatorios de fechas y pendientes",
        ],
        evidencia: [
            {
                texto: "Abastos IA: registros que antes no se capturaban, ahora por voz",
                href: "/projects/abastos-ia",
            },
            {
                texto: "Cotizador: cotizaciones y contratos en PDF sin rehacerlos",
                href: "/lab/cotizador",
            },
        ],
        calculadora: "automatizacion_administrativa",
    },
    crm: {
        nombre: "CRM a la medida de tu giro",
        problema:
            "Los prospectos se quedan en notas, chats y libretas, y nadie sabe a quién había que llamar hoy.",
        resultado:
            "Cada cliente con su historial y su siguiente paso, para que ninguna venta se enfríe por falta de seguimiento.",
        paraQuien:
            "Inmobiliarias, constructoras y remodelaciones, despachos y equipos de venta pequeños.",
        incluye: [
            "Etapas de venta con los nombres que ya usa tu negocio",
            "Seguimientos y recordatorios por cliente",
            "Cotizaciones ligadas a cada cliente",
        ],
        evidencia: [
            {
                texto: "Cotizador: clientes, cotizaciones con estados y panel de control",
                href: "/lab/cotizador",
            },
        ],
        calculadora: "gestion_clientes",
    },
    cursos: {
        nombre: "Plataforma de cursos en línea de nicho",
        problema:
            "Vendes cursos por transferencia, mandas enlaces a mano y no controlas quién comparte su acceso.",
        resultado:
            "Cobras en línea y el alumno recibe su acceso al instante, sin que tengas que intervenir.",
        paraQuien:
            "Coaches, academias, capacitadores y especialistas que enseñan lo que saben.",
        incluye: [
            "Pagos con tarjeta y acceso automático al pagar",
            "Clases en vivo o grabadas, materiales y tareas",
            "Control de sesiones para que no se compartan cuentas",
        ],
        evidencia: [
            {
                texto: "TNG Group: cursos presenciales llevados a una plataforma con Stripe y Zoom",
                href: "/projects/gabriel-nosso",
            },
        ],
    },
    sitio_web: {
        nombre: "Sitio web que te trae clientes",
        problema:
            "Tienes buenas reseñas en Google, pero tu página no existe, carga lento o no tiene a dónde escribirte.",
        resultado:
            "Un sitio rápido en el celular, con WhatsApp y formulario a la vista, que convierte visitas en mensajes.",
        paraQuien:
            "Cualquier negocio local que hoy depende solo de recomendaciones o redes sociales.",
        incluye: [
            "Diseño pensado primero para celular",
            "Botón de WhatsApp, mapa y formulario que sí llega",
            "Posicionamiento básico en Google",
        ],
        evidencia: [
            {
                texto: "DIECSA: migración a producción, 30% más rápida y formularios funcionando",
                href: "/projects/diecsa",
            },
        ],
        calculadora: "sitio_web",
    },
};

export const CLAVES_SOLUCIONES = Object.keys(SOLUCIONES) as ClaveSolucion[];
