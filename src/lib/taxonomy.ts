export type TaxonomyStrategy = {
    id: string;
    sym: string;
    name: string;
    rule: string;
    tier: number | null;
    legs: number[];
    custom: boolean;
    fill_form: string;
    diff_form: string;
};

export function binom(n: number, k: number) {
    if (k < 0 || k > n) return 0;
    let r = 1;
    for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
    return Math.round(r);
}

export function diffLegs(tier: number) {
    return Array.from({ length: tier + 1 }, (_, k) => Math.pow(-1, k) * binom(tier, k));
}

export const BUILT_IN: TaxonomyStrategy[] = [
    { sym: "S", name: "Spread", rule: "root layer", tier: 0 },
    { sym: "F", name: "Fly", rule: "S(-)[0][1.1]S", tier: 1 },
    { sym: "FF", name: "Double Fly", rule: "F(-)[0][1.1]F", tier: 2 },
    { sym: "D", name: "Drone", rule: "FF(-)[0][1.1]FF", tier: 3 },
    { sym: "FD", name: "Fly-Drone", rule: "D(-)[0][1.1]D", tier: 4 },
    { sym: "DD", name: "Double Drone", rule: "FD(-)[0][1.1]FD", tier: 5 },
    { sym: "T", name: "Tenor", rule: "DD(-)[0][1.1]DD", tier: 6 },
    { sym: "FT", name: "Fly-Tenor", rule: "T(-)[0][1.1]T", tier: 7 },
    { sym: "DT", name: "Drone-Tenor", rule: "FT(-)[0][1.1]FT", tier: 8 },
    { sym: "TT", name: "Double Tenor", rule: "DT(-)[0][1.1]DT", tier: 9 },
    { sym: "X", name: "Decima", rule: "TT(-)[0][1.1]TT", tier: 10 },
    { sym: "FX", name: "Fly-Decima", rule: "X(-)[0][1.1]X", tier: 11 },
    { sym: "DX", name: "Drone-Decima", rule: "FX(-)[0][1.1]FX", tier: 12 },
].map((s) => ({
    ...s,
    id: s.sym,
    legs: diffLegs((s.tier ?? 0) + 1),
    custom: false,
    fill_form: "",
    diff_form: "",
}));

function normalizeRow(c: Record<string, unknown>): TaxonomyStrategy {
    return {
        id: String(c.id ?? ""),
        sym: String(c.sym ?? ""),
        name: String(c.name ?? ""),
        rule: String(c.rule ?? ""),
        tier: typeof c.tier === "number" ? c.tier : null,
        legs: Array.isArray(c.legs) ? (c.legs as unknown[]).map((v) => Number(v) || 0) : [],
        custom: true,
        fill_form: String(c.fill_form ?? ""),
        diff_form: String(c.diff_form ?? ""),
    };
}

export async function loadCustoms(): Promise<TaxonomyStrategy[]> {
    try {
        const base = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
        const res = await fetch(`${base}/api/taxonomy`, { cache: "no-store" });
        if (!res.ok) return [];
        const data = await res.json() as Record<string, unknown>[];
        return data.filter((c) => c.id && c.sym).map(normalizeRow);
    } catch {
        return [];
    }
}

export async function createCustom(strategy: Omit<TaxonomyStrategy, "custom"> & { id: string }): Promise<TaxonomyStrategy | null> {
    try {
        const res = await fetch("/api/taxonomy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(strategy),
        });
        if (!res.ok) return null;
        return normalizeRow(await res.json() as Record<string, unknown>);
    } catch {
        return null;
    }
}

export async function updateCustom(id: string, fields: Partial<Omit<TaxonomyStrategy, "id" | "custom">>): Promise<TaxonomyStrategy | null> {
    try {
        const res = await fetch("/api/taxonomy", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, ...fields }),
        });
        if (!res.ok) return null;
        return normalizeRow(await res.json() as Record<string, unknown>);
    } catch {
        return null;
    }
}

export async function deleteCustom(id: string): Promise<boolean> {
    try {
        const res = await fetch(`/api/taxonomy?id=${encodeURIComponent(id)}`, { method: "DELETE" });
        return res.ok;
    } catch {
        return false;
    }
}

export async function getAllStrategies(): Promise<TaxonomyStrategy[]> {
    const customs = await loadCustoms();
    return [...BUILT_IN, ...customs];
}

export function getTowers(strategies: TaxonomyStrategy[]) {
    const towers: Record<string, TaxonomyStrategy[]> = {};
    strategies.forEach((s) => {
        (towers[s.sym] = towers[s.sym] || []).push(s);
    });
    return towers;
}
