"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/app-shell";

interface Product {
  code: string;
  name: string;
  exchange: string;
  tick_size: number;
  tick_value: number;
}

const EMPTY: Product = { code: "", name: "", exchange: "", tick_size: 0, tick_value: 0 };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Product>(EMPTY);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchProducts() {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }

  useEffect(() => { fetchProducts(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(EMPTY);
    setEditing(false);
    fetchProducts();
  }

  async function handleDelete(code: string) {
    if (!confirm(`Delete ${code}?`)) return;
    await fetch("/api/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    fetchProducts();
  }

  function startEdit(p: Product) {
    setForm(p);
    setEditing(true);
  }

  return (
    <AppShell>
      <div className="max-w-[900px]">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-heading font-semibold text-[16px] text-text">Products</h1>
          <p className="text-[10px] text-muted mt-1">Manage tradable products and their tick values.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-bg3 border border-border rounded p-4 mb-6">
          <div className="text-[8px] tracking-[1.5px] uppercase text-muted mb-3">
            {editing ? "Edit Product" : "Add Product"}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <input
              placeholder="Code (e.g. CL)"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              disabled={editing}
              className="bg-bg4 border border-border2 rounded px-3 py-2 text-[11px] text-text placeholder:text-muted2 focus:outline-none focus:border-accent/40 disabled:opacity-50"
            />
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-bg4 border border-border2 rounded px-3 py-2 text-[11px] text-text placeholder:text-muted2 focus:outline-none focus:border-accent/40"
            />
            <input
              placeholder="Exchange"
              value={form.exchange}
              onChange={(e) => setForm({ ...form, exchange: e.target.value })}
              className="bg-bg4 border border-border2 rounded px-3 py-2 text-[11px] text-text placeholder:text-muted2 focus:outline-none focus:border-accent/40"
            />
            <input
              placeholder="Tick Size"
              type="number"
              step="any"
              value={form.tick_size || ""}
              onChange={(e) => setForm({ ...form, tick_size: parseFloat(e.target.value) || 0 })}
              className="bg-bg4 border border-border2 rounded px-3 py-2 text-[11px] text-text placeholder:text-muted2 focus:outline-none focus:border-accent/40"
            />
            <input
              placeholder="Tick Value ($)"
              type="number"
              step="any"
              value={form.tick_value || ""}
              onChange={(e) => setForm({ ...form, tick_value: parseFloat(e.target.value) || 0 })}
              className="bg-bg4 border border-border2 rounded px-3 py-2 text-[11px] text-text placeholder:text-muted2 focus:outline-none focus:border-accent/40"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              type="submit"
              className="bg-accent/10 border border-accent/20 text-accent text-[10px] px-4 py-1.5 rounded hover:bg-accent/15 transition-colors"
            >
              {editing ? "Update" : "Add"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => { setForm(EMPTY); setEditing(false); }}
                className="border border-border2 text-muted text-[10px] px-4 py-1.5 rounded hover:text-text transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Table */}
        {loading ? (
          <p className="text-muted text-[11px]">Loading...</p>
        ) : (
          <div className="bg-bg3 border border-border rounded overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-[8px] tracking-[1.5px] uppercase text-muted px-4 py-2 border-b border-border">Code</th>
                  <th className="text-left text-[8px] tracking-[1.5px] uppercase text-muted px-4 py-2 border-b border-border">Name</th>
                  <th className="text-left text-[8px] tracking-[1.5px] uppercase text-muted px-4 py-2 border-b border-border">Exchange</th>
                  <th className="text-left text-[8px] tracking-[1.5px] uppercase text-muted px-4 py-2 border-b border-border">Tick Size</th>
                  <th className="text-left text-[8px] tracking-[1.5px] uppercase text-muted px-4 py-2 border-b border-border">Tick Value</th>
                  <th className="text-[8px] px-4 py-2 border-b border-border"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.code} className="hover:bg-accent/[0.03]">
                    <td className="px-4 py-2 text-[11px] text-accent font-medium border-b border-border">{p.code}</td>
                    <td className="px-4 py-2 text-[11px] text-text border-b border-border">{p.name}</td>
                    <td className="px-4 py-2 text-[11px] text-text2 border-b border-border">{p.exchange}</td>
                    <td className="px-4 py-2 text-[11px] text-text2 border-b border-border">{p.tick_size}</td>
                    <td className="px-4 py-2 text-[11px] text-text2 border-b border-border">${p.tick_value}</td>
                    <td className="px-4 py-2 text-[11px] border-b border-border">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => startEdit(p)}
                          className="text-muted hover:text-accent text-[10px] transition-colors"
                        >
                          edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.code)}
                          className="text-muted hover:text-red text-[10px] transition-colors"
                        >
                          del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
