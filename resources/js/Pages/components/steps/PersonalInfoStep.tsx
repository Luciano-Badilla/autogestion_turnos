"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Button } from "shadcn/components/ui/button"
import { Input } from "shadcn/components/ui/input"
import { Label } from "shadcn/components/ui/label"
import { AlertCircle, FileText, Mail, Phone, Search, User, UserPlus, Info } from "lucide-react"

// Función que hace la llamada real a la API Laravel
const searchPatientByDNI = async (dni: string) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/personalInfo/${dni}`)
  if (!response.ok) {
    throw new Error("Paciente no encontrado")
  }
  const data = (await response.json())[0];
  return data
}

export default function PersonalInfoStep({ data, updateData, onNext, onBack, onRegisterNew }) {
  const [dniInput, setDniInput] = useState(data.documentNumber)
  const [dniError, setDniError] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [patientFound, setPatientFound] = useState(false)
  const [notFoundError, setNotFoundError] = useState(false)

  const [emailInput, setEmailInput] = useState("")
  const [emailError, setEmailError] = useState("")
  const [needsEmail, setNeedsEmail] = useState(false)

  const [phoneInput, setPhoneInput] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [needsPhone, setNeedsPhone] = useState(false)

  const patientDataRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (patientFound && patientDataRef.current) {
      patientDataRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [patientFound])

  const validateDNI = (dni: string) => {
    if (!dni) return "Por favor ingrese su número de documento"
    if (!/^\d{7,8}$/.test(dni)) return "El número de documento debe tener entre 7 y 8 dígitos"
    return ""
  }

  const validateEmail = (email: string) => {
    if (!email) return "Por favor ingrese su email"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Por favor ingrese un email válido"
    return ""
  }

  const validatePhone = (phone: string) => {
    if (!phone) return "Por favor ingrese su número de celular"
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) return "Por favor ingrese un número de celular válido (10 dígitos)"
    return ""
  }

  const handleSearch = async (e) => {
    e.preventDefault()

    const error = validateDNI(dniInput)
    if (error) {
      setDniError(error)
      return
    }

    setIsSearching(true)
    setDniError("")
    setNotFoundError(false)
    setNeedsEmail(false)
    setEmailError("")
    setNeedsPhone(false)
    setPhoneError("")

    try {
      const patientData = await searchPatientByDNI(dniInput)
      setNeedsEmail(!patientData.email)
      setEmailInput("")
      const telefono =
        patientData.contacto_telefono?.trim()
          ? patientData.contacto_telefono
          : patientData.contacto_telefono_2?.trim()
            ? patientData.contacto_telefono_2
            : ""

      setNeedsPhone(!telefono)
      setPhoneInput("")
      updateData({
        documentNumber: dniInput,
        firstName: patientData.nombres,
        lastName: patientData.apellidos,
        email: patientData.email ?? "",
        phone: telefono,
        healthInsurance: patientData.obra_social,
        healthInsuranceId: patientData.obra_social_id,
        planId: patientData.plan_id,
        personId: patientData.id,
      })

      setPatientFound(true)
    } catch (error) {
      console.error("Error al buscar paciente:", error)
      setNotFoundError(true)
      updateData({ firstName: "", lastName: "", email: "", phone: "", healthInsurance: "", healthInsuranceId: "", documentNumber: "" })
      setPatientFound(false)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!patientFound) {
      const error = validateDNI(dniInput)
      if (error) {
        setDniError(error)
        return
      }
      setNotFoundError(true)
      return
    }

    if (needsEmail) {
      const error = validateEmail(emailInput)
      if (error) {
        setEmailError(error)
        return
      }
      updateData({ email: emailInput })
    }

    if (needsPhone) {
      const error = validatePhone(phoneInput)
      if (error) {
        setPhoneError(error)
        return
      }
      updateData({ phone: phoneInput })
    }

    onNext()
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailInput(e.target.value)
    setEmailError("")
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneInput(e.target.value)
    setPhoneError("")
  }

  const handleRegisterNew = () => {
    updateData({ documentNumber: dniInput, email: "", phone: "", healthInsurance: "", healthInsuranceId: "", personId: null, firstName: "", lastName: "" })
    onRegisterNew()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="bg-blue-50 rounded-full p-6 flex-shrink-0">
          <User className="w-12 h-12 text-[#013765]" />
        </div>
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-800">Datos personales</h2>
          <p className="text-gray-600">Ingrese su DNI para buscar sus datos en el sistema</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="max-w-md mx-auto space-y-6">
          <div className="space-y-2">
            <Label htmlFor="documentNumber" className="text-gray-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#013765]" />
              Número de Documento (DNI)
            </Label>
            <div className="flex gap-2">
              <Input
                id="documentNumber"
                type="text"
                placeholder="Ej: 12345678"
                value={dniInput}
                onChange={(e) => setDniInput(e.target.value)}
                className="h-12 border-gray-300 focus:border-[#013765] focus:ring-blue-500"
              />
              <Button
                type="button"
                onClick={handleSearch}
                className="bg-[#013765] hover:bg-blue-800 text-white h-12 px-4"
                disabled={isSearching}
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
            {dniError && <p className="text-rose-500 text-sm">{dniError}</p>}
          </div>

          {notFoundError && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 space-y-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-rose-800">Paciente no encontrado</h4>
                  <p className="text-rose-700 text-sm mt-1">
                    No se encontraron datos asociados a este DNI en nuestro sistema.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleRegisterNew}
                  className="bg-[#013765] hover:bg-blue-800 text-white flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Registrar nuevo paciente
                </Button>
              </div>
            </div>
          )}

          {patientFound && (
            <div ref={patientDataRef} className="mt-6 border-t border-gray-100 pt-6">
              <h3 className="font-medium text-[#013765] mb-4">Datos del paciente</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Nombre</p>
                    <p className="font-medium text-gray-800 bg-gray-50 p-3 rounded-md border border-gray-200">
                      {data.firstName}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Apellido</p>
                    <p className="font-medium text-gray-800 bg-gray-50 p-3 rounded-md border border-gray-200">
                      {data.lastName}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Email</p>
                  {needsEmail ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          placeholder="Ingrese su email para recibir la confirmación"
                          value={emailInput}
                          onChange={handleEmailChange}
                          className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pl-10"
                        />
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                      {emailError && <p className="text-rose-500 text-sm">{emailError}</p>}
                      <p className="text-amber-600 text-sm flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" />
                        No tenemos un email registrado para usted. Por favor, ingrese uno para recibir la confirmación.
                      </p>
                    </div>
                  ) : (
                    <p className="font-medium text-gray-800 bg-gray-50 p-3 rounded-md border border-gray-200">
                      {data.email}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Celular</p>
                  {needsPhone ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Ej: 1123456789"
                          value={phoneInput}
                          onChange={handlePhoneChange}
                          className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pl-10"
                        />
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                      {phoneError && <p className="text-rose-500 text-sm">{phoneError}</p>}
                      <p className="text-amber-600 text-sm flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" />
                        No tenemos un número de celular registrado para usted. Por favor, ingrese uno para recibir
                        recordatorios.
                      </p>
                    </div>
                  ) : (
                    <p className="font-medium text-gray-800 bg-gray-50 p-3 rounded-md border border-gray-200">
                      {data.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3 text-black text-sm flex flex-row">
                <Info className="w-6 h-6" />
                <p className="ml-2">
                  Estos datos se utilizarán para confirmar su turno. Recibirá la confirmación por email y un
                  recordatorio por Whatsapp.
                </p>
              </div>
            </div>
          )}
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
          className="bg-[#013765] hover:bg-blue-800 text-white px-8 py-3 h-auto rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          disabled={!patientFound || (needsEmail && !emailInput) || (needsPhone && !phoneInput)}
        >
          Continuar
        </Button>
      </div>
    </form>
  )
}
