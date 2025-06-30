
import { useState, useEffect } from "react"
import HealthInsuranceStep from "./components/steps/HealthInsuranceStep"
import SpecialtyStep from "./components/steps/SpecialtyStep"
import HuIcon from "./components/HuIcon"
import DoctorStep from "./components/steps/DoctorStep"
import DateTimeStep from "./components/steps/DateTimeStep"
import PersonalInfoStep from "./components/steps/PersonalInfoStep"
import { a } from "framer-motion/dist/types.d-CtuPurYT"
import PatientRegistrationStep from "./components/steps/PatientRegistrationStep"
import SummaryStep from "./components/steps/SummaryStep"
import { LandingPage } from "./components/steps/LandingPage"

export default function AppointmentForm({ healthInsurances, specialties }) {
  const [step, setStep] = useState(1)

  const [appointmentData, setAppointmentData] = useState({
    healthInsuranceId: null,
    healthInsurance: "",
    plan: "",
    planId: null,
    specialtyId: "",
    specialty: "",
    doctorId: null,
    doctor: "",
    date: null,
    time: "",
    agendaId: null,
    personId: null,
    documentNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    phoneCode: null
  })

  const totalSteps = 6

  const updateData = (data) => {
    setAppointmentData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1)
      window.history.pushState({ step: step + 1 }, "")
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {

    if (step > 1 && isRegistrationStep == false) {
      setStep(step - 1)
      window.history.pushState({ step: step - 1 }, "")
      window.scrollTo(0, 0)
    } else {
      setIsRegistrationStep(false)
    }
  }

  const scrollToBottomSmooth = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  }

  const [isRegistrationStep, setIsRegistrationStep] = useState(false)

  // Nueva función para manejar el registro de un nuevo paciente
  const handleRegisterNew = () => {
    setIsRegistrationStep(true)
    window.scrollTo(0, 0)
  }

  // Función para volver del paso de registro al paso de datos personales
  const handleBackFromRegistration = () => {
    setIsRegistrationStep(false)
    window.scrollTo(0, 0)
  }

  // Función para continuar después del registro
  const handleContinueAfterRegistration = () => {
    setIsRegistrationStep(false)
    nextStep()
  }

  useEffect(() => {
    window.history.replaceState({ step }, "")
  }, [])

  // Manejar botón "atrás" del navegador
  useEffect(() => {
    const handlePopState = (event) => {
      const newStep = event.state?.step
      if (newStep !== undefined) {
        setStep(newStep)
      } else {
        setStep(1)
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [])

  const renderStep = () => {

    if (isRegistrationStep && step === 5) {
      return (
        <PatientRegistrationStep
          data={appointmentData}
          updateData={updateData}
          onNext={handleContinueAfterRegistration}
          onBack={handleBackFromRegistration}
        />
      )
    }

    switch (step) {
      case 1:
        //nextStep();

        return (<LandingPage onAccessGranted={nextStep} />);
      /*case 2:
        nextStep();
      return (
        <HealthInsuranceStep
          healthInsurances={healthInsurances}
          data={appointmentData}
          updateData={updateData}
          onNext={nextStep}
          scrollToBottomSmooth={scrollToBottomSmooth}
        />
      );*/

      case 2:
        return (
          <SpecialtyStep
            specialties={specialties}
            data={appointmentData}
            updateData={updateData}
            onNext={nextStep}
            onBack={prevStep}
            scrollToBottomSmooth={scrollToBottomSmooth}
          />
        );
      case 3:
        return (
          <DoctorStep
            data={appointmentData}
            updateData={updateData}
            onNext={nextStep}
            onBack={prevStep}
            scrollToBottomSmooth={scrollToBottomSmooth}

          />
        );
      case 4:
        return (
          <DateTimeStep
            data={appointmentData}
            updateData={updateData}
            onNext={nextStep}
            onBack={prevStep}
            scrollToBottomSmooth={scrollToBottomSmooth}
          />
        );
      case 5:
        return (
          <PersonalInfoStep
            data={appointmentData}
            updateData={updateData}
            onNext={nextStep}
            onBack={prevStep}
            onRegisterNew={handleRegisterNew}
            scrollToBottomSmooth={scrollToBottomSmooth}
          />
        );

      case 6:
        return (
          <SummaryStep
            data={appointmentData}
            updateData={updateData}
            onBack={prevStep}
            setStep={setStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full">
      <div className="text-center bg-[#013765] w-full py-2">
        <div className="relative min-w-5xl max-w-5xl mx-auto h-full w-full px-6">
          <HuIcon />
        </div>
      </div>
      <div className="relative min-w-5xl max-w-5xl mx-auto h-full w-full">
        <div className="h-full w-full bg-white backdrop-blur-sm bg-opacity-70 rounded-2xl overflow-hidden flex flex-col items-center justify-center">
          <div className="p-6 md:p-8 w-full">
            <div className="space-y-8 w-full">
              {renderStep()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
