"use client";

import { useState, useEffect } from "react";
import Select from "@/components/ui/Select";
import TaxonomyDropdown from "@/components/ui/TaxonomyDropdown";
import { TaxonomyStrategy, getAllStrategies } from "@/lib/taxonomy";

interface Product {
    code: string;
    name: string;
    exchange: string;
    tick_size: number;
    tick_value: number;
}

interface Strategy {
    code: string;
    name: string;
}

interface TradeFormData {
    id?: string;
    date: string;
    product: string;
    instrument: string;
    instrument_type: string;
    direction: string;
    entry_price: string;
    entry_time: string;
    exit_price: string;
    exit_time: string;
    sl_price: string;
    risk_lt: string;
    size_contracts: string;
    strategy: string;
    assumption: string;
    checklist_passed: boolean;
    playbook_applied: boolean;
    playbook_rule: string;
    process_tag: string;
    notes_pre: string;
    notes_during: string;
    notes_post: string;
}

const EMPTY_FORM: TradeFormData = {
    date: new Date().toISOString().split("T")[0],
    product: "",
    instrument: "",
    instrument_type: "Outright",
    direction: "Long",
    entry_price: "",
    entry_time: "",
    exit_price: "",
    exit_time: "",
    sl_price: "",
    risk_lt: "",
    size_contracts: "1",
    strategy: "",
    assumption: "",
    checklist_passed: false,
    playbook_applied: false,
    playbook_rule: "",
    process_tag: "",
    notes_pre: "",
    notes_during: "",
    notes_post: "",
};

interface TradeFormProps {
    editTrade?: TradeFormData | null;
    onSaved: () => void;
    onCancel: () => void;
}

export default function TradeForm({ editTrade, onSaved, onCancel }: TradeFormProps) {
    const [form, setForm] = useState<TradeFormData>(EMPTY_FORM);
    const [products, setProducts] = useState<Product[]>([]);
    const [dbStrategies, setDbStrategies] = useState<Strategy[]>([]);
    const [taxonomyStrategies, setTaxonomyStrategies] = useState<TaxonomyStrategy[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Load Products
        fetch("/api/products").then(async (r) => {
            const data = await r.json();
            if (!data.error) setProducts(Array.isArray(data) ? data : []);
        });

        // Load Strategies from DB
        fetch("/api/strategies").then(async (r) => {
            const data = await r.json();
            if (!data.error) setDbStrategies(Array.isArray(data) ? data : []);
        });

        getAllStrategies().then(setTaxonomyStrategies);
    }, []);

    useEffect(() => {
        if (editTrade) {
            // Convert time strings from "09:30" back to military "0930"
            const entryStr = editTrade.entry_time ? editTrade.entry_time.replace(":", "").slice(0, 4) : "";
            const exitStr = editTrade.exit_time ? editTrade.exit_time.replace(":", "").slice(0, 4) : "";
            setForm({ 
                ...editTrade, 
                entry_time: entryStr, 
                exit_time: exitStr,
                sl_price: editTrade.sl_price?.toString() || "",
                risk_lt: editTrade.risk_lt?.toString() || ""
            });
        } else {
            setForm(EMPTY_FORM);
        }
    }, [editTrade]);

    function set(field: keyof TradeFormData, value: string | boolean) {
        setForm((f) => ({ ...f, [field]: value }));
    }

    // Helper to format military time "0930" to "09:30:00" for backend
    function formatTime(military: string) {
        if (!military || military.length !== 4) return null;
        return `${military.slice(0, 2)}:${military.slice(2, 4)}:00`;
    }

    const productOptions = [
        { value: "", label: "Select" },
        ...products.map((p) => ({ value: p.code, label: p.code })),
    ];

    const strategyOptions = [
        { value: "", label: "Select" },
        ...dbStrategies.map((s) => ({ value: s.code, label: `${s.code} - ${s.name}` })),
    ];

    const directionOptions = [
        { value: "Long", label: "Long" },
        { value: "Short", label: "Short" },
    ];

    const processOptions = [
        { value: "", label: "Select" },
        { value: "Good", label: "Good" },
        { value: "Bad", label: "Bad" },
        { value: "Lucky", label: "Lucky" },
        { value: "Unlucky", label: "Unlucky" },
    ];

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        const entryTimeFormatted = formatTime(form.entry_time);
        const exitTimeFormatted = formatTime(form.exit_time);

        const payload = {
            ...form,
            entry_price: parseFloat(form.entry_price) || null,
            exit_price: parseFloat(form.exit_price) || null,
            sl_price: parseFloat(form.sl_price) || null,
            risk_lt: parseFloat(form.risk_lt) || null,
            size_contracts: parseInt(form.size_contracts) || 1,
            entry_time: entryTimeFormatted ? `${form.date}T${entryTimeFormatted}` : null,
            exit_time: exitTimeFormatted ? `${form.date}T${exitTimeFormatted}` : null,
        };

        const method = form.id ? "PUT" : "POST";
        await fetch("/api/trades", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        setSaving(false);
        onSaved();
    }

    function handleTimeInput(field: "entry_time" | "exit_time", value: string) {
        // Only allow numbers and max length 4
        const clean = value.replace(/\D/g, "").slice(0, 4);
        set(field, clean);
    }

    const inputCls = "bg-bg4 border border-border2 rounded-md px-3 py-2.5 text-sm text-text placeholder:text-muted2 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 w-full transition-all shadow-sm";
    const labelCls = "text-xs font-semibold tracking-wider uppercase text-muted mb-1.5 block";

    return (
        <form onSubmit={handleSubmit} className="bg-bg3 border border-border rounded-lg p-6 mb-8 shadow-md">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
                <h2 className="text-lg font-heading font-bold text-text">
                    {form.id ? "Edit Trade" : "New Trade"}
                </h2>
                <button type="button" onClick={onCancel} className="text-muted hover:text-text hover:bg-bg4 px-2 py-1 rounded-md text-sm font-semibold transition-colors">
                    ✕ Cancel
                </button>
            </div>

            {/* Row 1: Date, Product, Instrument, Type, Direction */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                <div>
                    <label className={labelCls}>Date</label>
                    <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={inputCls} />
                </div>
                <div>
                    <label className={labelCls}>Product</label>
                    <Select
                        value={form.product}
                        onChange={(value) => set("product", value)}
                        options={productOptions}
                    />
                </div>
                <div>
                    <label className={labelCls}>Instrument</label>
                    <input placeholder="e.g. CL Jul26" value={form.instrument} onChange={(e) => set("instrument", e.target.value)} className={inputCls} />
                </div>
                <div>
                    <label className={labelCls}>Type</label>
                    <TaxonomyDropdown
                        value={form.instrument_type}
                        onChange={(value) => set("instrument_type", value as string)}
                        strategies={taxonomyStrategies}
                        withOutright
                        placeholder="Select type"
                    />
                </div>
                <div>
                    <label className={labelCls}>Direction</label>
                    <Select
                        value={form.direction}
                        onChange={(value) => set("direction", value)}
                        options={directionOptions}
                    />
                </div>
            </div>

            {/* Row 2: Entry/Exit/SL/Risk Limit */}
            <div className="grid grid-cols-2 md:grid-cols-7 gap-3 mb-3">
                <div>
                    <label className={labelCls}>Entry Price</label>
                    <input type="number" step="any" placeholder="0.00" value={form.entry_price} onChange={(e) => set("entry_price", e.target.value)} className={inputCls} />
                </div>
                <div>
                    <label className={labelCls}>Entry Time <span className="text-[9px] lowercase font-normal">(2400)</span></label>
                    <input type="text" placeholder="0930" value={form.entry_time} onChange={(e) => handleTimeInput("entry_time", e.target.value)} className={inputCls} />
                </div>
                <div>
                    <label className={labelCls}>Exit Price</label>
                    <input type="number" step="any" placeholder="0.00" value={form.exit_price} onChange={(e) => set("exit_price", e.target.value)} className={inputCls} />
                </div>
                <div>
                    <label className={labelCls}>Exit Time <span className="text-[9px] lowercase font-normal">(2400)</span></label>
                    <input type="text" placeholder="1430" value={form.exit_time} onChange={(e) => handleTimeInput("exit_time", e.target.value)} className={inputCls} />
                </div>
                <div>
                    <label className={labelCls}>SL $</label>
                    <input type="number" step="any" placeholder="0.00" value={form.sl_price} onChange={(e) => set("sl_price", e.target.value)} className={inputCls} />
                </div>
                <div>
                    <label className={labelCls}>Risk Lt</label>
                    <input type="number" step="any" placeholder="0.00" value={form.risk_lt} onChange={(e) => set("risk_lt", e.target.value)} className={inputCls} />
                </div>
                <div>
                    <label className={labelCls}>Size</label>
                    <input type="number" min="1" value={form.size_contracts} onChange={(e) => set("size_contracts", e.target.value)} className={inputCls} />
                </div>
            </div>

            {/* Row 3: Strategy, Assumption */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                    <label className={labelCls}>Strategy</label>
                    <Select
                        value={form.strategy}
                        onChange={(value) => set("strategy", value)}
                        options={strategyOptions}
                    />
                </div>
                <div className="md:col-span-2">
                    <label className={labelCls}>Assumption (Basis of Trade)</label>
                    <input placeholder="Why this trade?" value={form.assumption} onChange={(e) => set("assumption", e.target.value)} className={inputCls} />
                </div>
            </div>

            {/* Row 4: Checklist, Playbook, Process */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="flex items-center gap-2 pt-4">
                    <input type="checkbox" checked={form.checklist_passed} onChange={(e) => set("checklist_passed", e.target.checked)} className="accent-accent" />
                    <span className="text-[10px] text-text2">Checklist Passed</span>
                </div>
                <div className="flex items-center gap-2 pt-4">
                    <input type="checkbox" checked={form.playbook_applied} onChange={(e) => set("playbook_applied", e.target.checked)} className="accent-accent" />
                    <span className="text-[10px] text-text2">Playbook Applied</span>
                </div>
                <div>
                    <label className={labelCls}>Playbook Rule</label>
                    <input placeholder="Which rule?" value={form.playbook_rule} onChange={(e) => set("playbook_rule", e.target.value)} className={inputCls} />
                </div>
                <div>
                    <label className={labelCls}>Process Tag</label>
                    <Select
                        value={form.process_tag}
                        onChange={(value) => set("process_tag", value)}
                        options={processOptions}
                    />
                </div>
            </div>

            {/* Row 5: Notes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div>
                    <label className={labelCls}>Notes — Pre</label>
                    <textarea rows={2} placeholder="Before the trade..." value={form.notes_pre} onChange={(e) => set("notes_pre", e.target.value)} className={inputCls + " resize-none"} />
                </div>
                <div>
                    <label className={labelCls}>Notes — During</label>
                    <textarea rows={2} placeholder="During the trade..." value={form.notes_during} onChange={(e) => set("notes_during", e.target.value)} className={inputCls + " resize-none"} />
                </div>
                <div>
                    <label className={labelCls}>Notes — Post</label>
                    <textarea rows={2} placeholder="After the trade..." value={form.notes_post} onChange={(e) => set("notes_post", e.target.value)} className={inputCls + " resize-none"} />
                </div>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={saving || !form.product || !form.entry_price}
                className="bg-accent text-bg border border-accent font-bold px-6 py-2.5 rounded-md hover:bg-[#a6d848] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm w-full md:w-auto"
            >
                {saving ? "Saving..." : form.id ? "Update Trade" : "Add Trade"}
            </button>
        </form>
    );
}
