
import { useState } from "react"
import { HealthInsurance } from "./components/steps/HealthInsurance"
import { SpecialtyStep } from "./components/steps/SpecialtyStep"
import HuIcon from "./components/HuIcon"

export function AppointmentForm() {
  const [step, setStep] = useState(1)
  const [appointmentData, setAppointmentData] = useState({
    healthInsurance: "",
    specialty: "",
    doctor: "",
    date: null,
    time: "",
    documentNumber: "",
    firstName: "",
    lastName: "",
    email: "",
  })

  const totalSteps = 5

  const updateData = (data) => {
    setAppointmentData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1)
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
      window.scrollTo(0, 0)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return <HealthInsurance data={appointmentData} updateData={updateData} onNext={nextStep} />
      case 2:
        return <SpecialtyStep data={appointmentData} updateData={updateData} onNext={nextStep} onBack={prevStep} />
      default:
        return null
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mt-5 mb-5">
        <HuIcon/>
      </div>
      <div className="relative">
        <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-200 rounded-full opacity-50 blur-xl"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-200 rounded-full opacity-50 blur-xl"></div>
        <div className="relative bg-white backdrop-blur-sm bg-opacity-70 rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400"></div>
          <div className="p-6 md:p-8">
            <div className="space-y-8">
              {renderStep()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
