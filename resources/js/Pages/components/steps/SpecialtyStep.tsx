import React, { useState } from "react";
import { Stethoscope } from "lucide-react";
import { Button } from "shadcn/components/ui/button";

export default function SpecialtyStep({ specialties, data, updateData, onNext, onBack, scrollToBottomSmooth }) {
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!data.specialty) {
      setError("Por favor seleccione una especialidad");
      return;
    }

    setError("");
    onNext();
  };

  // 🔍 Filtrado sin acentos
  const normalize = (text: string) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filteredSpecialties = specialties.filter((specialty) =>
    normalize(specialty.nombre).includes(normalize(search))
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 min-w-0">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="bg-[#013765] rounded-full p-6 flex-shrink-0">
          <Stethoscope className="w-12 h-12 text-white" />
        </div>
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-800">Seleccionar especialidad </h2>
          <p className="text-gray-600">
            Elegir turnos para consultas profesionales
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div>
          <input
            type="text"
            placeholder="Buscar especialidad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 mb-6 border border-gray-300 rounded-lg shadow-sm focus:border-[#013765] focus:ring-[#013765]"
          />
        </div>

        {filteredSpecialties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSpecialties.map((specialty) => (
              <div
                key={specialty.id}
                className={`relative rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${data.specialty === specialty.nombre
                  ? "bg-gradient-to-br from-blue-50 to-blue-50 border-2 border-[#013765] shadow-md"
                  : "bg-white border border-gray-200 hover:border-blue-200"
                  }`}
                onClick={() => {
                  updateData({ specialtyId: specialty.id, specialty: specialty.nombre, doctor: "", doctorId: null, date: null, time: "" });
                  scrollToBottomSmooth();
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">{specialty.nombre}</span>
                </div>
                {data.specialty === specialty.nombre && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-[#013765] rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-amber-50 text-amber-800 p-4 rounded-lg">
              <p>No hay especialidades disponibles para esta búsqueda.</p>
            </div>
          </div>
        )}

        {error && <p className="text-rose-500 text-sm mt-4">{error}</p>}
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 h-auto rounded-xl"
        >
          Atrás
        </Button>
        <button
          type="submit"
          className="bg-[#013765] hover:bg-blue-800 text-white px-8 py-3 h-auto rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          disabled={filteredSpecialties.length === 0}
        >
          Continuar
        </button>
      </div>
    </form>
  );
}
