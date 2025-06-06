"use client"

import { useState, useEffect } from "react"
import { Button } from "shadcn/components/ui/button"
import { Switch } from "shadcn/components/ui/switch"
import { Toaster } from "sonner";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "shadcn/components/ui/card"
import { Badge } from "shadcn/components/ui/badge"
import {
  ChevronDown,
  ChevronRight,
  Shield,
  Stethoscope,
  UserRound,
  UserCog,
  Loader2,
} from "lucide-react"

export default function AdminPanel({ config }: { config: Record<string, any[]> }) {
  const [healthInsurances, setHealthInsurances] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [openSpecialties, setOpenSpecialties] = useState<number[]>([])
  const [loadingDoctors, setLoadingDoctors] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [searchHealthInsurance, setSearchHealthInsurance] = useState("")
  const [searchSpecialty, setSearchSpecialty] = useState("")
  const [showOnlyEnabledInsurances, setShowOnlyEnabledInsurances] = useState(false)
  const [showOnlyEnabledSpecialties, setShowOnlyEnabledSpecialties] = useState(false)

  const sortDoctors = (doctors: any[]) =>
    [...doctors].sort((a, b) => {
      const nameA = `${a.apellidos ?? ""} ${a.nombres ?? ""}`.toLowerCase()
      const nameB = `${b.apellidos ?? ""} ${b.nombres ?? ""}`.toLowerCase()
      return nameA.localeCompare(nameB)
    })

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [insurancesRes, specialtiesRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/healthinsurances`),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/specialties`),
        ])
        const healthInsurancesData = await insurancesRes.json()
        const specialtiesData = await specialtiesRes.json()

        const enabledInsuranceIds = config?.health_insurance?.map(i => i.value) || []
        const enabledSpecialties = config?.specialty?.map(s => ({
          id: s.value,
          doctors: s.meta?.doctors || [],
        })) || []

        const updatedInsurances = healthInsurancesData.map(i => ({
          ...i,
          enabled: enabledInsuranceIds.includes(i.id),
        }))

        const updatedSpecialties = specialtiesData.map(s => {
          const match = enabledSpecialties.find(es => es.id === s.id)
          return {
            ...s,
            enabled: !!match,
            doctors: match
              ? sortDoctors(match.doctors.map(id => ({ id, enabled: true })))
              : [],
          }
        })

        setHealthInsurances(updatedInsurances)
        setSpecialties(updatedSpecialties)
      } catch (error) {
        console.error("Error al cargar los datos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const toggleHealthInsurance = (id: number) => {
    setHealthInsurances(prev =>
      prev.map(insurance =>
        insurance.id === id ? { ...insurance, enabled: !insurance.enabled } : insurance
      )
    )
  }

  const toggleSpecialty = (id: number) => {
    setSpecialties(prev =>
      prev.map(specialty =>
        specialty.id === id ? { ...specialty, enabled: !specialty.enabled } : specialty
      )
    )
  }

  const toggleDoctor = (specialtyId: number, doctorId: number) => {
    setSpecialties(prev =>
      prev.map(specialty =>
        specialty.id === specialtyId
          ? {
            ...specialty,
            doctors: sortDoctors(
              specialty.doctors.map(doctor =>
                doctor.id === doctorId ? { ...doctor, enabled: !doctor.enabled } : doctor
              )
            ),
          }
          : specialty
      )
    )
  }

  const toggleSpecialtyCollapse = async (specialtyId: number) => {
    const alreadyOpen = openSpecialties.includes(specialtyId)

    setOpenSpecialties(prev =>
      alreadyOpen ? prev.filter(id => id !== specialtyId) : [...prev, specialtyId]
    )

    if (!alreadyOpen) {
      const specialty = specialties.find(s => s.id === specialtyId)
      if (specialty && specialty.doctors.length === 0) {
        setLoadingDoctors(prev => [...prev, specialtyId])
        try {
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/doctors/${specialtyId}`)
          const doctors = await res.json()

          const savedDoctors = config?.doctor?.map(d => Number(d.value)) ?? []

          setSpecialties(prev =>
            prev.map(s =>
              s.id === specialtyId
                ? {
                  ...s,
                  doctors: sortDoctors(
                    doctors
                      .filter(d => d && typeof d === "object" && "apellidos" in d && "nombres" in d)
                      .map(d => ({
                        ...d,
                        enabled: savedDoctors.includes(d.id),
                      }))
                  ),
                }
                : s
            )
          )
        } catch (err) {
          console.error("Error cargando médicos:", err)
        } finally {
          setLoadingDoctors(prev => prev.filter(id => id !== specialtyId))
        }
      }
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const selectedHealthInsurances = healthInsurances.filter(i => i.enabled)
      const selectedSpecialties = specialties
        .filter(s => s.enabled)
        .map(s => ({
          id: s.id,
          doctors: s.doctors.filter(d => d.enabled).map(d => d.id),
        }))

      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/sync/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          healthInsurances: selectedHealthInsurances.map(h => h.id),
          specialties: selectedSpecialties,
        }),
      })

      toast.success("Configuración guardada exitosamente");

    } catch (error) {
      alert("Error al guardar la configuración")
    } finally {
      setIsSaving(false)
    }
  }

  const getEnabledCount = (items: { enabled: boolean }[]) => items.filter(i => i.enabled).length

  const normalizeText = (text: string) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()

  const filteredHealthInsurances = healthInsurances
    .filter(i => normalizeText(i.nombre).includes(normalizeText(searchHealthInsurance)))
    .filter(i => (showOnlyEnabledInsurances ? i.enabled : true))

  const filteredSpecialties = specialties
    .filter(s => normalizeText(s.nombre).includes(normalizeText(searchSpecialty)))
    .filter(s => (showOnlyEnabledSpecialties ? s.enabled : true))

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-800 mb-2 flex items-center justify-center gap-3">
            <UserCog className="w-10 h-10" /> Panel de Administración
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[75vh]">
          {/* Obras Sociales */}
          <Card className="shadow-lg border-blue-100 flex flex-col h-[75vh]">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Shield className="w-6 h-6" /> Obras Sociales
                </CardTitle>
                <div className="mt-2 flex items-center gap-2">
                  <Switch
                    checked={showOnlyEnabledInsurances}
                    onCheckedChange={setShowOnlyEnabledInsurances}
                  />
                  <span className="text-sm font-semibold text-gray-700">Mostrar solo activas</span>
                </div>
              </div>
              <CardDescription className="font-semibold">
                Seleccione las obras sociales disponibles cuando un paciente nuevo se registre.
              </CardDescription>
              <Badge variant="secondary" className="w-fit bg-gray-200">
                {getEnabledCount(healthInsurances)} de {healthInsurances.length} activas
              </Badge>

            </CardHeader>
            <div className="px-6 pt-4">
              <input
                type="text"
                placeholder="Buscar obra social..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={searchHealthInsurance}
                onChange={e => setSearchHealthInsurance(e.target.value)}
              />
            </div>
            <CardContent className="p-6 space-y-4 overflow-auto">
              {filteredHealthInsurances.length > 0 ? (
                filteredHealthInsurances.map(insurance => (
                  <div
                    key={insurance.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-200"
                  >
                    <span className="font-medium text-gray-800">{insurance.nombre}</span>
                    <Switch
                      checked={insurance.enabled}
                      onCheckedChange={() => toggleHealthInsurance(insurance.id)}
                    />
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400">No se encontraron obras sociales.</p>
              )}
            </CardContent>
          </Card>

          {/* Especialidades */}
          <Card className="shadow-lg border-blue-100 flex flex-col h-[75vh]">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Stethoscope className="w-6 h-6" /> Especialidades
                </CardTitle>
                <div className="mt-2 flex items-center gap-2">
                  <Switch
                    checked={showOnlyEnabledSpecialties}
                    onCheckedChange={setShowOnlyEnabledSpecialties}
                  />
                  <span className="text-sm font-semibold text-gray-700">Mostrar solo activas</span>
                </div>
              </div>
              <CardDescription className="font-semibold">
                Seleccione las especialidades médicas y médicos habilitados.
              </CardDescription>
              <Badge variant="secondary" className="w-fit bg-gray-200">
                {getEnabledCount(specialties)} de {specialties.length} activas
              </Badge>

            </CardHeader>
            <div className="px-6 pt-4">
              <input
                type="text"
                placeholder="Buscar especialidad..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={searchSpecialty}
                onChange={e => setSearchSpecialty(e.target.value)}
              />
            </div>
            <CardContent className="p-6 space-y-4 overflow-auto">
              {filteredSpecialties.length > 0 ? (
                filteredSpecialties.map(specialty => (
                  <div key={specialty.id} className="border border-gray-200 rounded-md">
                    <button
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-200 rounded-t-md"
                      onClick={() => toggleSpecialtyCollapse(specialty.id)}
                    >
                      <div className="flex items-center gap-2">
                        {openSpecialties.includes(specialty.id) ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                        <span className="font-semibold text-gray-800">{specialty.nombre}</span>
                      </div>
                      <Switch
                        checked={specialty.enabled}
                        onCheckedChange={() => toggleSpecialty(specialty.id)}
                        onClick={e => e.stopPropagation()}
                      />
                    </button>

                    {openSpecialties.includes(specialty.id) && (
                      <div className="p-3 space-y-2 border-t border-gray-300 overflow-auto">
                        {loadingDoctors.includes(specialty.id) ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                            <span className="ml-2 text-blue-600">Cargando médicos...</span>
                          </div>
                        ) : specialty.doctors.length > 0 ? (
                          specialty.doctors.map(doctor => (
                            <div
                              key={doctor.id}
                              className="flex items-center justify-between p-2 border border-gray-200 rounded-md hover:bg-gray-50"
                            >
                              <div className="flex items-center gap-2">
                                <UserRound className="w-5 h-5 text-gray-500" />
                                <span>{`${doctor.apellidos ?? ""} ${doctor.nombres ?? ""}`}</span>
                              </div>
                              <Switch
                                checked={doctor.enabled}
                                onCheckedChange={() => toggleDoctor(specialty.id, doctor.id)}
                              />
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-gray-400">
                            No hay médicos para esta especialidad.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400">No se encontraron especialidades.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            className="bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white px-8 py-3 h-auto rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Configuración"
            )}
          </Button>
        </div>
      </div>
      <Toaster richColors position="top-center" />
    </div>
  )
}
