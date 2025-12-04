import React, { useState } from 'react';
import {
    Building2,
    Package,
    ShoppingCart,
    CheckCircle2,
    ArrowRight,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OnboardingTour = ({ isOpen, onClose, onComplete }) => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);

    if (!isOpen) return null;

    const steps = [
        {
            title: "¡Bienvenido a OperixML!",
            description: "Estamos encantados de tenerte aquí. Vamos a configurar tu negocio en unos pocos pasos para que puedas empezar a vender cuanto antes.",
            icon: <img src="/operix_logo.png" alt="Logo" className="w-16 h-16 object-contain mb-4" />,
            action: null,
            buttonText: "Comenzar"
        },
        {
            title: "1. Crea tu Negocio",
            description: "Lo primero es registrar tu negocio. Define el nombre y la información básica para tus comprobantes.",
            icon: <Building2 className="w-16 h-16 text-blue-600 mb-4" />,
            action: () => navigate('/business-users'),
            buttonText: "Ir a Negocios"
        },
        {
            title: "2. Agrega tus Productos",
            description: "Carga tu inventario. Puedes hacerlo manualmente o importar una lista desde Excel/PDF.",
            icon: <Package className="w-16 h-16 text-green-600 mb-4" />,
            action: () => navigate('/products-and-services'),
            buttonText: "Ir a Productos"
        },
        {
            title: "3. Realiza tu Primera Venta",
            description: "¡Listo! Ya puedes usar el Punto de Venta (POS) para facturar y gestionar tus ventas.",
            icon: <ShoppingCart className="w-16 h-16 text-purple-600 mb-4" />,
            action: () => navigate('/pos'),
            buttonText: "Ir al POS"
        },
        {
            title: "¡Todo listo!",
            description: "Has completado el recorrido inicial. Si necesitas ayuda, el soporte está disponible 24/7.",
            icon: <CheckCircle2 className="w-16 h-16 text-teal-500 mb-4" />,
            action: null,
            buttonText: "Finalizar"
        }
    ];

    const handleNext = () => {
        if (steps[currentStep].action) {
            steps[currentStep].action();
        }

        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-300">

                {/* Header with Progress */}
                <div className="px-6 pt-6 pb-2 flex justify-between items-center">
                    <div className="flex gap-1">
                        {steps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx <= currentStep ? 'w-6 bg-blue-600' : 'w-2 bg-gray-200'
                                    }`}
                            />
                        ))}
                    </div>
                    <button
                        onClick={handleSkip}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col items-center text-center flex-1">
                    <div className="transform transition-all duration-500 hover:scale-105">
                        {steps[currentStep].icon}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        {steps[currentStep].title}
                    </h2>

                    <p className="text-gray-600 leading-relaxed">
                        {steps[currentStep].description}
                    </p>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <button
                        onClick={handleSkip}
                        className="text-sm font-medium text-gray-500 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Omitir
                    </button>

                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/30 active:scale-95"
                    >
                        {steps[currentStep].buttonText}
                        {currentStep < steps.length - 1 && <ArrowRight className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingTour;
