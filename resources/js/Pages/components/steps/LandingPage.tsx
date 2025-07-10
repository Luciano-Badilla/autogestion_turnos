"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import ReCAPTCHA from "react-google-recaptcha"
import { Button } from "shadcn/components/ui/button"
import { Input } from "shadcn/components/ui/input"
import { Label } from "shadcn/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "shadcn/components/ui/card"
import { AlertTriangle, Calendar, MessageCircle, Shield, Stethoscope } from "lucide-react"

interface LandingPageProps {
  onAccessGranted: () => void
}
const SITE_KEY = "6LeIDlYrAAAAAKTOVHcS1G-8ZaYnh__m2hD3LeLv"
export function LandingPage({ onAccessGranted }: LandingPageProps) {
  const [captchaAnswer, setCaptchaAnswer] = useState("")
  const [captchaQuestion, setCaptchaQuestion] = useState("")
  const [correctAnswer, setCorrectAnswer] = useState(0)
  const [captchaError, setCaptchaError] = useState("")
  const [isCaptchaValid, setIsCaptchaValid] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token)
    setIsCaptchaValid(!!token)
  }

  // Generar una nueva pregunta de captcha
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    const operations = ["+", "-", "*"]
    const operation = operations[Math.floor(Math.random() * operations.length)]

    let answer = 0
    let question = ""

    switch (operation) {
      case "+":
        answer = num1 + num2
        question = `${num1} + ${num2}`
        break
      case "-":
        // Asegurar que el resultado sea positivo
        const larger = Math.max(num1, num2)
        const smaller = Math.min(num1, num2)
        answer = larger - smaller
        question = `${larger} - ${smaller}`
        break
      case "*":
        // Usar números más pequeños para multiplicación
        const smallNum1 = Math.floor(Math.random() * 5) + 1
        const smallNum2 = Math.floor(Math.random() * 5) + 1
        answer = smallNum1 * smallNum2
        question = `${smallNum1} × ${smallNum2}`
        break
    }

    setCaptchaQuestion(question)
    setCorrectAnswer(answer)
  }

  // Generar captcha al cargar el componente
  useEffect(() => {
    generateCaptcha()
  }, [])

  // Verificar la respuesta del captcha
  const verifyCaptcha = () => {
    const userAnswer = Number.parseInt(captchaAnswer)
    if (userAnswer === correctAnswer) {
      setIsCaptchaValid(true)
      setCaptchaError("")
    } else {
      setCaptchaError("Respuesta incorrecta. Inténtelo nuevamente.")
      generateCaptcha()
      setCaptchaAnswer("")
      setIsCaptchaValid(false)
    }
  }


  // Abrir WhatsApp
  const openWhatsApp = () => {
    const phoneNumber = "5492612053408" // Reemplazar con el número real
    const whatsappUrl = `https://wa.me/${phoneNumber}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <div className="lg:max-w-4xl lg:mx-auto lg:py-2">


      <div className="flex flex-col justify-center items-center">
        <div className={`mb-6 bg-gray-50 border border-gray-200 rounded-lg p-6 ${isCaptchaValid ? 'hidden' : ''}`}>
          <Label className="text-gray-700 font-medium mb-2 block">Verificación de seguridad</Label>
          <ReCAPTCHA
            sitekey={SITE_KEY}
            onChange={handleCaptchaChange}
            ref={recaptchaRef}
          />
        </div>
        {/* Captcha y acceso al sistema */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* CARD 1 - Consultas */}
          <Card className="shadow-lg border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <Button
                  onClick={onAccessGranted}
                  disabled={!isCaptchaValid}
                  className="w-full bg-[#013765] hover:bg-blue-800 text-white py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ingresá aquí para turnos de consulta
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 -mt-6 flex flex-col gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-black mb-2">Importante:</h4>
                <ul className="text-black text-sm space-y-1 pl-6 list-disc">
                  <li>Solicitá desde aquí tu turno para consultas médicas.</li>
                  <li>Recibirás en tu mail el comprobante del turno y, 48 horas antes, en tu WhatsApp el recordatorio.</li>
                  <li>Te esperamos 30 minutos antes del horario del turno para realizar el trámite de admisión.</li>
                </ul>

              </div>


            </CardContent>
          </Card>

          {/* CARD 2 - Prácticas */}
          <Card className="shadow-lg border-green-100 h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black w-full">
                <div className="flex flex-col gap-3 w-full">
                  <Button
                    onClick={openWhatsApp}
                    disabled={!isCaptchaValid}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png"
                      alt="WhatsApp"
                      width="25"
                      height="25"
                    />
                    Turno para prácticas por WhatsApp
                  </Button>

                  <a href={isCaptchaValid ? "tel:2615644000" : "#"}>
                    <button
                      disabled={!isCaptchaValid}
                      className="w-full rounded-md font-semibold px-4 py-2 text-lg text-white bg-[#013765] hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      📞 Turnos para práctica por teléfono
                    </button>
                  </a>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 flex flex-col flex-grow justify-between -mt-6">
              <div className="flex flex-col gap-4 flex-grow">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Si necesitás turno para <strong>Diagnóstico por Imágenes, tratamientos, estudios,
                    terapias y demás prácticas médicas</strong>, comunicate vía <strong>WhatsApp</strong> o <strong>telefónicamente</strong> con nuestro Call Center.
                  </p>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>
        {/* CAPTCHA DEBAJO DE AMBOS CARDS */}


      </div>
    </div>
  )
}
