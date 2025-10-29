import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBusinessContext } from '../contexts/BusinessContext';
import { useUserPermissions } from '../hooks/useUserPermissions';
import { authAPI, businessAPI } from '../utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/api\/v1$/, '');

function TestPage() {
  console.log('TestPage component rendered');
  
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { currentBusiness, businesses } = useBusinessContext();
  const { permissions, isLoading: permissionsLoading, error: permissionsError } = useUserPermissions(currentBusiness?.id);
  
  const [diagnostics, setDiagnostics] = useState(null);
  const [testResults, setTestResults] = useState({});

  const runDiagnostics = useCallback(async () => {
    console.log('=== EJECUTANDO DIAGNOSTICOS ===');

    const results = {
      localStorage: {
        hasToken: !!localStorage.getItem('token'),
        hasUser: !!localStorage.getItem('user'),
        tokenPreview: localStorage.getItem('token')?.substring(0, 50) + '...' || 'No token'
      },
      authContext: {
        loading: authLoading,
        isAuthenticated,
        hasUser: !!user,
        userId: user?.id || 'No ID',
        userEmail: user?.email || 'No email'
      },
      businessContext: {
        hasCurrentBusiness: !!currentBusiness,
        businessName: currentBusiness?.nombre || 'No business',
        businessesCount: businesses?.length || 0
      },
      permissions: {
        loading: permissionsLoading,
        hasError: !!permissionsError,
        errorMessage: permissionsError?.message || 'No error',
        hasPermissions: !!permissions,
        hasFullAccess: permissions?.has_full_access || false
      }
    };

    if (localStorage.getItem('token')) {
      try {
        console.log('Testing /auth/me endpoint...');
        const authResponse = await authAPI.getCurrentUser();
        results.apiTests = {
          authMe: { success: true, data: authResponse }
        };

        console.log('Testing /businesses endpoint...');
        const businessesResponse = await businessAPI.getBusinesses();
        results.apiTests.businesses = { success: true, data: businessesResponse };

        if (businessesResponse && businessesResponse.length > 0) {
          const firstBusiness = businessesResponse[0];
          console.log(`Testing /businesses/${firstBusiness.id}/permissions endpoint...`);

          try {
            const permissionsResponse = await fetch(`${API_BASE_URL}/api/v1/businesses/${firstBusiness.id}/permissions`, {
              cache: 'no-store',
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Pragma: 'no-cache',
                'Cache-Control': 'no-cache'
              }
            });

            if (permissionsResponse.ok) {
              const permissionsData = await permissionsResponse.json();
              results.apiTests.permissions = { success: true, data: permissionsData };
            } else {
              const errorData = await permissionsResponse.json();
              results.apiTests.permissions = { success: false, error: errorData };
            }
          } catch (permError) {
            results.apiTests.permissions = { success: false, error: permError.message };
          }
        }
      } catch (error) {
        results.apiTests = {
          authMe: { success: false, error: error.message }
        };
      }
    } else {
      results.apiTests = { error: 'No token available for API tests' };
    }

    setDiagnostics(results);
    console.log('Diagnostic results:', results);
  }, [authLoading, isAuthenticated, user, currentBusiness, businesses, permissions, permissionsLoading, permissionsError]);

  useEffect(() => {
    runDiagnostics();
  }, [runDiagnostics]);

  const clearLocalStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const testLogin = async () => {
    try {
      const testEmail = 'test@example.com';
      const testPassword = 'password123';
      
      console.log('Testing login with test credentials...');
      const loginResult = await authAPI.login(testEmail, testPassword);
      
      setTestResults(prev => ({
        ...prev,
        login: { success: true, data: loginResult }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        login: { success: false, error: error.message }
      }));
    }
  };
  
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Diagnóstico del Sistema de Autenticación y Permisos
        </h1>
        
        {/* Control Buttons */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Controles de Prueba</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={runDiagnostics}>
                Ejecutar Diagnósticos
              </Button>
              <Button onClick={testLogin} variant="outline">
                Probar Login
              </Button>
              <Button onClick={clearLocalStorage} variant="destructive">
                Limpiar LocalStorage
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* localStorage Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Estado de localStorage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Token presente:</strong> {localStorage.getItem('token') ? 'Sí' : 'No'}</p>
              <p><strong>User data presente:</strong> {localStorage.getItem('user') ? 'Sí' : 'No'}</p>
              {localStorage.getItem('token') && (
                <div className="p-2 bg-gray-100 rounded text-sm">
                  <strong>Token preview:</strong> {localStorage.getItem('token').substring(0, 50)}...
                </div>
              )}
              {localStorage.getItem('user') && (
                <div className="p-2 bg-gray-100 rounded text-sm">
                  <strong>User data:</strong>
                  <pre className="mt-2 text-xs overflow-auto">
                    {JSON.stringify(JSON.parse(localStorage.getItem('user')), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AuthContext Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Estado de AuthContext</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Loading:</strong> {authLoading ? 'Sí' : 'No'}</p>
              <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Sí' : 'No'}</p>
              <p><strong>User presente:</strong> {user ? 'Sí' : 'No'}</p>
              {user && (
                <div className="p-2 bg-gray-100 rounded text-sm">
                  <strong>User data:</strong>
                  <pre className="mt-2 text-xs overflow-auto">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* BusinessContext Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Estado de BusinessContext</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Current Business:</strong> {currentBusiness ? currentBusiness.nombre : 'No seleccionado'}</p>
              <p><strong>Businesses Count:</strong> {businesses?.length || 0}</p>
              {businesses && businesses.length > 0 && (
                <div className="p-2 bg-gray-100 rounded text-sm">
                  <strong>Businesses:</strong>
                  <pre className="mt-2 text-xs overflow-auto">
                    {JSON.stringify(businesses, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Permissions Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Estado de Permisos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Loading:</strong> {permissionsLoading ? 'Sí' : 'No'}</p>
              <p><strong>Error:</strong> {permissionsError ? permissionsError.message : 'No'}</p>
              <p><strong>Has Permissions:</strong> {permissions ? 'Sí' : 'No'}</p>
              {permissions && (
                <div className="p-2 bg-gray-100 rounded text-sm">
                  <strong>Permissions data:</strong>
                  <pre className="mt-2 text-xs overflow-auto">
                    {JSON.stringify(permissions, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Full Diagnostics */}
        {diagnostics && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Diagnósticos Completos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-2 bg-gray-100 rounded text-sm">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(diagnostics, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Resultados de Pruebas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-2 bg-gray-100 rounded text-sm">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default TestPage; 




