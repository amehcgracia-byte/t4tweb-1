"use client"

import { useVisualEditor } from "./visual-editor"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function VisualEditorToolbar() {
  const { isEditing, setIsEditing, selectedField } = useVisualEditor()
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // Keyboard shortcut to toggle edit mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + E to toggle edit mode
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault()
        setIsEditing(!isEditing)
      }
      // Escape to exit edit mode
      if (e.key === 'Escape' && isEditing) {
        setIsEditing(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isEditing, setIsEditing])

  const handleSave = async () => {
    setSaveStatus('saving')
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSaveStatus('saved')
    setTimeout(() => {
      setShowSaveModal(false)
      setSaveStatus('idle')
    }, 1000)
  }

  return (
    <>
      {/* Floating toolbar when editing */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-[#FF8C21] via-[#FF7C00] to-[#FF6C00] shadow-2xl"
          >
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-white font-bold text-lg">Modo Edición Visual</span>
                    <p className="text-white/70 text-xs">Ctrl+E para alternar • ESC para salir</p>
                  </div>
                </div>
                
                <div className="h-8 w-px bg-white/30 hidden md:block" />
                
                <div className="hidden md:block">
                  {selectedField ? (
                    <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-white text-sm">Editando: <strong className="text-white">{selectedField}</strong></span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
                      <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                      <span className="text-white/80 text-sm">Haz clic en cualquier elemento para editarlo</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open('/studio', '_blank')}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 backdrop-blur-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Editor Completo
                </button>

                <button
                  onClick={() => setShowSaveModal(true)}
                  className="px-5 py-2 bg-white text-[#FF8C21] hover:bg-white/95 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Guardar y Publicar
                </button>

                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-red-500/90 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Salir
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating action button (visible when not editing) */}
      {!isEditing && (
        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEditing(true)}
          className="fixed bottom-6 right-6 z-[9999] w-16 h-16 bg-gradient-to-r from-[#FF8C21] to-[#FF6C00] text-white rounded-full shadow-2xl hover:shadow-[0_20px_60px_rgba(255,140,33,0.5)] transition-all flex items-center justify-center group"
          title="Activar modo edición (Ctrl+E)"
        >
          <svg className="w-7 h-7 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </motion.button>
      )}

      {/* Save/Publish Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => saveStatus === 'idle' && setShowSaveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.3)] max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#FF8C21] to-[#FF6C00] flex items-center justify-center mx-auto mb-6">
                  {saveStatus === 'saving' ? (
                    <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : saveStatus === 'saved' ? (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                  )}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                  {saveStatus === 'saving' ? 'Guardando...' : saveStatus === 'saved' ? '¡Guardado!' : 'Guardar y Publicar'}
                </h3>
                
                <p className="text-gray-600 text-center mb-8">
                  {saveStatus === 'saved' 
                    ? 'Los cambios se han publicado correctamente.'
                    : 'Los cambios se guardarán en el CMS y se publicarán automáticamente.'}
                </p>

                {saveStatus === 'idle' && (
                  <div className="space-y-3">
                    <button
                      onClick={handleSave}
                      className="w-full py-4 bg-gradient-to-r from-[#FF8C21] to-[#FF6C00] text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-[#FF8C21]/30"
                    >
                      Guardar y Publicar Ahora
                    </button>
                    
                    <button
                      onClick={() => setShowSaveModal(false)}
                      className="w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacing when toolbar is visible */}
      {isEditing && <div className="h-16" />}
    </>
  )
}
