"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "shadcn/components/ui/button"
import { Calendar } from "shadcn/components/ui/calendar"
import { CalendarDays, Clock, Loader2 } from "lucide-react"
import { es } from "date-fns/locale"

export default function DateTimeStep({ data, updateData, onNext, onBack, scrollToBottomSmooth }) {
  const [availableSlots, setAvailableSlots] = useState<{ [date: string]: string[] }>({})
  const [slotsData, setSlotsData] = useState<any[]>([])
  const [errors, setErrors] = useState({ date: "", time: "" })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSlots = async () => {
      if (!data.doctorId || !data.specialtyId) return

      setLoading(true)
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/dateTime/${data.doctorId}/${data.specialtyId}`)

        const slots = response.data || []
        setSlotsData(slots) // Guardar turnos completos

        const grouped: { [date: string]: string[] } = {}
        slots.forEach((slot: any) => {
          if (!grouped[slot.fecha]) grouped[slot.fecha] = []
          grouped[slot.fecha].push(slot.hora)
        })

        setAvailableSlots(grouped)
      } catch (error) {
        console.error("Error fetching available times:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSlots()
  }, [data.doctorId, data.specialtyId])

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      updateData({ date, time: "", agendaId: null })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors = {
      date: data.date ? "" : "Por favor seleccione una fecha",
      time: data.time ? "" : "Por favor seleccione un horario",
    }

    setErrors(newErrors)
    if (newErrors.date || newErrors.time) return

    onNext()
  }

  const selectedDateStr = data.date?.toISOString().split("T")[0] || ""
  const timesForDate = availableSlots[selectedDateStr] || []
  const enabledDates = Object.keys(availableSlots)

  const disabledDays = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return !enabledDates.includes(dateStr)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="bg-[#013765] rounded-full p-6 flex-shrink-0">
          <CalendarDays className="w-12 h-12 text-white" />
        </div>
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-800">Seleccionar fecha y horario</h2>
          <p className="text-gray-600">
            Elegir entre las opciones disponibles y hacer clic en continuar { /*<span className="text-[#013765] font-medium">{data.doctor}</span> */}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin text-[#013765]" />
            <span className="ml-2 text-[#013765]">Cargando horarios...</span>
          </div>
        ) : slotsData.length === 0 ? (
          <div className="bg-amber-50 text-amber-800 p-4 rounded-lg text-center">
            <p>Este profesional no tiene horarios disponibles para la especialidad seleccionada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[#013765]" />
                Seleccionar fecha 
              </h3>
              <Calendar
                mode="single"
                selected={data.date}
                onSelect={handleDateChange}
                disabled={disabledDays}
                className="rounded-md border-0"
                locale={es}
              />
              {errors.date && <p className="text-rose-500 text-sm mt-2">{errors.date}</p>}
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#013765]" />
                Seleccionar hora 
              </h3>
              {data.date ? (
                timesForDate.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 ml-5">
                    {timesForDate.map((time) => (
                      <div
                        key={time}
                        className={`rounded-lg p-3 text-center cursor-pointer transition-all duration-200 ${data.time === time
                          ? "bg-[#013765] text-white shadow-md"
                          : "bg-blue-100 hover:bg-gray-100 text-gray-800"
                          }`}
                        onClick={() => {
                          const selectedSlot = slotsData.find(
                            (slot) => slot.fecha === selectedDateStr && slot.hora === time
                          )
                          if (selectedSlot) {
                            updateData({
                              time,
                              agendaId: selectedSlot.agenda,
                            })
                          }
                          scrollToBottomSmooth();
                        }}
                      >
                        {time}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-amber-50 text-amber-800 p-4 rounded-lg text-center">
                    <p>No hay horarios disponibles para esta fecha.</p>
                  </div>
                )
              ) : (
                <div className="bg-gray-50 text-gray-500 p-4 rounded-lg">
                  <p>Primero seleccione una fecha para ver los horarios disponibles</p>
                </div>
              )}
              {errors.time && <p className="text-rose-500 text-sm mt-2">{errors.time}</p>}
            </div>
          </div>
        )}
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
        >
          Continuar
        </Button>
      </div>
    </form>
  )
}
