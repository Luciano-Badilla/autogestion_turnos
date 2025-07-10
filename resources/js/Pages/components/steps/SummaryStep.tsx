"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "shadcn/components/ui/button"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Check, ClipboardCheck, CalendarSync } from "lucide-react"
import CryptoJS from "crypto-js"
import AppointmentForm from "../../AppointmentForm"

export default function SummaryStep({ data, updateData, onBack, setStep }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const cancelUrl = `${import.meta.env.VITE_APP_URL}/api/cancelar/turno/$turnoId?token={tokenEncriptado}`
      const logoUrl = `${import.meta.env.VITE_APP_URL}/images/hu_icon_new.png`
      const resumenHtml = `
        <!-- Cuerpo principal del email -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" border="0" width="500"
                style="background-color: #f0f8ff;np padding: 48px; border: 1px solid #cfe2ff; font-family: 'Montserrat', Arial, sans-serif; text-align: left;">
                
                <!-- Logo -->
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <img src="https://i.imgur.com/Z3HOZfr.png" alt="Logo" style="max-height: 90px;" />
                  </td>
                </tr>

                <!-- Línea separadora -->
                <tr>
                  <td style="border-top: 5px solid #cfe2ff; padding-top: 16px; padding-bottom: 16px; border-radius: 100px;"></td>
                </tr>

                <!-- Título y check -->
                <tr>
                  <td style="padding-bottom: 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-weight: bold; font-size: 18px; color: #1e40af;">Detalles del turno</td>
                        
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Contenido -->
                <tr>
                  <td style="font-size: 14px; color: #374151;">
                    <p><strong style="color: #6b7280;">Paciente:</strong> ${data.firstName} ${data.lastName}</p>
                    <p><strong style="color: #6b7280;">DNI:</strong> ${data.documentNumber}</p>
                    <p><strong style="color: #6b7280;">Obra Social:</strong> ${data.healthInsurance}</p>
                    <p><strong style="color: #6b7280;">Especialidad:</strong> ${data.specialty}</p>
                    <p><strong style="color: #6b7280;">Médico:</strong> ${data.doctor}</p>
                    <p><strong style="color: #6b7280;">Fecha:</strong> ${format(new Date(data.date), "PPP", { locale: es })}</p>
                    <p><strong style="color: #6b7280;">Hora:</strong> ${data.time}</p>
                    <p><strong style="color: #6b7280;">Contacto:</strong> ${data.phone} | <a href="mailto:${data.email}" style="color: #1d4ed8;">${data.email}</a></p>

                    <p style="text-align: center; margin-top: 24px;">
                      <a href="${cancelUrl}" target="_blank"
                        style="background-color: #e64343; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 14px;">
                        Cancelar turno
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Fuente Montserrat desde Google Fonts -->
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">

      `

      // 1. Verificar si el turno aún está disponible
      const availabilityResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/dateTime/${data.doctorId}/${data.specialtyId}`
      )

      if (!availabilityResponse.ok) {
        throw new Error("No se pudo verificar la disponibilidad del turno.")
      }

      const availableSlots = await availabilityResponse.json()

      const isStillAvailable = availableSlots.some(
        (slot: any) =>
          slot.hora === data.time &&
          slot.fecha === format(new Date(data.date), "yyyy-MM-dd") &&
          slot.agenda === data.agendaId
      )

      if (!isStillAvailable) {
        setError("El turno seleccionado ya no está disponible. Por favor, elija otro.")
        setIsSubmitting(false)
        return
      }

      // 2. Si el turno sigue disponible, hacer el POST de confirmación
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/turno/confirmacion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: data,
          hora: data.time,
          fecha: format(new Date(data.date), "yyyy-MM-dd"),
          orden: -1,
          agenda_id: data.agendaId,
          persona_id: data.personId,
          especialidad_id: data.specialtyId,
          resumen_html: resumenHtml,
          email: data.email
        })
      })

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.statusText}`)
      }

      const result = await response.json()
      setIsSubmitted(true)
    } catch (error) {
      console.error("Error al enviar el formulario:", error)
      setError("El turno seleccionado ya no está disponible. Por favor, elija otro.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="mx-auto bg-gradient-to-r from-green-500 to-green-500 rounded-full p-4 w-20 h-20 flex items-center justify-center shadow-lg">
          <Check className="w-10 h-10 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">¡Turno confirmado!</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Hemos enviado los detalles de su turno a <span className="font-medium text-[#013765]">{data.email}</span>.
            También recibirá un recordatorio por whatsapp al <span className="font-medium text-[#013765]">{data.phone}</span>.
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-50 p-8 rounded-2xl max-w-md mx-auto text-left border border-blue-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-[#013765] text-lg">Detalles del turno</h3>
            <div className="bg-white p-2 rounded-full">
              <ClipboardCheck className="w-5 h-5 text-[#013765]" />
            </div>
          </div>
          <div className="space-y-3">
            {/*<p className="font-medium text-blue-700">
              Número de confirmación:{" "}
              <span className="text-gray-800">{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
            </p>*/}
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
              <span className="font-medium text-gray-800">{format(new Date(data.date), "PPP", { locale: es })}</span>
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
        <div className="bg-gradient-to-br from-blue-50 to-blue-50 px-8 rounded-2xl max-w-md mx-auto text-left border border-blue-100 shadow-sm">
          <div className="rounded-lg p-4">
            <h4 className="font-medium text-[#013765] mb-2">Importante:</h4>
            <ul className="text-black text-sm space-y-1">
              <li>• Preséntese 30 minutos antes del horario asignado <strong>para llevar a cabo la admisión correspondiente</strong>.</li>
              <li>• Para <strong>cancelar</strong> el turno dispondrá de un <strong>boton en el correo recibido</strong>.</li>

            </ul>
          </div>
        </div>
        <Button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-[#013765] to-[#013765] hover:from-blue-800 hover:to-blue-800 text-white px-8 py-3 h-auto rounded-xl shadow-md hover:shadow-lg transition-all duration-200 mt-6"
        >
          Solicitar nuevo turno
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="bg-[#013765] rounded-full p-6 flex-shrink-0">
          <ClipboardCheck className="w-12 h-12 text-white" />
        </div>
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-800">Resumen del turno</h2>
          <p className="text-gray-600">Verifique los datos de su turno antes de confirmar</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-blue-50 rounded-xl p-6 shadow-sm border border-blue-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm text-[#013765]">Obra Social</p>
            <p className="font-medium text-gray-800">{data.healthInsurance}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-[#013765]">Especialidad</p>
            <p className="font-medium text-gray-800">{data.specialty}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-[#013765]">Médico</p>
            <p className="font-medium text-gray-800">{data.doctor}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-[#013765]">Fecha y Hora</p>
            <p className="font-medium text-gray-800">
              {format(new Date(data.date), "PPP", { locale: es })} - {data.time}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-[#013765]">Paciente</p>
            <p className="font-medium text-gray-800">
              {data.firstName} {data.lastName}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-[#013765]">DNI</p>
            <p className="font-medium text-gray-800">{data.documentNumber}</p>
          </div>
          <div className="md:col-span-2 space-y-1">
            <p className="text-sm text-[#013765]">Email</p>
            <p className="font-medium text-gray-800">{data.email}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-[#013765]">Celular</p>
            <p className="font-medium text-gray-800">{data.phone}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-black p-4 rounded-lg border border-rose-200 space-y-2 text-center">
          <div>{error}</div>
          {error === "El turno seleccionado ya no está disponible. Por favor, elija otro." && (
            <div className="flex flex-row justify-center gap-2">
              <button
                onClick={() => setStep(4)}

                className="mt-2 px-4 py-2 bg-[#013765] text-white rounded-xl hover:bg-blue-800 transition flex flex-row items-center space-x-2 gap-2"
              ><CalendarSync />
                Seleccionar otra fecha/hora.
              </button>
            </div>

          )}
        </div>
      )}

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
          disabled={isSubmitting || error}
          className="bg-gradient-to-r from-[#013765] to-[#013765] hover:from-[#013765] hover:to-[#013765] text-white px-8 py-3 h-auto rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              Registrando turno...
            </span>
          ) : (
            "Confirmar turno"
          )}
        </Button>
      </div>
    </form>
  )
}
