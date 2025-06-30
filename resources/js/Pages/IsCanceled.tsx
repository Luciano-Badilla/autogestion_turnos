"use client"

import { useState } from "react"
import { format, parseISO } from 'date-fns';
import { Calendar, Loader2 } from "lucide-react"


export default function CancelSuccessful({ datos }) {


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center space-y-8 py-8">
          <div className="mx-auto bg-gradient-to-r from-blue-400 to-blue-400 rounded-full p-4 w-20 h-20 flex items-center justify-center shadow-lg">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Este turno ya esta cancelado
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Este turno ya fue cancelado previamente.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl max-w-md mx-auto text-left border border-blue-100 shadow-sm">
            <h3 className="font-bold text-blue-800 text-lg mb-4">Turno cancelado</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Paciente:</span> <span className="font-medium text-gray-800">{datos?.nombre + ' ' + datos?.apellido}</span></p>
              <p><span className="text-gray-500">DNI:</span> <span className="font-medium text-gray-800">{datos?.dni}</span></p>
              <p><span className="text-gray-500">Obra Social:</span> <span className="font-medium text-gray-800">{datos?.obra_social}</span></p>
              <p><span className="text-gray-500">Especialidad:</span> <span className="font-medium text-gray-800">{datos?.especialidad}</span></p>
              <p><span className="text-gray-500">Médico:</span> <span className="font-medium text-gray-800">{datos?.medico}</span></p>
              <p><span className="text-gray-500">Fecha:</span> <span className="font-medium text-gray-800">{format(parseISO(datos.fecha), 'dd/MM/yyyy')}</span></p>
              <p><span className="text-gray-500">Hora:</span> <span className="font-medium text-gray-800">{datos?.hora}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
