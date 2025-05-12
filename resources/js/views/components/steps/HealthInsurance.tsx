
import type React from "react"

import { useState } from "react"
import { BriefcaseMedical } from "lucide-react"

// Lista de obras sociales disponibles
const healthInsurances = [
  { id: "osde", name: "OSDE" },
  { id: "swiss", name: "Swiss Medical" },
  { id: "galeno", name: "Galeno" },
  { id: "medife", name: "Medifé" },
  { id: "omint", name: "OMINT" },
  { id: "accord", name: "Accord Salud" },
  { id: "sancor", name: "Sancor Salud" },
  { id: "pami", name: "PAMI" },
  { id: "ioma", name: "IOMA" },
  { id: "particular", name: "Particular (Sin obra social)" },
]

export function HealthInsurance({ data, updateData, onNext }) {
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!data.healthInsurance) {
      setError("Por favor seleccione una obra social")
      return
    }

    setError("")
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="bg-blue-50 rounded-full p-6 flex-shrink-0">
          <BriefcaseMedical className="w-12 h-12 text-blue-600" />
        </div>
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-800">Seleccione su obra social</h2>
          <p className="text-gray-600">Para comenzar, indique su cobertura médica</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {healthInsurances.map((insurance) => (
            <div
              key={insurance.id}
              className={`relative rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${data.healthInsurance === insurance.name
                ? "bg-gradient-to-br from-blue-50 to-blue-50 border-2 border-blue-400 shadow-md"
                : "bg-white border border-gray-200 hover:border-blue-200"
                }`}
              onClick={() =>
                updateData({ healthInsurance: insurance.name, specialty: "", doctor: "", date: null, time: "" })
              }
            >
              <div className="flex items-center gap-3">
                <span className="font-medium">{insurance.name}</span>
              </div>
              {data.healthInsurance === insurance.name && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full"></div>
              )}
            </div>
          ))}
        </div>
        {error && <p className="text-rose-500 text-sm mt-4">{error}</p>}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white px-8 py-5 h-auto rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        >
          Continuar
        </button>
      </div>
    </form>
  )
}
