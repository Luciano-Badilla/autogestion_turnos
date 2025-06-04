"use client"

import type React from "react"

import { useState, useEffect, useRef  } from "react"
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
    const phoneNumber = "5491123456789" // Reemplazar con el número real
    const whatsappUrl = `https://wa.me/${phoneNumber}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">


        {/* Mensaje importante */}
        <Card className="mb-8 border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-6 h-6" />
              <strong>Aviso Importante</strong>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700">
              <strong>Este sistema está destinado exclusivamente para la solicitud de turnos de consulta.
                No se otorgan turnos para prácticas a través de esta plataforma.
                Para solicitar turnos relacionados con prácticas o estudios médicos, por favor comuníquese vía WhatsApp.
                Agradecemos su comprensión.</strong>
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">


          {/* Captcha y acceso al sistema */}
          <Card className="shadow-lg border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Calendar className="w-6 h-6" />
                Acceso al Sistema de Turnos Médicos
              </CardTitle>
              <CardDescription>
                Solo para turnos de consultas médicas generales.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Importante:</h4>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Solo permite solicitar <strong>consultas médicas</strong>.</li>
                    <li>• No se gestionan turnos para <strong>prácticas o estudios médicos</strong>.</li>
                    <li>• Para prácticas, debe contactarse vía <strong>WhatsApp</strong>.</li>
                  </ul>
                </div>

                {/* Captcha */}
                <div className="space-y-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <Label className="text-gray-700 font-medium mb-2 block">Verificación de seguridad</Label>
                    <div className="flex items-center gap-4">
                      <ReCAPTCHA
                        sitekey={SITE_KEY}
                        onChange={handleCaptchaChange}
                        ref={recaptchaRef}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={onAccessGranted}
                    disabled={!isCaptchaValid}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Acceder al Sistema de Consultas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Información y WhatsApp */}
          <Card className="shadow-lg border-green-100">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <MessageCircle className="w-6 h-6" />
                ¿Necesita un turno para una práctica?
              </CardTitle>
              <CardDescription>
                Las prácticas médicas se solicitan exclusivamente por WhatsApp.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-gray-700">
                  Para solicitar turnos relacionados con <strong>prácticas médicas o estudios</strong>
                  , debe comunicarse directamente por <strong>WhatsApp</strong>.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">Horarios de atención:</h4>
                  <ul className="text-green-700 text-sm space-y-1">
                    <li>• Lunes a Viernes: 8:00 - 20:00</li>
                    <li>• Sábados: 8:00 - 14:00</li>
                    <li>• Domingos: Solo emergencias</li>
                  </ul>
                </div>
                <Button
                  onClick={openWhatsApp}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-6 text-lg"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Solicitar práctica por WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  )
}
