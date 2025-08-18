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

        {/* Captcha y acceso al sistema */}
        <div className="flex w-full justify-center">
          {/* CARD 1 - Consultas */}
          <Card className="lg:w-[50%] w-[95%]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <p>Seleccioná el tipo de turno que necesitás</p>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 -mt-6 flex flex-col gap-6">
              <div className="flex flex-col justify-center gap-3 w-full">
                <div className={`-ml-8 lg:ml-4 mb-6 p-6 ${isCaptchaValid ? 'hidden' : ''}`}>
                  <Label className="text-gray-700 font-medium mb-2 block">Verificación de seguridad</Label>
                  <ReCAPTCHA
                    sitekey={SITE_KEY}
                    onChange={handleCaptchaChange}
                    ref={recaptchaRef}
                  />
                </div>
                <button
                  onClick={onAccessGranted}
                  disabled={!isCaptchaValid}
                  className="w-full rounded-md font-semibold bg-[#013765] hover:bg-[#0160b0] text-white text-wrap py-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Turnos para consultas con especialistas
                </button>
                <button
                  onClick={openWhatsApp}
                  disabled={!isCaptchaValid}
                  className="w-full rounded-md font-semibold bg-[#1168b1] hover:bg-[#248fea] text-white text-wrap py-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >

                  Turnos para prácticas vía WhatsApp
                </button>

                <a href={isCaptchaValid ? "tel:2615644000" : "#"}>
                  <button
                    disabled={!isCaptchaValid}
                    className="w-full rounded-md font-semibold px-4 py-2 text-lg text-white text-wrap bg-[#1168b1] hover:bg-[#248fea] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Turnos para prácticas vía telefónica
                  </button>
                </a>
                <div className="flex flex-col gap-3 mt-2 w-full">
                  <div className="bg-[#eff6ff] border rounded-lg p-4">
                    <p className="text-gray-700 text-sm font-bold leading-relaxed">
                      ¡Importante!
                    </p>
                    <ul className="list-disc list-outside pl-6 text-gray-700 text-sm mt-2 space-y-1">
                      <li>
                        Las consultas con especialistas solo incluyen turnos para controles médicos y otras especialidades.
                      </li>
                      <li>
                        Las prácticas incluyen estudios, terapias, tratamientos y demás intervenciones para el diagnóstico, tratamiento y rehabilitación.
                      </li>
                    </ul>
                  </div>


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
