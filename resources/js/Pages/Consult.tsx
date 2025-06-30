"use client"

import { useState } from "react"
import { Button } from "shadcn/components/ui/button"
import { Input } from "shadcn/components/ui/input"
import { Label } from "shadcn/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "shadcn/components/ui/card"
import { Badge } from "shadcn/components/ui/badge"
import { AlertTriangle, Calendar, Clock, MapPin, Phone, Search, User, X } from "lucide-react"

interface ConsultAppointmentProps {
  onBack: () => void
}

// Datos simulados de turnos con más información
const mockAppointments = [
  {
    id: "APT001",
    patientName: "Juan Pérez",
    dni: "12345678",
    specialty: "Cardiología",
    doctor: "Dr. Juan Pérez",
    date: "2024-01-15",
    time: "10:00",
    healthInsurance: "OSDE",
    status: "confirmado",
    location: "Consultorio 205, 2do Piso",
    address: "Av. Corrientes 1234, CABA",
    phone: "011-4567-8900",
    instructions: "Concurrir en ayunas. Traer estudios previos si los tiene.",
    createdAt: "2024-01-10",
  },
  {
    id: "APT002",
    patientName: "María González",
    dni: "87654321",
    specialty: "Dermatología",
    doctor: "Dra. Ana Martínez",
    date: "2024-01-16",
    time: "14:30",
    healthInsurance: "Swiss Medical",
    status: "confirmado",
    location: "Consultorio 108, Planta Baja",
    address: "Av. Santa Fe 5678, CABA",
    phone: "011-4567-8901",
    instructions: "No aplicar cremas ni maquillaje en la zona a examinar.",
    createdAt: "2024-01-12",
  },
  {
    id: "APT003",
    patientName: "Carlos Rodríguez",
    dni: "11223344",
    specialty: "Neurología",
    doctor: "Dr. Fernando Ortiz",
    date: "2024-01-17",
    time: "09:15",
    healthInsurance: "Galeno",
    status: "pendiente",
    location: "Consultorio 301, 3er Piso",
    address: "Av. Rivadavia 9876, CABA",
    phone: "011-4567-8902",
    instructions: "Traer lista de medicamentos actuales y estudios neurológicos previos.",
    createdAt: "2024-01-13",
  },
]

export default function ConsultAppointment({ onBack }: ConsultAppointmentProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState<"dni" | "confirmation">("dni")
  const [foundAppointments, setFoundAppointments] = useState<typeof mockAppointments>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setIsSearching(true)
    // Simular búsqueda en la base de datos
    await new Promise((resolve) => setTimeout(resolve, 1000))

    let results: typeof mockAppointments = []

    if (searchType === "dni") {
      results = mockAppointments.filter((apt) => apt.dni.includes(searchTerm))
    } else {
      results = mockAppointments.filter((apt) => apt.id.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    setFoundAppointments(results)
    setIsSearching(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmado":
        return "bg-green-100 text-green-800"
      case "pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "cancelado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmado":
        return "Confirmado"
      case "pendiente":
        return "Pendiente de confirmación"
      case "cancelado":
        return "Cancelado"
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-800 mb-2">Consultar Turno</h1>
          </div>
          
        </div>

        {/* Búsqueda */}
        <Card className="mb-8 shadow-lg border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Search className="w-6 h-6" />
              Buscar Turno
            </CardTitle>
            <CardDescription>Ingrese su DNI o número de confirmación para consultar su turno</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={() => setSearchType("dni")}
                  className={`flex-1 border border-blue-100 ${searchType === "dni" ? "bg-blue-500 text-white" : "bg-blue-50 text-blue-800"}`}
                >
                  Buscar por DNI
                </Button>
                <Button
                  onClick={() => setSearchType("confirmation")}
                  className={`flex-1  border border-blue-100 ${searchType === "confirmation" ? "bg-blue-500 text-white" : "bg-blue-50 text-blue-800"}`}
                >
                  Buscar por Nº Confirmación
                </Button>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search" className="text-gray-700">
                    {searchType === "dni" ? "Número de DNI" : "Número de Confirmación"}
                  </Label>
                  <Input
                    id="search"
                    placeholder={searchType === "dni" ? "Ej: 12345678" : "Ej: APT001"}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSearch()
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !searchTerm.trim()}
                  className="bg-blue-500 hover:bg-blue-600 text-white h-12 px-6 mt-6"
                >
                  {isSearching ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      Buscando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Buscar
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        {foundAppointments.length > 0 && (
          <div className="space-y-6">
            {foundAppointments.map((appointment) => (
              <Card key={appointment.id} className="shadow-lg border-blue-100">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-blue-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Turno #{appointment.id}
                      </CardTitle>
                      <CardDescription>Solicitado el {formatDate(appointment.createdAt)}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>{getStatusText(appointment.status)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Información del paciente y turno */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Información del Paciente
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="text-gray-500">Nombre:</span>{" "}
                            <span className="font-medium">{appointment.patientName}</span>
                          </p>
                          <p>
                            <span className="text-gray-500">DNI:</span>{" "}
                            <span className="font-medium">{appointment.dni}</span>
                          </p>
                          <p>
                            <span className="text-gray-500">Obra Social:</span>{" "}
                            <span className="font-medium">{appointment.healthInsurance}</span>
                          </p>
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Detalles del Turno
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="text-blue-600">Especialidad:</span>{" "}
                            <span className="font-medium text-blue-800">{appointment.specialty}</span>
                          </p>
                          <p>
                            <span className="text-blue-600">Médico:</span>{" "}
                            <span className="font-medium text-blue-800">{appointment.doctor}</span>
                          </p>
                          <p>
                            <span className="text-blue-600">Fecha:</span>{" "}
                            <span className="font-medium text-blue-800">{formatDate(appointment.date)}</span>
                          </p>
                          <p>
                            <span className="text-blue-600">Hora:</span>{" "}
                            <span className="font-medium text-blue-800">{appointment.time}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Información de ubicación e instrucciones */}
                    <div className="space-y-4">
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Ubicación
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="text-green-600">Consultorio:</span>{" "}
                            <span className="font-medium text-green-800">{appointment.location}</span>
                          </p>
                          <p>
                            <span className="text-green-600">Dirección:</span>{" "}
                            <span className="font-medium text-green-800">{appointment.address}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-green-800">{appointment.phone}</span>
                          </p>
                        </div>
                      </div>

                      <div className="bg-amber-50 rounded-lg p-4">
                        <h4 className="font-medium text-amber-800 mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Instrucciones Importantes
                        </h4>
                        <p className="text-sm text-amber-700">{appointment.instructions}</p>
                      </div>
                    </div>
                  </div>

                  {/* Recordatorios */}
                  <div className="mt-6 bg-blue-100 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">Recordatorios:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Llegue 15 minutos antes de su turno</li>
                      <li>• Traiga su DNI y credencial de obra social</li>
                      <li>• Si no puede asistir, cancele con 24hs de anticipación</li>
                      <li>• En caso de síntomas de COVID-19, reprograme su turno</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Mensaje cuando no se encuentran resultados */}
        {foundAppointments.length === 0 && searchTerm && !isSearching && (
          <Card className="shadow-lg border-amber-200 bg-amber-50">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-amber-800 mb-2">No se encontraron turnos</h3>
              <p className="text-amber-700">
                No se encontraron turnos con los datos ingresados. Verifique la información e intente nuevamente.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
