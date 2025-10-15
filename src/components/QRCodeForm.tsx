'use client';

import React, { useState, useEffect } from 'react';
import { Moon, Sun, Loader2, QrCode, Download, Github, Linkedin } from 'lucide-react'; 

const MAX_DATA_LENGTH = 1000; 
const MAX_FILENAME_LENGTH = 50; 

export default function QRCodeForm() {
    const [data, setData] = useState('');
    const [fileName, setFileName] = useState('mi-codigo-qr');
    const [qrImageSrc, setQrImageSrc] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false); 

    useEffect(() => {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setQrImageSrc(null);
        setError(null);

        if (!data.trim()) {
            setError('Por favor, ingresa el contenido para tu código QR.');
            return;
        }
        
        if (data.length > MAX_DATA_LENGTH) {
            setError(`El contenido excede el límite de ${MAX_DATA_LENGTH} caracteres.`);
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data }), 
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
                throw new Error(errorData.error || 'Fallo al generar el QR.');
            }

            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            setQrImageSrc(imageUrl);

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error desconocido al generar el QR.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (qrImageSrc) {
            const finalFileName = fileName.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'codigo-qr';
            const link = document.createElement('a');
            link.href = qrImageSrc;
            link.download = `${finalFileName}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const IconSun = Sun;
    const IconMoon = Moon;
    const IconSpinner = Loader2;
    const IconQrcode = QrCode;
    const IconDownload = Download;
    const IconGithub = Github;
    const IconLinkedin = Linkedin;


    return (
        <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100 dark:bg-gray-950 transition-colors duration-300">
            <button
                onClick={toggleDarkMode}
                className="absolute top-6 right-6 p-3 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-yellow-400 shadow-lg hover:shadow-xl transition-all duration-300 z-10"
                aria-label="Toggle dark mode"
            >
                {isDarkMode ? <IconSun size={20} /> : <IconMoon size={20} />}
            </button>

            <header className="w-full max-w-5xl text-center my-10">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
                    Generador de <span className="text-blue-600 dark:text-blue-400">Código QR</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg">Crea, personaliza y descarga códigos QR estáticos de alta calidad.</p>
            </header>

            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl dark:shadow-gray-900/50 transition-colors duration-300 h-fit">
                    
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-3">
                        Configuración
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
                        
                        {[
                            { label: 'Contenido del QR', state: data, setState: setData, maxLength: MAX_DATA_LENGTH, placeholder: "Ej: https://midominio.com", description: "La URL o texto que contendrá el código." },
                            { label: 'Nombre de archivo', state: fileName, setState: setFileName, maxLength: MAX_FILENAME_LENGTH, placeholder: "Ej: qr-de-mi-sitio", description: "Nombre para el archivo PNG al descargarse." }
                        ].map((field, index) => (
                            <div key={index} className="space-y-1">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {field.label}
                                </label>
                                <input
                                    type="text"
                                    value={field.state}
                                    onChange={(e) => field.setState(e.target.value)}
                                    placeholder={field.placeholder}
                                    required={index === 0}
                                    maxLength={field.maxLength}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-inner"
                                />
                                {index === 0 && (
                                    <p className={`text-xs text-right ${field.state.length > field.maxLength * 0.9 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {field.state.length} / {field.maxLength} caracteres
                                    </p>
                                )}
                                <p className="text-xs text-gray-400 dark:text-gray-500">{field.description}</p>
                            </div>
                        ))}
                        
                        {error && (
                            <div className="p-3 bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-600 rounded-xl text-red-700 dark:text-red-300 font-medium transition-opacity duration-300">
                                ❌ {error}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className={`
                                w-full py-4 rounded-xl text-xl font-extrabold transition duration-300 shadow-lg 
                                flex items-center justify-center space-x-2 transform hover:scale-[1.01] 
                                ${isLoading 
                                    ? 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed shadow-none' 
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-blue-500/50 dark:shadow-blue-900/70'
                                }
                            `}
                        >
                            {isLoading ? (
                                <>
                                    <IconSpinner className="animate-spin" />
                                    <span>Generando QR...</span>
                                </>
                            ) : (
                                <>
                                    <IconQrcode />
                                    <span>Generar Código QR</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl dark:shadow-gray-900/50 transition-colors duration-300 lg:mt-0">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-3">
                        Resultado
                    </h2>

                    {qrImageSrc ? (
                        <div className="flex flex-col items-center text-center">
                            <h3 className="text-green-600 dark:text-green-400 font-bold mb-4 flex items-center space-x-2">
                                ✅ <span>Código Generado con Éxito</span>
                            </h3>

                            <div className="p-4 bg-white dark:bg-gray-900 border-4 border-dashed border-blue-200 dark:border-blue-500 rounded-xl shadow-inner mb-6">
                                <img 
                                    src={qrImageSrc} 
                                    alt="Código QR generado" 
                                    className="max-w-[250px] w-full h-auto mx-auto aspect-square rounded-lg" 
                                />
                            </div>

                            <button 
                                onClick={handleDownload}
                                className="w-full py-3 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-extrabold rounded-xl shadow-lg transition duration-300 flex items-center justify-center space-x-2 transform hover:scale-[1.01]"
                            >
                                <IconDownload />
                                <span>Descargar como "{fileName.trim() || 'codigo-qr'}.png"</span>
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                            <IconQrcode size={40} className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">
                                Tu código QR aparecerá aquí después de hacer clic en "Generar Código QR".
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <footer className="mt-12 mb-6 pt-6 border-t border-gray-300 dark:border-gray-700 w-full max-w-lg text-center">
                
                <div className="flex justify-center space-x-6 mb-3">
                    <a 
                        href="https://github.com/Seb2002" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        aria-label="GitHub Profile"
                    >
                        <IconGithub size={24} />
                    </a>
                    <a 
                        href="https://www.linkedin.com/in/juan-sebastian-mahecha-benavides/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        aria-label="LinkedIn Profile"
                    >
                        <IconLinkedin size={24} />
                    </a>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                    © 2025 Proyecto Generador QR | Creado por Seb2002.
                </p>
            </footer>

        </div>
    );
}
