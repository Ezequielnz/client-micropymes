import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function TestPage() {
  console.log('TestPage component rendered');
  
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Página de Prueba
        </h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Prueba de Componentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Esta es una página de prueba para verificar que los componentes básicos funcionan correctamente.
              </p>
              
              <div className="flex gap-4">
                <Button onClick={() => console.log('Botón primario clickeado')}>
                  Botón Primario
                </Button>
                <Button variant="outline" onClick={() => console.log('Botón secundario clickeado')}>
                  Botón Secundario
                </Button>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800">
                  Si puedes ver esta página, los componentes básicos están funcionando correctamente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Información del Token</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Token presente: {localStorage.getItem('token') ? 'Sí' : 'No'}
            </p>
            {localStorage.getItem('token') && (
              <p className="text-sm text-gray-500 mt-2 break-all">
                Token: {localStorage.getItem('token').substring(0, 50)}...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default TestPage; 