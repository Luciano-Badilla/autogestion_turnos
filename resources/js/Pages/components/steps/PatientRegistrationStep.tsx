"use client"

import type React from "react"

import { Button } from "shadcn/components/ui/button"
import { Input } from "shadcn/components/ui/input"
import { Label } from "shadcn/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "shadcn/components/ui/select"
import { UserPlus } from "lucide-react"
import { useEffect, useState } from "react"
import axios from 'axios';

// Generar arrays para los selectores de fecha
const currentYear = new Date().getFullYear()
const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i)
const months = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
]

// Función para obtener los días del mes
const getDaysInMonth = (month: number, year: number) => {
  const daysInMonth = new Date(year, month, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => i + 1)
}

export default function PatientRegistrationStep({ data, updateData, onNext, onBack }) {
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    documentNumber: "",
    gender: "",
    birthDate: "",
    phone: "",
    email: "",
    healthInsurance: "",
  })

  // Estados para los componentes de fecha
  const [birthDay, setBirthDay] = useState<string>("")
  const [birthMonth, setBirthMonth] = useState<string>("")
  const [birthYear, setBirthYear] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [healthInsurances, setHealthInsurances] = useState([]);
  const [enabledIds, setEnabledIds] = useState([]);
  const [filteredHealthInsurances, setFilteredHealthInsurances] = useState([]);

  // Función para actualizar la fecha completa cuando cambia algún componente
  const updateBirthDate = (day: string, month: string, year: string) => {
    if (day && month && year) {
      const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
      updateData({ birthDate: date })
    }
  }

  const handleDayChange = (day: string) => {
    setBirthDay(day)
    updateBirthDate(day, birthMonth, birthYear)
  }

  const handleMonthChange = (month: string) => {
    setBirthMonth(month)
    // Si el día seleccionado no existe en el nuevo mes, resetear el día
    if (birthDay && birthYear) {
      const daysInNewMonth = getDaysInMonth(Number.parseInt(month), Number.parseInt(birthYear))
      if (Number.parseInt(birthDay) > daysInNewMonth.length) {
        setBirthDay("")
      } else {
        updateBirthDate(birthDay, month, birthYear)
      }
    }
  }

  const handleYearChange = (year: string) => {
    setBirthYear(year)
    // Verificar si el día seleccionado es válido para el nuevo año (caso 29 de febrero)
    if (birthDay && birthMonth) {
      const daysInMonth = getDaysInMonth(Number.parseInt(birthMonth), Number.parseInt(year))
      if (Number.parseInt(birthDay) > daysInMonth.length) {
        setBirthDay("")
      } else {
        updateBirthDate(birthDay, birthMonth, year)
      }
    }
  }

  const validateForm = () => {
    const newErrors = {
      firstName: "",
      lastName: "",
      documentNumber: "",
      gender: "",
      birthDate: "",
      phone: "",
      email: "",
      healthInsurance: "",
    }

    if (!data.firstName) {
      newErrors.firstName = "Por favor ingrese el nombre"
    }

    if (!data.lastName) {
      newErrors.lastName = "Por favor ingrese el apellido"
    }

    if (!data.documentNumber) {
      newErrors.documentNumber = "Por favor ingrese el número de documento"
    } else if (!/^\d{7,8}$/.test(data.documentNumber)) {
      newErrors.documentNumber = "El número de documento debe tener entre 7 y 8 dígitos"
    }

    if (!data.gender) {
      newErrors.gender = "Por favor seleccione el sexo"
    }

    if (!birthDay || !birthMonth || !birthYear) {
      newErrors.birthDate = "Por favor seleccione la fecha de nacimiento completa"
    }

    if (!data.phone) {
      newErrors.phone = "Por favor ingrese el número de celular"
    } else if (!/^\d{10}$/.test(data.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Por favor ingrese un número de celular válido (10 dígitos)"
    }

    if (!data.email) {
      newErrors.email = "Por favor ingrese el email"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "Por favor ingrese un email válido"
    }

    if (!data.healthInsurance) {
      newErrors.healthInsurance = "Por favor seleccione una obra social"
    }

    setErrors(newErrors)
    return Object.values(newErrors).every((error) => error === "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Simular registro del paciente en la base de datos
      await new Promise((resolve) => setTimeout(resolve, 1500))

      onNext()
    } catch (error) {
      console.error("Error al registrar paciente:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    // Obtener ambas listas
    const fetchData = async () => {
      try {
        const [allResponse, enabledResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/healthinsurances`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/enabled-healthinsurances`)
        ]);

        const all = allResponse.data;
        const enabled = enabledResponse.data;


        setHealthInsurances(all);
        setEnabledIds(enabled);

        // Filtrar las habilitadas
        const filtered = all.filter(h => enabled.includes(h.id));
        setFilteredHealthInsurances(filtered);

      } catch (error) {
        console.error('Error cargando datos:', error);
      }
    };

    fetchData();
  }, []);

  // Preseleccionar fecha de nacimiento si ya está cargada
  useEffect(() => {
    if (data.birthDate instanceof Date && !isNaN(data.birthDate)) {
      const date = data.birthDate
      const day = date.getDate().toString()
      const month = (date.getMonth() + 1).toString()
      const year = date.getFullYear().toString()

      setBirthDay(day)
      setBirthMonth(month)
      setBirthYear(year)
    } else if (typeof data.birthDate === "string") {
      const date = new Date(data.birthDate)
      if (!isNaN(date.getTime())) {
        const day = date.getDate().toString()
        const month = (date.getMonth() + 1).toString()
        const year = date.getFullYear().toString()

        setBirthDay(day)
        setBirthMonth(month)
        setBirthYear(year)
      }
    }
  }, [data.birthDate])


  // Obtener días disponibles para el mes y año seleccionados
  const availableDays =
    birthMonth && birthYear ? getDaysInMonth(Number.parseInt(birthMonth), Number.parseInt(birthYear)) : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28]

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="bg-blue-50 rounded-full p-6 flex-shrink-0">
          <UserPlus className="w-12 h-12 text-blue-600" />
        </div>
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-800">Registro de nuevo paciente</h2>
          <p className="text-gray-600">Complete los datos para registrarse en nuestro sistema</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-gray-700">
              Nombre <span className="text-red-500"><span className="text-red-500">*</span></span>
            </Label>
            <Input
              id="firstName"
              placeholder="Ingrese su nombre"
              value={data.firstName}
              onChange={(e) => updateData({ firstName: e.target.value })}
              className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.firstName && <p className="text-rose-500 text-sm">{errors.firstName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-gray-700">
              Apellido <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              placeholder="Ingrese su apellido"
              value={data.lastName}
              onChange={(e) => updateData({ lastName: e.target.value })}
              className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.lastName && <p className="text-rose-500 text-sm">{errors.lastName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentNumber" className="text-gray-700">
              Número de Documento (DNI) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="documentNumber"
              type="text"
              placeholder="Ej: 12345678"
              value={data.documentNumber}
              onChange={(e) => updateData({ documentNumber: e.target.value })}
              className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.documentNumber && <p className="text-rose-500 text-sm">{errors.documentNumber}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">Sexo <span className="text-red-500">*</span></Label>
            <Select value={data.gender} onValueChange={(value) => updateData({ gender: value })}>
              <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Seleccione el sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="femenino">Femenino</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-rose-500 text-sm">{errors.gender}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-gray-700">Fecha de Nacimiento <span className="text-red-500">*</span></Label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Select value={birthDay} onValueChange={handleDayChange}>
                  <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Día" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 mt-1 relative z-50 min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-white text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-select-content-transform-origin]">
                    {availableDays.map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={birthMonth} onValueChange={handleMonthChange}>
                  <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Mes" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 mt-1 relative z-50 min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-white text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-select-content-transform-origin]">
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={birthYear} onValueChange={handleYearChange}>
                  <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Año" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {errors.birthDate && <p className="text-rose-500 text-sm">{errors.birthDate}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-700">
              Celular <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Ej: 1123456789"
              value={data.phone}
              onChange={(e) => updateData({ phone: e.target.value })}
              className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.phone && <p className="text-rose-500 text-sm">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="ejemplo@correo.com"
              value={data.email}
              onChange={(e) => updateData({ email: e.target.value })}
              className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.email && <p className="text-rose-500 text-sm">{errors.email}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-gray-700">
              Obra Social <span className="text-red-500">*</span>
            </Label>
            <Select
              value={data.healthInsurance?.id?.toString() || ''}
              onValueChange={(value) => {
                const selected = filteredHealthInsurances.find(
                  (insurance) => insurance.id.toString() === value
                );
                if (selected) {
                  updateData({ healthInsuranceId: selected.id, healthInsurance: selected.nombre });
                }
              }}
            >
              <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Seleccione una obra social" />
              </SelectTrigger>
              <SelectContent>
                {filteredHealthInsurances.map((insurance) => (
                  <SelectItem key={insurance.id} value={insurance.id.toString()}>
                    {insurance.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.healthInsurance && (
              <p className="text-rose-500 text-sm">{errors.healthInsurance}</p>
            )}
          </div>

        </div>

        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4 text-blue-800 text-sm">
          <p>
            Al registrarse, acepta que sus datos sean utilizados para la gestión de turnos médicos. Recibirá
            confirmaciones por email y recordatorios por Whatsapp.
          </p>
        </div>
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
          disabled={isSubmitting}
          className="bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white px-8 py-3 h-auto rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              Registrando...
            </span>
          ) : (
            "Registrar y Continuar"
          )}
        </Button>
      </div>
    </form>
  )
}
