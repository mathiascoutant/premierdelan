"use client";

import { useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import { FiDroplet, FiCheck, FiEye } from "react-icons/fi";

export default function ThemePage() {
  const { theme, setTheme, isMedieval, isClassic, isLoading } = useTheme();
  const [previewTheme, setPreviewTheme] = useState<typeof theme | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const themes = [
    {
      id: "medieval" as const,
      name: "Médiéval",
      description:
        "Design élégant avec des couleurs dorées et des accents médiévaux",
      colors: {
        primary: "#d4af37",
        secondary: "#6b1a3d",
        background: "#f5efe0",
        text: "#1a1410",
      },
      preview: "⚜️ Château • 🏰 Noblesse • 👑 Excellence",
    },
    {
      id: "classic" as const,
      name: "Classique",
      description: "Design moderne et épuré avec des couleurs professionnelles",
      colors: {
        primary: "#007bff",
        secondary: "#6c757d",
        background: "#f8f9fa",
        text: "#212529",
      },
      preview: "💼 Professionnel • 🎯 Moderne • ✨ Épuré",
    },
  ];

  const handleThemeChange = async (newTheme: typeof theme) => {
    setIsSaving(true);
    try {
      await setTheme(newTheme);
      setPreviewTheme(null);
    } catch (error) {
      console.error('Erreur lors du changement de thème:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = (previewTheme: typeof theme) => {
    setPreviewTheme(previewTheme);
    // Appliquer temporairement le thème pour l'aperçu
    document.body.className = document.body.className.replace(/theme-\w+/g, "");
    document.body.classList.add(`theme-${previewTheme}`);
  };

  const cancelPreview = () => {
    setPreviewTheme(null);
    // Restaurer le thème actuel
    document.body.className = document.body.className.replace(/theme-\w+/g, "");
    document.body.classList.add(`theme-${theme}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des thèmes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <FiDroplet className="w-6 h-6 text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Thèmes
          </h1>
          {isSaving && (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
          )}
        </div>
        <p className="text-gray-600">
          Choisissez le design global de votre site web. Ce thème sera appliqué à tous les utilisateurs.
          Vous pouvez prévisualiser chaque thème avant de l'appliquer.
        </p>
      </div>

      {/* Thèmes disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {themes.map((themeOption) => {
          const isActive = theme === themeOption.id;
          const isPreviewing = previewTheme === themeOption.id;

          return (
            <div
              key={themeOption.id}
              className={`bg-white border-2 rounded-lg p-6 transition-all duration-200 ${
                isActive
                  ? "border-blue-500 shadow-lg"
                  : isPreviewing
                  ? "border-orange-400 shadow-md"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Header du thème */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: themeOption.colors.primary }}
                  ></div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {themeOption.name}
                  </h3>
                  {isActive && (
                    <div className="flex items-center space-x-1 text-blue-600">
                      <FiCheck className="w-4 h-4" />
                      <span className="text-sm font-medium">Actuel</span>
                    </div>
                  )}
                  {isPreviewing && (
                    <div className="flex items-center space-x-1 text-orange-600">
                      <FiEye className="w-4 h-4" />
                      <span className="text-sm font-medium">Aperçu</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-4">{themeOption.description}</p>

              {/* Aperçu des couleurs */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Palette de couleurs :
                </h4>
                <div className="flex space-x-2">
                  {Object.entries(themeOption.colors).map(([name, color]) => (
                    <div key={name} className="text-center">
                      <div
                        className="w-8 h-8 rounded border border-gray-200"
                        style={{ backgroundColor: color }}
                        title={name}
                      ></div>
                      <span className="text-xs text-gray-500 mt-1 block capitalize">
                        {name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aperçu du style */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Aperçu :
                </h4>
                <div
                  className="p-3 rounded border"
                  style={{
                    backgroundColor: themeOption.colors.background,
                    color: themeOption.colors.text,
                    borderColor: themeOption.colors.primary + "40",
                  }}
                >
                  <p className="text-sm">{themeOption.preview}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                {!isActive && (
                  <>
                    <button
                      onClick={() => handlePreview(themeOption.id)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <FiEye className="w-4 h-4 inline mr-2" />
                      Aperçu
                    </button>
                    <button
                      onClick={() => handleThemeChange(themeOption.id)}
                      disabled={isSaving}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: themeOption.colors.primary }}
                    >
                      {isSaving ? 'Sauvegarde...' : 'Appliquer'}
                    </button>
                  </>
                )}
                {isActive && (
                  <div className="flex-1 px-4 py-2 text-sm font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded-md text-center">
                    Thème actuel
                  </div>
                )}
              </div>

              {/* Annuler l'aperçu */}
              {isPreviewing && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={cancelPreview}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Annuler l'aperçu
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Informations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          💡 Informations
        </h3>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>• Le thème choisi sera appliqué à tout le site web</li>
          <li>• Tous les utilisateurs verront immédiatement le nouveau design</li>
          <li>• Vous pouvez prévisualiser un thème avant de l'appliquer</li>
          <li>• Le thème global est sauvegardé en base de données</li>
          <li>• Seuls les administrateurs peuvent modifier le thème</li>
        </ul>
      </div>
    </div>
  );
}
