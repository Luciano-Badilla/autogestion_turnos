import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Info, Stethoscope, X } from "lucide-react";
import { Button } from "shadcn/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "shadcn/components/ui/dialog";

export default function SpecialtyStep({
  specialties,
  data,
  updateData,
  onNext,
  onBack,
  scrollToBottomSmooth,
  specialtyMessagesById = {}, // ← NUEVO (map id -> string)
}) {
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [isMessageOpen, setIsMessageOpen] = useState(false);

  const normalize = (text) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filteredSpecialties = specialties.filter((s) =>
    normalize(s.nombre).includes(normalize(search))
  );

  const currentMessage =
    data.specialtyId ? (specialtyMessagesById[data.specialtyId] || "").trim() : "";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.specialty || !data.specialtyId) {
      setError("Por favor seleccione una especialidad");
      return;
    }
    setError("");
    if (currentMessage.length > 0) {
      setIsMessageOpen(true); // hay mensaje → abrir modal
      return;
    }
    onNext(); // no hay mensaje → avanzar normal
  };

  const handleContinueFromModal = () => {
    setIsMessageOpen(false);
    onNext();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8 min-w-0">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="bg-[#013765] rounded-full p-6 flex-shrink-0">
            <Stethoscope className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-800">Seleccionar especialidad </h2>
            <p className="text-gray-600">Elegir turnos para consultas profesionales</p>
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
                    updateData({
                      specialtyId: specialty.id,
                      specialty: specialty.nombre,
                      doctor: "",
                      doctorId: null,
                      date: null,
                      time: "",
                    });
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
      {isMessageOpen && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          {/* Modal solo si hay mensaje */}
          {isMessageOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                {/* Header del Modal */}
                <div className="px-6 py-4 bg-[#013765]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">

                      <div>
                        <h3 className="text-xl font-bold text-white">{data.specialty}</h3>
                        <p className="text-white/90 text-sm">Información</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setIsMessageOpen(false)}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 p-2"
                      type="button"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Contenido del Modal */}
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-2 rounded-full bg-blue-100">
                      <Info className="w-4 h-4 text-[#013765]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 leading-relaxed">{currentMessage}</p>
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex gap-3 mt-6">

                    <Button
                      onClick={handleContinueFromModal}
                      className="flex-1 py-3 text-white bg-gradient-to-r bg-[#013765] hover:bg-blue-800"
                      type="button"
                    >
                      Entendido, continuar
                    </Button>
                  </div>
                </div>

                {/* Footer informativo */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                  <p className="text-xs text-gray-600 text-center">
                    Por favor, lea atentamente antes de continuar
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}


    </>
  );
}
