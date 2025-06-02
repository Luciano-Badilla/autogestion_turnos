"use client"

import React, { useState, useEffect } from "react"
import { Button } from "shadcn/components/ui/button"
import { UserRound } from "lucide-react"
import axios from "axios"

export default function DoctorStep({ data, updateData, onNext, onBack, scrollToBottomSmooth }) {
  const [doctors, setDoctors] = useState<
    Array<{ id: string; name: string; rating: number; experience: string }>
  >([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!data.specialty) return
      setLoading(true)
      setError("")

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/doctors/${encodeURIComponent(data.specialtyId)}`
        );

        setDoctors(response.data || [])
      } catch (err) {
        console.error("Error fetching doctors:", err)
        setError("Hubo un problema al cargar los profesionales.")
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [data.specialty, data.healthInsurance])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!data.doctor) {
      setError("Por favor seleccione un profesional")
      return
    }

    setError("")
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="bg-blue-50 rounded-full p-6 flex-shrink-0">
          <UserRound className="w-12 h-12 text-blue-600" />
        </div>
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-800">Seleccione profesional</h2>
          <p className="text-gray-600">
            Elija el profesional para{" "}
            <span className="text-blue-600 font-medium">{data.specialty}</span>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        {loading ? (
          <p className="text-gray-500">Cargando profesionales...</p>
        ) : doctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className={`relative rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${data.doctor === doctor.nombres + ' ' + doctor.apellidos
                  ? "bg-gradient-to-br from-blue-50 to-blue-50 border-2 border-blue-400 shadow-md"
                  : "bg-white border border-gray-200 hover:border-blue-200"
                  }`}
                onClick={() => {
                  updateData({ doctor: doctor.nombres + ' ' + doctor.apellidos, doctorId: doctor.id, date: null, time: "" });
                  scrollToBottomSmooth();
                }}
              >
                <div className="flex flex-col gap-2">
                  <span className="font-semibold text-gray-800">Dr/a {doctor.nombres} {doctor.apellidos}</span>
                  <div className="flex items-center text-sm">
                  </div>
                </div>
                {data.doctor === doctor.nombres + ' ' + doctor.apellidos && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-amber-50 text-amber-800 p-4 rounded-lg">
            <p>No hay profesionales disponibles para esta especialidad con su obra social.</p>
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
        <Button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white px-8 py-3 h-auto rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          disabled={doctors.length === 0}
        >
          Continuar
        </Button>
      </div>
    </form>
  )
}
