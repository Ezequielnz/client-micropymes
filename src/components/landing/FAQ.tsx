import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "¿Necesito tarjeta de crédito para la prueba gratuita?",
      answer: "No, para nada. Podés probar OperixML durante 30 días completamente gratis sin necesidad de ingresar ninguna tarjeta de crédito. Solo necesitás tu email para registrarte."
    },
    {
      question: "¿Puedo cancelar en cualquier momento?",
      answer: "Sí, absolutamente. No hay contratos de permanencia ni penalizaciones. Si decidís que OperixML no es para vos, podés cancelar tu cuenta en cualquier momento desde la configuración, sin preguntas ni trabas."
    },
    {
      question: "¿Es difícil empezar a usar OperixML?",
      answer: "Para nada. OperixML está diseñado para ser intuitivo desde el primer día. Incluimos configuración guiada, importación de datos asistida y todo el soporte que necesités. La mayoría de nuestros clientes están operativos en menos de una semana."
    },
    {
      question: "¿Qué pasa después de los 30 días de prueba?",
      answer: "Cuando termine tu prueba, vas a recibir una notificación para elegir un plan. Si no elegís ninguno, tu cuenta se mantiene activa en modo solo lectura por 30 días más, para que puedas descargar tu información si lo necesitás."
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6">
            Preguntas frecuentes
          </h2>
          <p className="text-xl text-gray-600">
            Las respuestas a las dudas más comunes sobre OperixML
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                className="w-full px-6 py-6 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-8">
                  {faq.question}
                </h3>
                {openIndex === index ? (
                  <ChevronUp size={20} className="text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown size={20} className="text-gray-500 flex-shrink-0" />
                )}
              </button>

              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            ¿Tenés alguna otra pregunta?
          </p>
          <a href="mailto:contacto@operixml.com" className="inline-block bg-white text-blue-600 hover:text-blue-700 font-semibold hover:underline px-4 py-2 rounded-lg border border-blue-600 hover:bg-blue-50 transition-all">
            Contactanos y te respondemos al toque
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;