type TechBadge = {
    match: RegExp;
    label: string;
    color: string;
    dark?: boolean;
};

const TECH_BADGES: TechBadge[] = [
    // Portfolio (tecnología principal por proyecto)
    { match: /openai/i, label: "AI", color: "#10a37f", dark: true },
    { match: /stripe/i, label: "St", color: "#635bff" },
    { match: /wordpress/i, label: "Wp", color: "#21759b" },

    // Backend & Architecture
    { match: /laravel/i, label: "Lv", color: "#ff2d20", dark: true },
    { match: /^php/i, label: "Php", color: "#777bb4", dark: true },
    { match: /postgis/i, label: "Pg", color: "#336791" },
    { match: /postgres/i, label: "Pg", color: "#336791" },
    { match: /mysql/i, label: "My", color: "#4479a1" },
    { match: /rest api/i, label: "{}", color: "#3b82f6", dark: true },
    { match: /woocommerce/i, label: "Wc", color: "#96588a" },
    { match: /paypal/i, label: "Pp", color: "#003087" },
    { match: /adquira/i, label: "Aq", color: "#3b82f6", dark: true },

    // Frontend & Performance
    { match: /^astro/i, label: "As", color: "#ff5d01", dark: true },
    { match: /react/i, label: "Re", color: "#61dafb", dark: true },
    { match: /typescript/i, label: "Ts", color: "#3178c6" },
    { match: /jquery/i, label: "jQ", color: "#0769ad" },
    { match: /tailwind/i, label: "Tw", color: "#38bdf8", dark: true },
    { match: /seo/i, label: "SEO", color: "#3b82f6", dark: true },
    { match: /web vitals/i, label: "Wv", color: "#3b82f6", dark: true },

    // DevOps & Automatización
    { match: /docker/i, label: "Dk", color: "#2496ed", dark: true },
    { match: /kubernetes/i, label: "K8s", color: "#326ce5" },
    { match: /github actions/i, label: "Gh", color: "#24292f" },
    { match: /ci\s*\/?\s*cd/i, label: "CI", color: "#3b82f6", dark: true },
    { match: /linux/i, label: "Lx", color: "#fcc624", dark: true },
    { match: /ssh|rsync/i, label: "Sh", color: "#3b82f6", dark: true },
    { match: /^git\b|git workflow/i, label: "Git", color: "#f05032", dark: true },
    { match: /terraform/i, label: "Tf", color: "#7b42bc" },
    { match: /aws/i, label: "Aws", color: "#ff9900", dark: true },
    { match: /azure/i, label: "Az", color: "#0078d4" },

    // Sistemas Geográficos (SIG)
    { match: /leaflet/i, label: "Lf", color: "#199900", dark: true },
    { match: /openlayers/i, label: "Ol", color: "#1f6b75" },
    { match: /geoserver/i, label: "Gs", color: "#0ea5e9", dark: true },
    { match: /gdal/i, label: "Gd", color: "#0ea5e9", dark: true },
    { match: /qgis/i, label: "Qg", color: "#589632", dark: true },
    { match: /mapbox/i, label: "Mb", color: "#3b82f6", dark: true },
];

const DEFAULT_BADGE: TechBadge = {
    match: /.*/,
    label: "</>",
    color: "var(--accent)",
    dark: true,
};

export function getTechIcon(tag: string): string {
    const badge = TECH_BADGES.find((b) => b.match.test(tag)) ?? DEFAULT_BADGE;
    const textColor = badge.dark ? "#000" : "#fff";
    return `<span class="tech-badge" style="background:${badge.color};color:${textColor}">${badge.label}</span>`;
}
