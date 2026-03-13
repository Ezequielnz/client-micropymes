import React, { useState, useEffect } from 'react';
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

    // Initialize state from localStorage if available
    const [currentStep, setCurrentStep] = useState(() => {
        const savedStep = localStorage.getItem('onboarding_step');
        return savedStep ? parseInt(savedStep, 10) : 0;
    });

    // Persist step changes to localStorage
    useEffect(() => {
        if (isOpen) {
            localStorage.setItem('onboarding_step', currentStep.toString());
        }
    }, [currentStep, isOpen]);

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

    const handleComplete = () => {
        localStorage.removeItem('onboarding_step');
        onComplete();
    };

    const handleNext = () => {
        if (steps[currentStep].action) {
            steps[currentStep].action();
        }

        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    const isModalStep = currentStep === 0 || currentStep === steps.length - 1;

    if (isModalStep) {
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
    }

    // Non-blocking Bottom Bar for intermediate steps
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none flex justify-center">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] max-w-4xl w-full pointer-events-auto animate-in slide-in-from-bottom-10 duration-500 border border-gray-100/50 ring-1 ring-gray-200">
                <div className="flex flex-col sm:flex-row items-center p-4 sm:p-5 gap-4 sm:gap-6">

                    {/* Icon Wrapper - Smaller for bar */}
                    <div className="hidden sm:flex p-3 bg-blue-50 rounded-xl shrink-0 items-center justify-center">
                        {React.isValidElement(steps[currentStep].icon) ? (
                            React.cloneElement(steps[currentStep].icon, {
                                className: "w-8 h-8 text-blue-600"
                            })
                        ) : (
                            <div className="w-8 h-8 flex items-center justify-center text-blue-600">
                                {steps[currentStep].icon}
                            </div>
                        )}
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 text-center sm:text-left min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg mb-1 flex items-center justify-center sm:justify-start gap-2">
                            <span className="flex sm:hidden p-1.5 bg-blue-50 rounded-lg">
                                <div className="w-5 h-5 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:text-blue-600">
                                    {steps[currentStep].icon}
                                </div>
                            </span>
                            {steps[currentStep].title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                            {steps[currentStep].description}
                        </p>
                    </div>

                    {/* Actions Group */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full sm:w-auto border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0 mt-1 sm:mt-0">
                        {/* Progress Indicator (Compact) */}
                        <div className="flex gap-1.5 sm:mr-2">
                            {steps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-6 bg-blue-600' :
                                            idx < currentStep ? 'w-1.5 bg-blue-200' : 'w-1.5 bg-gray-200'
                                        }`}
                                />
                            ))}
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                            <button
                                onClick={handleSkip}
                                className="text-sm font-medium text-gray-500 hover:text-gray-800 px-3 py-2 transition-colors"
                            >
                                Omitir
                            </button>
                            <button
                                onClick={handleNext}
                                className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/30 active:scale-95 whitespace-nowrap"
                            >
                                {steps[currentStep].buttonText}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingTour;
