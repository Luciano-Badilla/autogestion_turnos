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
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "shadcn/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "shadcn/components/ui/popover"
import { Check, ChevronsUpDown, LogOut } from "lucide-react"


export default function AdminPanel({ config, user_role, user_role_name }: { config: Record<string, any[]>, user_role: number, user_role_name: string }) {
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
  const [doctorAcceptedInsurances, setDoctorAcceptedInsurances] = useState<Record<number, number[]>>({})
  const [openHealthInsurances, setOpenHealthInsurances] = useState<number[]>([]);
  const [loadingPlans, setLoadingPlans] = useState<number[]>([]);
  const [healthInsurancePlans, setHealthInsurancePlans] = useState<{ [key: number]: string[] }>({});
  const [enabledPlans, setEnabledPlans] = useState<{ [healthInsuranceId: number]: number[] }>({})
  const [activeDoctorConfigs, setActiveDoctorConfigs] = useState([]);
  const [activePlanConfigs, setActivePlanConfigs] = useState([]);


  /*useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/enabled-doctors-all`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(setActiveDoctorConfigs)
      .catch(console.error);
  }, []);*/

  const sortDoctors = (doctors: any[]) =>
    [...doctors].sort((a, b) => {
      const nameA = `${a.apellidos ?? ""} ${a.nombres ?? ""}`.toLowerCase()
      const nameB = `${b.apellidos ?? ""} ${b.nombres ?? ""}`.toLowerCase()
      return nameA.localeCompare(nameB)
    })


  const toggleHealthInsuranceCollapse = async (id: number) => {
    const isOpen = openHealthInsurances.includes(id);

    if (isOpen) {
      setOpenHealthInsurances(prev => prev.filter(openId => openId !== id));
    } else {
      setOpenHealthInsurances(prev => [...prev, id]);

      if (!healthInsurancePlans[id]) {
        setLoadingPlans(prev => [...prev, id]);

        try {
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/planes/${id}`); // <-- async/await permitidos porque la función es async
          const data = await res.json();
          setHealthInsurancePlans(prev => ({ ...prev, [id]: data }));

          setEnabledPlans(prev => {
            if (prev[id]) return prev; // ya está seteado
            const enabledFromConfig = config?.plan
              ?.find(hp => hp.health_insurance_id === id)
              ?.plans?.map(p => p.id) || [];

            return {
              ...prev,
              [id]: enabledFromConfig
            };
          });

        } catch (error) {
          console.error("Error cargando planes", error);
        } finally {
          setLoadingPlans(prev => prev.filter(pid => pid !== id));
        }
      }
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [
          insurancesRes,
          specialtiesRes,
          activeDoctorsRes,
          activePlansRes
        ] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/healthinsurances`),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/specialties`),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/enabled-doctors-all`, {
            credentials: "include"
          }),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/enabled-plans-all`, {
            credentials: "include"
          }),
        ])

        const healthInsurancesData = await insurancesRes.json()
        const specialtiesData = await specialtiesRes.json()
        const activeDoctorsData = await activeDoctorsRes.json()
        const activePlansData = await activePlansRes.json()

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

        // Guardar médicos activos devueltos por API
        setActiveDoctorConfigs(activeDoctorsData.data || {})

        // Guardar planes activos devueltos por API
        setActivePlanConfigs(activePlansData.data || {})

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



  /*useEffect(() => {
    if (specialties.length === 0 || activeDoctorConfigs.length === 0) return

    const updated = specialties.map(specialty => {
      const activeForThisSpecialty = activeDoctorConfigs.filter(
        d => Number(d.specialty_id) === specialty.id
      )

      const newDoctors = activeForThisSpecialty.map(d => ({
        id: Number(d.doctor_id),
        name: "", // Podés completar si lo necesitás
        enabled: true,
      }))

      const existingDoctorIds = new Set(specialty.doctors.map(d => d.id))
      const mergedDoctors = [
        ...specialty.doctors,
        ...newDoctors.filter(d => !existingDoctorIds.has(d.id)),
      ]

      return {
        ...specialty,
        doctors: sortDoctors(mergedDoctors),
      }
    })

    setSpecialties(updated)
  }, [activeDoctorConfigs, specialties.length])*/


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

    // Si lo desactivo, también lo quitamos de activeDoctorConfigs
    setActiveDoctorConfigs(prev => {
      const updated = { ...prev }
      if (updated[specialtyId]) {
        updated[specialtyId] = updated[specialtyId].filter(d => d.doctor_id !== doctorId)
        if (updated[specialtyId].length === 0) {
          delete updated[specialtyId]
        }
      }
      return updated
    })
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

          setDoctorAcceptedInsurances(prev => {
            const copy = { ...prev }
            doctors.forEach(d => {
              const doctorId = d.id
              const accepted = config?.doctor_insurance
                ?.filter(i => Number(i.parent_id) === doctorId)
                ?.map(i => Number(i.reference_id)) ?? []
              copy[doctorId] = accepted
            })
            return copy
          })

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

      // especialidades habilitadas
      const enabledSpecialtyIds = new Set(
        specialties.filter(s => s.enabled).map(s => s.id)
      )

      // armo specialties -> SOLO habilitadas (como ya lo tenías)
      let selectedSpecialties = specialties
        .filter(s => s.enabled)
        .map(s => ({
          id: s.id,
          doctors: s.doctors
            .filter(d => d.enabled)
            .map(d => ({
              id: d.id,
              acceptedInsurances: doctorAcceptedInsurances[d.id] || [],
            })),
        }))

      // mergeo médicos activos desde la API UNICAMENTE si la especialidad está habilitada
      Object.entries(activeDoctorConfigs || {}).forEach(([specialtyId, doctors]) => {
        const specId = Number(specialtyId)
        if (!enabledSpecialtyIds.has(specId)) return

        const i = selectedSpecialties.findIndex(s => s.id === specId)
        if (i >= 0) {
          doctors.forEach(doc => {
            if (!selectedSpecialties[i].doctors.some(d => d.id === doc.doctor_id)) {
              selectedSpecialties[i].doctors.push({
                id: doc.doctor_id,
                acceptedInsurances: doctorAcceptedInsurances[doc.doctor_id] || [],
              })
            }
          })
        } else {
          selectedSpecialties.push({
            id: specId,
            doctors: doctors.map(doc => ({
              id: doc.doctor_id,
              acceptedInsurances: doctorAcceptedInsurances[doc.doctor_id] || [],
            })),
          })
        }
      })

      // === EXTRA: doctores de especialidades DESACTIVADAS que deben mantenerse activos ===
      const extraDoctors = Object.entries(activeDoctorConfigs || {})
        .filter(([specialtyId]) => !enabledSpecialtyIds.has(Number(specialtyId)))
        .map(([specialtyId, doctors]) => ({
          specialty_id: Number(specialtyId),
          doctors: doctors.map((doc: any) => ({
            id: doc.doctor_id,
            acceptedInsurances: doctorAcceptedInsurances[doc.doctor_id] || [],
          })),
        }))

      // --- PLANES (igual que antes) ---
      let selectedPlans = { ...enabledPlans }
      Object.entries(activePlanConfigs || {}).forEach(([insuranceId, plans]) => {
        const insId = Number(insuranceId)
        if (!selectedPlans[insId]) selectedPlans[insId] = []
        plans.forEach((plan: any) => {
          if (!selectedPlans[insId].includes(plan.plan_id)) {
            selectedPlans[insId].push(plan.plan_id)
          }
        })
      })

      await fetch(`${import.meta.env.VITE_API_BASE_URL}/sanctum/csrf-cookie`, {
        credentials: "include",
      })

      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/sync/save`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_role,
          healthInsurances: selectedHealthInsurances.map(h => h.id),
          specialties: selectedSpecialties, // <-- SOLO las habilitadas
          extraDoctors,                     // <-- NUEVO: doctores de especialidades deshabilitadas
          healthInsurancePlans: Object.entries(selectedPlans).map(([healthInsuranceId, plans]) => ({
            health_insurance_id: Number(healthInsuranceId),
            plans: (plans as number[]).map(planId => ({ id: planId })),
          })),
        }),
      })

      toast.success("Configuración guardada exitosamente")
    } catch (e) {
      alert("Error al guardar la configuración")
    } finally {
      setIsSaving(false)
    }
  }



  const handleImageUpload = async (
    e,
    specialtyId,
    doctorId
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("imagen", file)

    try {
      const res = await fetch(`${import.meta.env.VITE_APP_URL}/api/doctors/${doctorId}/upload-image`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Error al subir la imagen")
      const updatedDoctor = await res.json()

      // Actualizá la imagen en la UI
      setSpecialties(prev =>
        prev.map(s =>
          s.id === specialtyId
            ? {
              ...s,
              doctors: s.doctors.map(d =>
                d.id === doctorId ? { ...d, imagen_url: updatedDoctor.imagen_url } : d
              ),
            }
            : s
        )
      )

      toast.success("Imagen actualizada correctamente")
    } catch (err) {
      console.error(err)
      toast.error("Hubo un problema al subir la imagen")
    }
  }

  const role = (roles: Array) => {
    return roles.includes(user_role);
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

  const logout = () => {
    window.location.href = `${import.meta.env.VITE_APP_URL}/logout`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-800 mb-2 flex items-center justify-center gap-3">
            <UserCog className="w-10 h-10" /> Panel de Administración - Rol: {user_role_name}
          </h1>
          <Button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 h-auto rounded-xl shadow-md hover:shadow-lg transition-all duration-200" onClick={logout}>
            <LogOut className="w-6 h-6" />
            Cerrar sesión
          </Button>
        </div>

        <div className="flex flex-row gap-8 min-h-[75vh] w-full">
          { /* Obras Sociales */}
          {role([1, 3]) && (

            <Card className="shadow-lg border-blue-100 flex flex-col h-[75vh] w-full">
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
                    <div key={insurance.id} className="border border-gray-200 rounded-md">
                      <button
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-200 rounded-t-md"
                        onClick={() => toggleHealthInsuranceCollapse(insurance.id)}
                      >
                        <div className="flex items-center gap-2">
                          {openHealthInsurances.includes(insurance.id) ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                          <span className="font-semibold text-gray-800">{insurance.nombre}</span>
                        </div>
                        <Switch
                          checked={insurance.enabled}
                          onCheckedChange={() => toggleHealthInsurance(insurance.id)}
                          onClick={e => e.stopPropagation()}
                          disabled={!role([1, 3])}
                        />
                      </button>

                      {openHealthInsurances.includes(insurance.id) && (
                        <div className="p-3 space-y-2 border-t border-gray-300 overflow-auto">
                          {loadingPlans.includes(insurance.id) ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                              <span className="ml-2 text-blue-600">Cargando planes...</span>
                            </div>
                          ) : healthInsurancePlans[insurance.id]?.length > 0 ? (
                            <ul className="list-disc list-inside text-gray-700 space-y-1">
                              {healthInsurancePlans[insurance.id].map((plan: { id: number; nombre: string }) => {
                                const isEnabled = enabledPlans[insurance.id]?.includes(plan.id)
                                return (
                                  <li key={plan.id} className="flex items-center justify-between px-2 gap-2">
                                    <span>{plan.nombre}</span>
                                    <Switch
                                      checked={isEnabled}
                                      disabled={!role([1, 3])}
                                      onCheckedChange={() => {
                                        setEnabledPlans(prev => {
                                          const currentPlans = prev[insurance.id] || []

                                          if (isEnabled) {
                                            // Desactivar plan: lo quitamos de enabledPlans y también de activePlanConfigs
                                            // Actualizamos enabledPlans:
                                            const newEnabledPlans = {
                                              ...prev,
                                              [insurance.id]: currentPlans.filter(pid => pid !== plan.id),
                                            }
                                            // Actualizamos activePlanConfigs para que no tenga ese plan
                                            setActivePlanConfigs(prevActive => {
                                              if (!prevActive) return prevActive
                                              const plansForIns = prevActive[insurance.id] || []
                                              return {
                                                ...prevActive,
                                                [insurance.id]: plansForIns.filter(p => p.plan_id !== plan.id),
                                              }
                                            })
                                            return newEnabledPlans

                                          } else {
                                            // Activar plan: agregamos al enabledPlans, y dejamos activePlanConfigs intacto (si querés podés sincronizar)
                                            return {
                                              ...prev,
                                              [insurance.id]: [...currentPlans, plan.id],
                                            }
                                          }
                                        })
                                      }}
                                    />

                                  </li>
                                )
                              })}
                            </ul>
                          ) : (
                            <p className="text-center text-gray-400">No hay planes disponibles.</p>
                          )}
                        </div>
                      )}
                    </div>

                  ))
                ) : (
                  <p className="text-center text-gray-400">No se encontraron obras sociales.</p>
                )}
              </CardContent>
            </Card>
          )}


          {/* Especialidades */}
          {role([1, 2, 4]) && (<Card className="shadow-lg border-blue-100 flex flex-col h-[75vh] w-full">
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
                        disabled={!role([1, 4])}
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
                            <div key={doctor.id} className="mb-2 border border-gray-250 bg-gray-50 p-1 rounded-lg">
                              <div className="flex items-center justify-between p-2 border border-gray-200 rounded-md hover:bg-gray-50">
                                <div className="flex items-center gap-2">
                                  {doctor.imagen_url ? (
                                    <img
                                      src={doctor.imagen_url}
                                      alt="Foto de perfil"
                                      className="w-8 h-8 rounded-full object-cover border border-gray-300"
                                    />
                                  ) : (
                                    <UserRound className="w-6 h-6 text-gray-400" />
                                  )}
                                  <span>{`${doctor.apellidos ?? ""} ${doctor.nombres ?? ""}`}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={doctor.enabled}
                                    onCheckedChange={() => toggleDoctor(specialty.id, doctor.id)}
                                    disabled={!role([1, 4])}
                                  />
                                  <label className="cursor-pointer text-sm text-blue-600 hover:underline">
                                    Cambiar foto
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={e => handleImageUpload(e, specialty.id, doctor.id)}
                                    />
                                  </label>
                                </div>
                              </div>

                              {/* Aquí agrego el multiselect sin modificar el render original 
                              <div className="mt-1 px-3 w-full">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      disabled={!role([1, 4])}
                                      className="w-64 justify-between"
                                    >
                                      {doctorAcceptedInsurances[doctor.id]?.length
                                        ? `${doctorAcceptedInsurances[doctor.id].length} obras sociales seleccionadas`
                                        : "Seleccionar obras sociales"}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-64 p-0">
                                    <Command>
                                      <CommandInput placeholder="Buscar..." className="h-9" />
                                      <CommandList>
                                        <CommandGroup>
                                          {healthInsurances
                                            .filter(i => i.enabled)
                                            .map(i => {
                                              const selected = doctorAcceptedInsurances[doctor.id]?.includes(i.id)
                                              return (
                                                <CommandItem
                                                  key={i.id}
                                                  onSelect={() => {
                                                    setDoctorAcceptedInsurances(prev => {
                                                      const prevList = prev[doctor.id] || []
                                                      return {
                                                        ...prev,
                                                        [doctor.id]: selected
                                                          ? prevList.filter(id => id !== i.id)
                                                          : [...prevList, i.id],
                                                      }
                                                    })
                                                  }}
                                                >
                                                  <div className="flex items-center justify-between w-full">
                                                    <span>{i.nombre}</span>
                                                    {selected && <Check className="w-4 h-4 text-green-600" />}
                                                  </div>
                                                </CommandItem>
                                              )
                                            })}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                              </div>*/}


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
          </Card>)}

        </div>

        <div className={`mt-8 flex justify-center ${role([2]) ? "hidden" : ""}`}>
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
