"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { authService, companiesService } from "@/lib/api";
import type { CompanyDTO } from "@/lib/api";

interface UserProfile {
  id: string;
  email: string;
  roleId: string;
  isCompany: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<CompanyDTO | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    email: "",
    name: "",
    contactEmail: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
          router.replace("/login");
          return;
        }

        const isCompanyRole = currentUser.roleId === "692641d17ad15076fef187d1";
        
        setUser({
          id: currentUser.id,
          email: currentUser.email,
          roleId: currentUser.roleId,
          isCompany: isCompanyRole,
        });

        setEditForm({
          email: currentUser.email,
          name: "",
          contactEmail: "",
        });

        // Si es compañía, cargar datos de la empresa
        if (isCompanyRole && currentUser.id) {
          try {
            const companyData = await companiesService.getCompanyByUserId(currentUser.id);
            setCompany(companyData);
            setEditForm({
              email: currentUser.email,
              name: companyData.name,
              contactEmail: companyData.contactEmail,
            });
          } catch (err) {
            console.error("Error cargando empresa:", err);
          }
        }
      } catch (error) {
        console.error("Error cargando perfil:", error);
        router.replace("/login");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();

    const handleAuthChange = () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.replace("/login");
      }
    };

    window.addEventListener("loginStatusChanged", handleAuthChange);

    return () => {
      window.removeEventListener("loginStatusChanged", handleAuthChange);
    };
  }, [router]);

  const handleSave = async () => {
    if (!user || !company) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      await companiesService.updateCompany(company.id, {
        name: editForm.name,
        contactEmail: editForm.contactEmail,
      });

      // Actualizar el estado local
      setCompany({
        ...company,
        name: editForm.name,
        contactEmail: editForm.contactEmail,
      });

      setIsEditing(false);
      setSaveMessage({
        type: "success",
        text: "Perfil actualizado exitosamente",
      });

      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      setSaveMessage({
        type: "error",
        text: "No se pudo actualizar el perfil. Intenta nuevamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (company) {
      setEditForm({
        email: user?.email || "",
        name: company.name,
        contactEmail: company.contactEmail,
      });
    }
    setIsEditing(false);
    setSaveMessage(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href={user.isCompany ? "/company/dashboard" : "/dashboard"}
              className="text-blue-500 hover:text-blue-600 font-medium mb-4 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Volver al inicio
            </Link>

            <h1 className="text-4xl font-bold text-gray-900 mb-2">Mi perfil</h1>
            <p className="text-gray-600">
              Gestiona la información de tu cuenta
            </p>
          </div>

          {/* Mensajes */}
          {saveMessage && (
            <div
              className={`mb-6 px-6 py-4 rounded-xl border ${
                saveMessage.type === "success"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {saveMessage.text}
            </div>
          )}

          {/* Perfil Card */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            {/* Avatar y tipo de cuenta */}
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {user.isCompany && company ? company.name : user.email}
                </h2>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    user.isCompany
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {user.isCompany ? "Empresa" : "Cliente"}
                </span>
              </div>
            </div>

            {/* Información del perfil */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Información de la cuenta
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Email del usuario */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email de usuario
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    El email no se puede modificar
                  </p>
                </div>

                {user.isCompany && company && (
                  <>
                    {/* Nombre de la empresa */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre de la empresa
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                          !isEditing ? "bg-gray-50" : ""
                        }`}
                      />
                    </div>

                    {/* Email de contacto */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email de contacto
                      </label>
                      <input
                        type="email"
                        value={editForm.contactEmail}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            contactEmail: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                          !isEditing ? "bg-gray-50" : ""
                        }`}
                      />
                    </div>
                  </>
                )}

                {/* ID de usuario */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ID de usuario
                  </label>
                  <input
                    type="text"
                    value={user.id}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-500 cursor-not-allowed font-mono text-sm"
                  />
                </div>
              </div>

              {/* Botones de acción */}
              {user.isCompany && company && (
                <div className="flex gap-4 pt-6">
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                    >
                      Editar perfil
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? "Guardando..." : "Guardar cambios"}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  ¿Necesitas ayuda con tu cuenta?
                </h3>
                <p className="text-sm text-blue-800 mb-3">
                  Si necesitas cambiar tu email o eliminar tu cuenta, contacta con
                  nuestro equipo de soporte.
                </p>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all"
                >
                  Contactar soporte
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
