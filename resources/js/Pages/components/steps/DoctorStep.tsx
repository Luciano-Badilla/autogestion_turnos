"use client"

import React, { useState, useEffect } from "react"
import { Button } from "shadcn/components/ui/button"
import { Loader2, UserCircle, UserRound } from "lucide-react"
import axios from "axios"

export default function DoctorStep({ data, updateData, onNext, onBack, scrollToBottomSmooth }) {
  const [doctors, setDoctors] = useState<
    Array<{ id: string; nombres: string; apellidos: string; turnosDisponibles: number }>
  >([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchDoctorsWithTurnos = async () => {
      if (!data.specialtyId) {
        setDoctors([])
        return
      }
      setLoading(true)
      setError("")

      try {
        // 1. Traer IDs habilitados
        const enabledDoctorsRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/enabled-doctors/${data.needsUpdateHealthInsurance ? data.newHealthInsuranceId : data.healthInsuranceId}`
        )
        const enabledDoctorIds: string[] = enabledDoctorsRes.data || []

        // 2. Traer todos los doctores para esa especialidad
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/doctors/${encodeURIComponent(data.specialtyId)}`
        )
        const allDoctors = response.data || []

        // 3. Filtrar por los habilitados
        const filteredDoctors = allDoctors.filter((doc: { id: string }) =>
          enabledDoctorIds.includes(doc.id)
        )

        // 4. Traer turnos para cada doctor
        const doctorsWithTurnos = await Promise.all(
          filteredDoctors.map(async (doc: { id: string }) => {
            try {
              const turnosResponse = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/dateTime/${doc.id}/${data.specialtyId}`
              )
              const turnos = turnosResponse.data || []
              return { ...doc, turnosDisponibles: turnos.length }
            } catch {
              return { ...doc, turnosDisponibles: 0 }
            }
          })
        )

        // 5. Ordenar por disponibilidad, apellido y nombre
        doctorsWithTurnos.sort((a, b) => {
          if (a.turnosDisponibles > 0 && b.turnosDisponibles === 0) return -1
          if (a.turnosDisponibles === 0 && b.turnosDisponibles > 0) return 1

          const lastNameA = a.apellidos.toLowerCase()
          const lastNameB = b.apellidos.toLowerCase()
          if (lastNameA < lastNameB) return -1
          if (lastNameA > lastNameB) return 1

          const firstNameA = a.nombres.toLowerCase()
          const firstNameB = b.nombres.toLowerCase()
          if (firstNameA < firstNameB) return -1
          if (firstNameA > firstNameB) return 1

          return 0
        })

        setDoctors(doctorsWithTurnos)
      } catch (err) {
        console.error("Error fetching doctors:", err)
        setError("Hubo un problema al cargar los profesionales.")
        setDoctors([])
      } finally {
        setLoading(false)
      }
    }

    fetchDoctorsWithTurnos()
  }, [data.specialtyId])


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
        <div className="bg-[#013765] rounded-full p-6 flex-shrink-0">
          <UserRound className="w-12 h-12 text-white" />
        </div>
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-800">Seleccione profesional</h2>
          <p className="text-gray-600">
            Elija el profesional para{" "}
            <span className="text-[#013765] font-medium">{data.specialty}</span>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin text-[#013765]" />
            <span className="ml-2 text-[#013765]">Cargando profesionales...</span>
          </div>
        ) : doctors.length > 0 ? (
          <div className="flex flex-col lg:grid lg:grid-cols-3 items-center lg:flex-wrap justify-center gap-3">
            {doctors.map((doctor) => {
              const isSelected = data.doctor === doctor.nombres + " " + doctor.apellidos
              const disabled = doctor.turnosDisponibles === 0
              return (
                <div
                  key={doctor.id}
                  className={`relative rounded-xl p-4 cursor-pointer transition-all duration-200 w-full h-[120px] border flex items-center gap-4 shadow-sm
    ${isSelected
                      ? "bg-gradient-to-br from-blue-50 to-blue-50 border-2 border-[#013765] shadow-md"
                      : "bg-white border border-gray-200 hover:border-blue-200"
                    }
    ${disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"}`}
                  onClick={() => {
                    if (disabled) return;
                    updateData({
                      doctor: doctor.nombres + " " + doctor.apellidos,
                      doctorId: doctor.id,
                      date: null,
                      time: "",
                    });
                    scrollToBottomSmooth();
                  }}
                >
                  <div className="flex-shrink-0">
                    <img
                      src={doctor.imagen_url || "/autogestion_turnos_hu/public/storage/doctores/no_photo_uploaded.png"}
                      alt={`Imagen de ${doctor.nombres}`}
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/autogestion_turnos_hu/public/storage/doctores/no_photo_uploaded.png";
                      }}
                    />
                  </div>

                  <div className="flex flex-col justify-center">
                    <span className="text-sm text-gray-800 font-semibold">Dr/a</span>
                    <span className="text-sm text-gray-800 font-semibold">{doctor.apellidos}, {doctor.nombres}</span>
                    <span className="text-sm text-[#013765] font-semibold">
                      Turnos disponibles: <span className="text-[#013765]">{doctor.turnosDisponibles}</span>
                    </span>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-[#013765] rounded-full"></div>
                  )}
                </div>

              )
            })}
          </div>
        ) : (
          <div className="bg-amber-50 text-amber-800 p-4 rounded-lg text-center">
            <p>No hay profesionales disponibles para esta especialidad.</p>
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
          className="bg-[#013765] hover:bg-blue-800 text-white px-8 py-3 h-auto rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          disabled={doctors.length === 0 || doctors.every(d => d.turnosDisponibles === 0)}
        >
          Continuar
        </Button>
      </div>
    </form>
  )
}
