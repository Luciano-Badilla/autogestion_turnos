
import type React from "react"

import { useState, useEffect } from "react"
import { Stethoscope } from "lucide-react"


// Función para obtener especialidades según la obra social
const getSpecialtiesByInsurance = (insurance: string) => {
  // En una aplicación real, esto sería una llamada a una API
  const allSpecialties = [
    { id: "cardiologia", name: "Cardiología", icon: "❤️" },
    { id: "dermatologia", name: "Dermatología", icon: "🧬" },
    { id: "endocrinologia", name: "Endocrinología", icon: "⚗️" },
    { id: "gastroenterologia", name: "Gastroenterología", icon: "�胃" },
    { id: "ginecologia", name: "Ginecología", icon: "👩" },
    { id: "neurologia", name: "Neurología", icon: "🧠" },
    { id: "oftalmologia", name: "Oftalmología", icon: "👁️" },
    { id: "pediatria", name: "Pediatría", icon: "👶" },
    { id: "psiquiatria", name: "Psiquiatría", icon: "🧘" },
    { id: "traumatologia", name: "Traumatología", icon: "🦴" },
    { id: "urologia", name: "Urología", icon: "🚽" },
  ]

  // Simulamos que algunas obras sociales no cubren todas las especialidades
  if (insurance === "PAMI") {
    return allSpecialties.filter((s) =>
      ["cardiologia", "clinica", "neurologia", "oftalmologia", "traumatologia"].includes(s.id),
    )
  } else if (insurance === "IOMA") {
    return allSpecialties.filter((s) =>
      ["cardiologia", "ginecologia", "pediatria", "clinica", "traumatologia"].includes(s.id),
    )
  } else if (insurance === "Particular (Sin obra social)") {
    return allSpecialties // Todas las especialidades disponibles
  } else {
    // Para otras obras sociales, excluimos algunas especialidades aleatoriamente
    return allSpecialties.filter(() => Math.random() > 0.2)
  }
}

export function SpecialtyStep({ data, updateData, onNext, onBack }) {
  const [specialties, setSpecialties] = useState([])
  const [error, setError] = useState("")

  useEffect(() => {
    if (data.healthInsurance) {
      setSpecialties(getSpecialtiesByInsurance(data.healthInsurance))
    }
  }, [data.healthInsurance])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!data.specialty) {
      setError("Por favor seleccione una especialidad")
      return
    }

    setError("")
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="bg-blue-50 rounded-full p-6 flex-shrink-0">
          <Stethoscope className="w-12 h-12 text-blue-600" />
        </div>
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-800">Seleccione especialidad</h2>
          <p className="text-gray-600">
            Especialidades disponibles para <span className="text-blue-600 font-medium">{data.healthInsurance}</span>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        {specialties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {specialties.map((specialty) => (
              <div
                key={specialty.id}
                className={`relative rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  data.specialty === specialty.name
                    ? "bg-gradient-to-br from-blue-50 to-blue-50 border-2 border-blue-400 shadow-md"
                    : "bg-white border border-gray-200 hover:border-blue-200"
                }`}
                onClick={() => updateData({ specialty: specialty.name, doctor: "", date: null, time: "" })}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{specialty.icon}</div>
                  <span className="font-medium">{specialty.name}</span>
                </div>
                {data.specialty === specialty.name && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-amber-600">No hay especialidades disponibles para esta obra social.</p>
            <p className="text-gray-500 mt-2">Por favor, seleccione otra obra social o contacte con su proveedor.</p>
          </div>
        )}
        {error && <p className="text-rose-500 text-sm mt-4">{error}</p>}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          variant="outline"
          onClick={onBack}
          className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-5 h-auto rounded-xl"
        >
          Atrás
        </button>
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white px-8 py-5 h-auto rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          disabled={specialties.length === 0}
        >
          Continuar
        </button>
      </div>
    </form>
  )
}
