"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, Loader2, CheckCircle, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminCategorias() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Category State
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setCategories(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const slug = newSlug || newName.toLowerCase().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const { data, error } = await supabase
      .from('categories')
      .insert([{ name: newName, slug, is_active: true }])
      .select();

    if (error) {
      alert("Erro ao criar categoria: " + error.message);
    } else if (data) {
      setCategories([data[0], ...categories]);
      setIsModalOpen(false);
      setNewName("");
      setNewSlug("");
    }
    setSaving(false);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (!error) {
      setCategories(categories.map(c => 
        c.id === id ? { ...c, is_active: !currentStatus } : c
      ));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza? Isso pode afetar produtos vinculados a esta categoria.")) return;

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (!error) {
      setCategories(categories.filter(c => c.id !== id));
    } else {
      alert("Erro ao excluir: " + error.message);
    }
  };

  return (
    <div className="space-y-12 pb-24">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter text-[#73185e]">Gestor de <span className="font-playfair italic font-normal text-[#BFA054]">Categorias</span></h1>
          <p className="text-[#73185e]/60 text-[11px] uppercase tracking-widest font-bold mt-2">Crie novas coleções (Linho, Alfaiataria, Marant) para seu catálogo.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 bg-[#73185e] text-white px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#5D134B] transition-all shadow-lg shadow-[#73185e]/20 rounded-[4px]"
        >
          <Plus className="w-4 h-4" /> Nova Categoria
        </button>
      </header>

      {/* Categories Table */}
      <section className="bg-white/60 backdrop-blur-sm border border-[#73185e]/10 overflow-hidden rounded-[4px] shadow-sm">
        {loading ? (
          <div className="p-24 text-center font-playfair italic text-[#BFA054]">Sincronizando coleções...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#73185e]/5 border-b border-[#73185e]/10 text-[9px] uppercase tracking-[0.2em] font-bold text-[#73185e]">
                <th className="px-8 py-5">Nome da Categoria</th>
                <th className="px-8 py-5">Slug (URL)</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#73185e]/10">
              {categories.map((cat) => (
                <tr key={cat.id} className="text-sm hover:bg-white/40 transition-all group">
                  <td className="px-8 py-6 font-bold text-[#73185e] uppercase tracking-widest text-[11px]">{cat.name}</td>
                  <td className="px-8 py-6 text-[#73185e]/40 font-mono text-[10px]">/colecao/{cat.slug}</td>
                  <td className="px-8 py-6 text-center">
                    <button 
                      onClick={() => toggleStatus(cat.id, cat.is_active)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-[9px] uppercase tracking-[0.2em] font-bold border transition-all",
                        cat.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-white/20 text-[#73185e]/30 border-[#73185e]/10"
                      )}
                    >
                      {cat.is_active ? "Ativo" : "Oculto"}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-[#73185e]/60 inline-flex hover:text-[#73185e]"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(cat.id)} className="text-rose-300 inline-flex hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-24 text-center">
                    <p className="text-[#73185e]/40 text-[10px] uppercase tracking-widest font-bold">Nenhuma categoria encontrada.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>

      {/* Simple Modal overlay for Creating Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#73185e]/5 backdrop-blur-sm p-6 animate-in fade-in duration-300">
          <div className="bg-white border border-[#73185e]/10 w-full max-w-md p-10 shadow-2xl space-y-8 rounded-[4px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold tracking-tighter text-[#73185e]">Nova <span className="font-playfair italic font-normal text-[#BFA054]">Categoria</span></h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#73185e]/40 hover:text-[#73185e] mt-[-20px]"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreate} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#73185e]/60">Nome da Coleção</label>
                <input 
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Alfaiataria Linho"
                  className="w-full px-6 py-4 bg-[#73185e]/5 border border-transparent outline-none focus:ring-1 focus:ring-[#73185e] text-[11px] uppercase tracking-widest font-bold placeholder:text-[#73185e]/20 rounded-[2px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#73185e]/60">Slug Customizado (Opcional)</label>
                <input 
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="alfaiataria-linho"
                  className="w-full px-6 py-4 bg-[#73185e]/5 border border-transparent outline-none focus:ring-1 focus:ring-[#73185e] text-[11px] font-mono placeholder:text-[#73185e]/20 rounded-[2px]"
                />
                <p className="text-[9px] text-[#73185e]/30 italic font-bold uppercase tracking-widest">Deixe vazio para gerar automaticamente.</p>
              </div>

              <div className="pt-4">
                <button 
                  disabled={saving}
                  className="w-full py-5 bg-[#73185e] text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#5D134B] transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#73185e]/20 rounded-[2px]"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : "Salvar Coleção"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
