
import { useState } from "react"
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
    phone:"",
    phoneCode: null
  })

  console.log(appointmentData);

  const totalSteps = 7

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

    if (step > 1 && isRegistrationStep == false) {
      setStep(step - 1)
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

  const renderStep = () => {

    if (isRegistrationStep && step === 6) {
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
        nextStep();

        //return (<LandingPage onAccessGranted={nextStep} />);
      case 2:
        nextStep();
      /*return (
        <HealthInsuranceStep
          healthInsurances={healthInsurances}
          data={appointmentData}
          updateData={updateData}
          onNext={nextStep}
          scrollToBottomSmooth={scrollToBottomSmooth}
        />
      );*/

      case 3:
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
      case 4:
        return (
          <DoctorStep
            data={appointmentData}
            updateData={updateData}
            onNext={nextStep}
            onBack={prevStep}
            scrollToBottomSmooth={scrollToBottomSmooth}

          />
        );
      case 5:
        return (
          <DateTimeStep
            data={appointmentData}
            updateData={updateData}
            onNext={nextStep}
            onBack={prevStep}
            scrollToBottomSmooth={scrollToBottomSmooth}
          />
        );
      case 6:
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

      case 7:
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
    <div className="max-w-5xl mx-auto">
      <div className="text-center mt-5 mb-5">
        <HuIcon />
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
