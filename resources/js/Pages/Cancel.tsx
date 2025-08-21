"use client"

import { useState } from "react"
import { Button } from "shadcn/components/ui/button"
import { format, parseISO } from 'date-fns';
import { es } from "date-fns/locale"
import { Calendar, Loader2 } from "lucide-react"

export default function CancelSuccessful({ datos, onCancel, onConfirmed }) {
  // estado para saber si ya confirmó la cancelación
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)

  const cancelacionHtml = `
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="500"
          style="background-color: #fef2f2; padding: 48px; border: 1px solid #fecaca; font-family: 'Montserrat', Arial, sans-serif; text-align: left;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 16px;">
              <img src="https://i.imgur.com/Z3HOZfr.png" alt="Logo" style="max-height: 90px;" />
            </td>
          </tr>

          <!-- Línea separadora -->
          <tr>
            <td style="border-top: 5px solid #fecaca; padding-top: 16px; padding-bottom: 16px; border-radius: 100px;"></td>
          </tr>

          <!-- Título y X -->
          <tr>
            <td style="padding-bottom: 16px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-weight: bold; font-size: 18px; color: #b91c1c;">Turno cancelado</td>
                  
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contenido -->
          <tr>
            <td style="font-size: 14px; color: #374151;">
              <p><strong style="color: #6b7280;">Paciente:</strong> ${datos.nombre} ${datos.apellido}</p>
              <p><strong style="color: #6b7280;">DNI:</strong> ${datos.dni}</p>
              <p><strong style="color: #6b7280;">Obra Social:</strong> ${datos.obra_social}</p>
              <p><strong style="color: #6b7280;">Especialidad:</strong> ${datos.especialidad}</p>
              <p><strong style="color: #6b7280;">Médico:</strong> ${datos.medico}</p>
              <p><strong style="color: #6b7280;">Fecha:</strong> ${format(new Date(datos.fecha), "PPP", { locale: es })}</p>
              <p><strong style="color: #6b7280;">Hora:</strong> ${datos.hora}</p>
              <p>
                <strong style="color: #6b7280;">Contacto:</strong>
                ${datos.telefono} | <a href="mailto:${datos.email}" style="color: #1d4ed8;">${datos.email}</a>
              </p>

              <p style="margin-top: 24px; color: #991b1b; font-weight: bold; text-align: center;">
                Este turno ha sido cancelado correctamente.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- Fuente Montserrat desde Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
`;



  // función para confirmar la cancelación
  const handleConfirm = async () => {
    setLoading(true)
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/api/put/turno/${datos.id}`
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cancelacionHtml: cancelacionHtml,
          email: datos.email
        })
      })
      setConfirmed(true)
    } finally {
      setLoading(false)
    }
  }


  if (!confirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center space-y-8 py-8">
            <div className="mx-auto bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full p-4 w-20 h-20 flex items-center justify-center shadow-lg">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">¿Está seguro que desea cancelar este turno?</h2>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Revise los datos y confirme la cancelación.
              </p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl max-w-md mx-auto text-left border border-yellow-200 shadow-sm">
              <h3 className="font-bold text-yellow-800 text-lg mb-4">Detalles del turno</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Paciente:</span>{" "} <span className="font-medium text-gray-800">{datos?.nombre + ' ' + datos?.apellido}</span></p>
                <p><span className="text-gray-500">DNI:</span>{" "} <span className="font-medium text-gray-800">{datos?.dni}</span></p>
                <p><span className="text-gray-500">Obra Social:</span>{" "} <span className="font-medium text-gray-800">{datos?.obra_social}</span></p>
                <p><span className="text-gray-500">Especialidad:</span>{" "} <span className="font-medium text-gray-800">{datos?.especialidad}</span></p>
                <p><span className="text-gray-500">Médico:</span>{" "} <span className="font-medium text-gray-800">{datos?.medico}</span></p>
                <p><span className="text-gray-500">Fecha:</span>{" "} <span className="font-medium text-gray-800">{format(parseISO(datos.fecha), 'dd/MM/yyyy')}</span></p>
                <p><span className="text-gray-500">Hora:</span>{" "} <span className="font-medium text-gray-800">{datos?.hora}</span></p>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-6">
              <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={handleConfirm}>
                Confirmar Cancelación{loading && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Vista cuando ya confirmó la cancelación:
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center space-y-8 py-8">
          <div className="mx-auto bg-gradient-to-r from-blue-400 to-blue-400 rounded-full p-4 w-20 h-20 flex items-center justify-center shadow-lg">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">¡Turno cancelado exitosamente!</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Su turno ha sido cancelado correctamente.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl max-w-md mx-auto text-left border border-blue-100 shadow-sm">
            <h3 className="font-bold text-blue-800 text-lg mb-4">Turno cancelado</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Paciente:</span>{" "} <span className="font-medium text-gray-800">{datos?.nombre + ' ' + datos?.apellido}</span></p>
              <p><span className="text-gray-500">DNI:</span>{" "} <span className="font-medium text-gray-800">{datos?.dni}</span></p>
              <p><span className="text-gray-500">Obra Social:</span>{" "} <span className="font-medium text-gray-800">{datos?.obra_social}</span></p>
              <p><span className="text-gray-500">Especialidad:</span>{" "} <span className="font-medium text-gray-800">{datos?.especialidad}</span></p>
              <p><span className="text-gray-500">Médico:</span>{" "} <span className="font-medium text-gray-800">{datos?.medico}</span></p>
              <p><span className="text-gray-500">Fecha:</span>{" "} <span className="font-medium text-gray-800">{format(parseISO(datos.fecha), 'dd/MM/yyyy')}</span></p>
              <p><span className="text-gray-500">Hora:</span>{" "} <span className="font-medium text-gray-800">{datos?.hora}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
