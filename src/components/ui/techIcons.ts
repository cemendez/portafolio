type TechBadge = {
    match: RegExp;
    label: string;
    color: string;
};

const TECH_BADGES: TechBadge[] = [
    { match: /openai/i, label: "AI", color: "#10a37f" },
    { match: /laravel/i, label: "Lv", color: "#ff2d20" },
    { match: /wordpress/i, label: "Wp", color: "#21759b" },
    { match: /stripe/i, label: "St", color: "#635bff" },
    { match: /php/i, label: "Php", color: "#777bb4" },
];

const DEFAULT_BADGE: TechBadge = {
    match: /.*/,
    label: "</>",
    color: "var(--accent)",
};

export function getTechIcon(tag: string): string {
    const badge = TECH_BADGES.find((b) => b.match.test(tag)) ?? DEFAULT_BADGE;
    return `<span class="portfolio-card__tech-badge" style="background:${badge.color}">${badge.label}</span>`;
}
