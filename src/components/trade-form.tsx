"use client";

import { useState, useEffect } from "react";

interface Product {
  code: string;
  name: string;
  exchange: string;
  tick_size: number;
  tick_value: number;
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setProducts);
  }, []);

  useEffect(() => {
    if (editTrade) setForm(editTrade);
    else setForm(EMPTY_FORM);
  }, [editTrade]);

  function set(field: keyof TradeFormData, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      entry_price: parseFloat(form.entry_price) || null,
      exit_price: parseFloat(form.exit_price) || null,
      size_contracts: parseInt(form.size_contracts) || 1,
      entry_time: form.entry_time ? `${form.date}T${form.entry_time}:00` : null,
      exit_time: form.exit_time ? `${form.date}T${form.exit_time}:00` : null,
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

  const inputCls = "bg-bg4 border border-border2 rounded px-3 py-2 text-[11px] text-text placeholder:text-muted2 focus:outline-none focus:border-accent/40 w-full";
  const labelCls = "text-[8px] tracking-[1.5px] uppercase text-muted mb-1 block";

  return (
    <form onSubmit={handleSubmit} className="bg-bg3 border border-border rounded p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[8px] tracking-[1.5px] uppercase text-muted">
          {form.id ? "Edit Trade" : "New Trade"}
        </span>
        <button type="button" onClick={onCancel} className="text-muted hover:text-text text-[10px]">
          ✕ close
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
          <select value={form.product} onChange={(e) => set("product", e.target.value)} className={inputCls}>
            <option value="">Select</option>
            {products.map((p) => (
              <option key={p.code} value={p.code}>{p.code}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Instrument</label>
          <input placeholder="e.g. CL Jul26" value={form.instrument} onChange={(e) => set("instrument", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Type</label>
          <select value={form.instrument_type} onChange={(e) => set("instrument_type", e.target.value)} className={inputCls}>
            <option>Outright</option>
            <option>Spread</option>
            <option>Fly</option>
            <option>Condor</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Direction</label>
          <select value={form.direction} onChange={(e) => set("direction", e.target.value)} className={inputCls}>
            <option>Long</option>
            <option>Short</option>
          </select>
        </div>
      </div>

      {/* Row 2: Entry/Exit */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
        <div>
          <label className={labelCls}>Entry Price</label>
          <input type="number" step="any" placeholder="0.00" value={form.entry_price} onChange={(e) => set("entry_price", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Entry Time</label>
          <input type="time" value={form.entry_time} onChange={(e) => set("entry_time", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Exit Price</label>
          <input type="number" step="any" placeholder="0.00" value={form.exit_price} onChange={(e) => set("exit_price", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Exit Time</label>
          <input type="time" value={form.exit_time} onChange={(e) => set("exit_time", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Size (contracts)</label>
          <input type="number" min="1" value={form.size_contracts} onChange={(e) => set("size_contracts", e.target.value)} className={inputCls} />
        </div>
      </div>

      {/* Row 3: Strategy, Assumption */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <div>
          <label className={labelCls}>Strategy</label>
          <input placeholder="e.g. ST-01 ORB" value={form.strategy} onChange={(e) => set("strategy", e.target.value)} className={inputCls} />
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
          <select value={form.process_tag} onChange={(e) => set("process_tag", e.target.value)} className={inputCls}>
            <option value="">Select</option>
            <option>Good</option>
            <option>Bad</option>
            <option>Lucky</option>
            <option>Unlucky</option>
          </select>
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
        className="bg-accent/10 border border-accent/20 text-accent text-[10px] px-5 py-2 rounded hover:bg-accent/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {saving ? "Saving..." : form.id ? "Update Trade" : "Add Trade"}
      </button>
    </form>
  );
}
