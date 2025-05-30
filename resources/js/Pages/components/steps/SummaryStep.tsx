"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "shadcn/components/ui/button"
import { Check, ClipboardCheck } from "lucide-react"

export function SummaryStep({ data, updateData, onBack }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      // Aquí iría la lógica para enviar los datos al servidor
      // Simulamos una petición con un timeout
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsSubmitted(true)
    } catch (error) {
      console.error("Error al enviar el formulario:", error)
      setError("Ocurrió un error al procesar su solicitud. Por favor intente nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center space-y-8 py-8">
        <div className="mx-auto bg-gradient-to-r from-blue-400 to-blue-400 rounded-full p-4 w-20 h-20 flex items-center justify-center shadow-lg">
          <Check className="w-10 h-10 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">¡Turno confirmado!</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Hemos enviado los detalles de su turno a <span className="font-medium text-blue-600">{data.email}</span>.
            También recibirá un recordatorio por SMS al <span className="font-medium text-blue-600">{data.phone}</span>.
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-50 p-8 rounded-2xl max-w-md mx-auto text-left border border-blue-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-blue-800 text-lg">Detalles del turno</h3>
            <div className="bg-white p-2 rounded-full">
              <ClipboardCheck className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="space-y-3">
            <p className="font-medium text-blue-700">
              Número de confirmación:{" "}
              <span className="text-gray-800">{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
            </p>
            <p>
              <span className="text-gray-500">Paciente:</span>{" "}
              <span className="font-medium text-gray-800">
                {data.firstName} {data.lastName}
              </span>
            </p>
            <p>
              <span className="text-gray-500">DNI:</span>{" "}
              <span className="font-medium text-gray-800">{data.documentNumber}</span>
            </p>
            <p>
              <span className="text-gray-500">Obra Social:</span>{" "}
              <span className="font-medium text-gray-800">{data.healthInsurance}</span>
            </p>
            <p>
              <span className="text-gray-500">Especialidad:</span>{" "}
              <span className="font-medium text-gray-800">{data.specialty}</span>
            </p>
            <p>
              <span className="text-gray-500">Médico:</span>{" "}
              <span className="font-medium text-gray-800">{data.doctor}</span>
            </p>
            <p>
              <span className="text-gray-500">Fecha:</span>{" "}
              <span className="font-medium text-gray-800">{data.date}</span>
            </p>
            <p>
              <span className="text-gray-500">Hora:</span>{" "}
              <span className="font-medium text-gray-800">{data.time}</span>
            </p>
            <p>
              <span className="text-gray-500">Contacto:</span>{" "}
              <span className="font-medium text-gray-800">
                {data.phone} | {data.email}
              </span>
            </p>
          </div>
        </div>
        <Button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white px-8 py-5 h-auto rounded-xl shadow-md hover:shadow-lg transition-all duration-200 mt-6"
        >
          Solicitar nuevo turno
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="bg-blue-50 rounded-full p-6 flex-shrink-0">
          <ClipboardCheck className="w-12 h-12 text-blue-600" />
        </div>
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-800">Resumen del turno</h2>
          <p className="text-gray-600">Verifique los datos de su turno antes de confirmar</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-blue-50 rounded-xl p-6 shadow-sm border border-blue-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm text-blue-600">Obra Social</p>
            <p className="font-medium text-gray-800">{data.healthInsurance}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-blue-600">Especialidad</p>
            <p className="font-medium text-gray-800">{data.specialty}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-blue-600">Médico</p>
            <p className="font-medium text-gray-800">{data.doctor}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-blue-600">Fecha y Hora</p>
            <p className="font-medium text-gray-800">
              {data.date} - {data.time}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-blue-600">Paciente</p>
            <p className="font-medium text-gray-800">
              {data.firstName} {data.lastName}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-blue-600">DNI</p>
            <p className="font-medium text-gray-800">{data.documentNumber}</p>
          </div>
          <div className="md:col-span-2 space-y-1">
            <p className="text-sm text-blue-600">Email</p>
            <p className="font-medium text-gray-800">{data.email}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-blue-600">Celular</p>
            <p className="font-medium text-gray-800">{data.phone}</p>
          </div>
        </div>
      </div>

      {error && <div className="bg-rose-50 text-rose-500 p-4 rounded-lg border border-rose-200">{error}</div>}

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-5 h-auto rounded-xl"
        >
          Atrás
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white px-8 py-5 h-auto rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              Procesando...
            </span>
          ) : (
            "Confirmar turno"
          )}
        </Button>
      </div>
    </form>
  )
}
