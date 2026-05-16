"use client";

import { useState } from "react";
import { 
  Menu, X, Search, 
  Bath, Droplet, Utensils, Dumbbell, 
  BookOpen, Printer, Landmark, Store, 
  Palette, Presentation, Library, 
  Briefcase, Building2 
} from "lucide-react";

const CATEGORIES = [
  { id: "edificios", name: "Edificios", icon: Building2, colorClass: "text-[#475569] bg-[#475569]/10" },
  { id: "departamentos", name: "Departamentos", icon: Briefcase, colorClass: "text-[#0284C7] bg-[#0284C7]/10" },
  { id: "salas-estudio", name: "Salas de Estudio", icon: BookOpen, colorClass: "text-[#9333EA] bg-[#9333EA]/10" },
  { id: "bibliotecas", name: "Bibliotecas", icon: Library, colorClass: "text-[#7C3AED] bg-[#7C3AED]/10" },
  { id: "baños", name: "Baños", icon: Bath, colorClass: "text-[#0D9488] bg-[#0D9488]/10" },
  { id: "agua", name: "Agua", icon: Droplet, colorClass: "text-[#38BDF8] bg-[#38BDF8]/10" },
  { id: "comida", name: "Comida", icon: Utensils, colorClass: "text-[#EA580C] bg-[#EA580C]/10" },
  { id: "deportes", name: "Deportes", icon: Dumbbell, colorClass: "text-[#16A34A] bg-[#16A34A]/10" },
  { id: "impresiones", name: "Impresiones", icon: Printer, colorClass: "text-[#DB2777] bg-[#DB2777]/10" },
  { id: "bancos", name: "Bancos", icon: Landmark, colorClass: "text-[#059669] bg-[#059669]/10" },
  { id: "tiendas", name: "Tiendas", icon: Store, colorClass: "text-[#C026D3] bg-[#C026D3]/10" },
  { id: "cultura", name: "Cultura", icon: Palette, colorClass: "text-[#E11D48] bg-[#E11D48]/10" },
  { id: "auditorios", name: "Auditorios", icon: Presentation, colorClass: "text-[#4F46E5] bg-[#4F46E5]/10" },
];

export default function NavigationSideBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>("edificios");

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden absolute top-4 left-4 z-40 p-3 bg-white text-usm-blue rounded-xl shadow-md border border-ui-200 hover:bg-ui-50 transition-colors"
      >
        <Menu size={24} />
      </button>

      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-ui-900/40 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-ui-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0`}
      >
        <div className="p-6 border-b border-ui-100 flex justify-between items-start">
          <div>
            <h1 className="text-sm font-bold text-usm-blue tracking-wide uppercase leading-tight">
              Universidad Técnica <br />
              Federico Santa María
            </h1>
          </div>
          <button
            className="md:hidden text-ui-400 hover:text-ui-800 p-1"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ui-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar edificios, salas..."
              className="w-full pl-10 pr-4 py-2.5 bg-ui-50 border border-ui-200 rounded-xl text-sm text-ui-800 placeholder-ui-400 focus:outline-none focus:ring-2 focus:ring-usm-blue/20 focus:border-usm-blue transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pt-2">
          <h2 className="text-[10px] font-bold text-ui-400 tracking-widest uppercase mb-3 px-1">
            Categorías
          </h2>
          <ul className="space-y-1.5 pb-4">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;

              return (
                <li key={category.id}>
                  <button
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-usm-yellow/10 text-usm-blue border border-usm-yellow"
                        : "bg-white text-ui-800 border border-transparent hover:bg-ui-50 hover:border-ui-200"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${category.colorClass}`}>
                      <Icon size={18} strokeWidth={2.5} />
                    </div>
                    
                    {category.name}
                    
                    {isActive && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-usm-yellow" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="p-4 border-t border-ui-100 bg-ui-50 mt-auto">
          <p className="text-xs text-ui-500 text-center font-medium">
            Campus Casa Central, Valparaíso
          </p>
        </div>
      </aside>
    </>
  );
}