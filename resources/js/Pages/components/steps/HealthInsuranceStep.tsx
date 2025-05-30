import React, { useState } from "react";
import { HeartPulse } from "lucide-react";

export default function HealthInsuranceStep({ healthInsurances, data, updateData, onNext, onBack, scrollToBottomSmooth }) {
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!data.healthInsurance) {
      setError("Por favor seleccione una obra social");
      return;
    }

    setError("");
    onNext();
  };

  // 🔍 Normalizar texto sin tildes para buscar
  const normalize = (text: string) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filteredInsurances = healthInsurances.filter((insurance) =>
    normalize(insurance.nombre).includes(normalize(search))
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="bg-blue-50 rounded-full p-6 flex-shrink-0">
          <HeartPulse className="w-12 h-12 text-blue-600" />
        </div>
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-800">Seleccione obra social</h2>
          <p className="text-gray-600">Seleccione su cobertura médica</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div>
          <input
            type="text"
            placeholder="Buscar obra social..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 mb-6 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {filteredInsurances.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInsurances.map((insurance) => (
              <div
                key={insurance.id}
                className={`relative rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  data.healthInsurance === insurance.nombre
                    ? "bg-gradient-to-br from-blue-50 to-blue-50 border-2 border-blue-400 shadow-md"
                    : "bg-white border border-gray-200 hover:border-blue-200"
                }`}
                onClick={() => {
                  updateData({
                    healthInsuranceId: insurance.id,
                    healthInsurance: insurance.nombre,
                    specialtyId: null,
                    specialty: "",
                    doctorId: null,
                    doctor: "",
                    date: null,
                    time: "",
                  });
                  scrollToBottomSmooth();
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">{insurance.nombre}</span>
                </div>
                {data.healthInsurance === insurance.nombre && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-amber-600">No hay obras sociales disponibles para esta búsqueda.</p>
            <p className="text-gray-500 mt-2">Probá con otra palabra clave.</p>
          </div>
        )}

        {error && <p className="text-rose-500 text-sm mt-4">{error}</p>}
      </div>

      <div className="flex justify-end">
        
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white px-8 py-3 h-auto rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          disabled={filteredInsurances.length === 0}
        >
          Continuar
        </button>
      </div>
    </form>
  );
}
