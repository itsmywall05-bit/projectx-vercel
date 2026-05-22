"use client";

import { useState } from "react";

export default function TDForm({ onSaved }: { onSaved?: () => void }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [priority, setPriority] = useState("medium");
    const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
    const [saving, setSaving] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { title, description, tags: tags.split(",").map(t => t.trim()).filter(Boolean), priority, entryDate };
            const res = await fetch('/api/backlog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Failed');
            setTitle(''); setDescription(''); setTags(''); setPriority('medium');
            onSaved && onSaved();
        } catch (err) {
            alert('Unable to save TD: ' + String(err));
        } finally { setSaving(false); }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-bg3 border border-border rounded p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input value={entryDate} onChange={(e) => setEntryDate(e.target.value)} type="date" className="p-2 bg-bg2 border" />
                <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="p-2 bg-bg2 border" />
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="p-2 bg-bg2 border">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
            </div>
            <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full mt-2 p-2 bg-bg2 border" rows={4} />
            <input placeholder="tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full mt-2 p-2 bg-bg2 border" />
            <div className="flex justify-end mt-2">
                <button type="submit" disabled={saving} className="px-3 py-1 bg-accent text-bg rounded">{saving ? 'Saving…' : 'Add TD'}</button>
            </div>
        </form>
    );
}
