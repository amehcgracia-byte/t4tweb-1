"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface EditableElement {
  id: string
  type: string
  label: string
  value?: string
  element: HTMLElement
}

interface VisualEditorContextType {
  isEditing: boolean
  setIsEditing: (value: boolean) => void
  selectedElement: EditableElement | null
  setSelectedElement: (element: EditableElement | null) => void
  openPanel: boolean
  setOpenPanel: (open: boolean) => void
}

const VisualEditorContext = createContext<VisualEditorContextType>({
  isEditing: false,
  setIsEditing: () => {},
  selectedElement: null,
  setSelectedElement: () => {},
  openPanel: false,
  setOpenPanel: () => {},
})

export function useVisualEditor() {
  return useContext(VisualEditorContext)
}

export function VisualEditorProvider({ children }: { children: ReactNode }) {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedElement, setSelectedElement] = useState<EditableElement | null>(null)
  const [openPanel, setOpenPanel] = useState(false)

  useEffect(() => {
    // Check URL params for edit mode
    const params = new URLSearchParams(window.location.search)
    if (params.get('editMode') === 'true' || window.location.pathname === '/editor') {
      setIsEditing(true)
    }
  }, [])

  return (
    <VisualEditorContext.Provider
      value={{
        isEditing,
        setIsEditing,
        selectedElement,
        setSelectedElement,
        openPanel,
        setOpenPanel,
      }}
    >
      {children}
    </VisualEditorContext.Provider>
  )
}

// Main Visual Editor Overlay Component
export function VisualEditorOverlay() {
  const { isEditing, setIsEditing, selectedElement, setSelectedElement, openPanel, setOpenPanel } = useVisualEditor()
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null)

  // Handle element click in edit mode
  const handleElementClick = useCallback((e: MouseEvent) => {
    if (!isEditing) return
    
    const target = e.target as HTMLElement
    const editable = target.closest('[data-edit-id]') as HTMLElement
    
    if (editable) {
      e.preventDefault()
      e.stopPropagation()
      
      const id = editable.getAttribute('data-edit-id') || ''
      const type = editable.getAttribute('data-edit-type') || 'text'
      const label = editable.getAttribute('data-edit-label') || id
      
      // Get current value based on type
      let value = ''
      if (type === 'text') {
        value = editable.textContent?.trim() || ''
      } else if (type === 'image') {
        const img = editable.querySelector('img')
        value = img?.getAttribute('src') || ''
      } else if (type === 'link') {
        value = editable.getAttribute('href') || ''
      }
      
      setSelectedElement({ id, type, label, value, element: editable })
      setOpenPanel(true)
      
      // Add visual selection
      document.querySelectorAll('[data-edit-selected]').forEach(el => {
        el.removeAttribute('data-edit-selected')
      })
      editable.setAttribute('data-edit-selected', 'true')
    } else if (!target.closest('[data-edit-panel]') && !target.closest('[data-edit-toolbar]')) {
      // Click outside - close panel
      setOpenPanel(false)
      setSelectedElement(null)
      document.querySelectorAll('[data-edit-selected]').forEach(el => {
        el.removeAttribute('data-edit-selected')
      })
    }
  }, [isEditing, setSelectedElement, setOpenPanel])

  // Handle hover in edit mode
  const handleElementHover = useCallback((e: MouseEvent) => {
    if (!isEditing) return
    
    const target = e.target as HTMLElement
    const editable = target.closest('[data-edit-id]') as HTMLElement
    
    if (editable && editable !== hoveredElement) {
      setHoveredElement(editable)
    } else if (!editable) {
      setHoveredElement(null)
    }
  }, [isEditing, hoveredElement])

  // Prevent navigation in edit mode
  const handleLinkClick = useCallback((e: MouseEvent) => {
    if (!isEditing) return
    
    const target = e.target as HTMLElement
    const link = target.closest('a[href]')
    const editable = target.closest('[data-edit-id]')
    
    if (link && !editable) {
      e.preventDefault()
    }
  }, [isEditing])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault()
        setIsEditing(!isEditing)
      }
      if (e.key === 'Escape') {
        if (openPanel) {
          setOpenPanel(false)
          setSelectedElement(null)
          document.querySelectorAll('[data-edit-selected]').forEach(el => {
            el.removeAttribute('data-edit-selected')
          })
        } else if (isEditing) {
          setIsEditing(false)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isEditing, setIsEditing, openPanel, setOpenPanel])

  // Add event listeners when editing
  useEffect(() => {
    if (!isEditing) return
    
    document.addEventListener('click', handleElementClick, true)
    document.addEventListener('mouseover', handleElementHover)
    document.addEventListener('click', handleLinkClick, true)
    
    // Disable button/link functionality
    document.body.setAttribute('data-edit-mode', 'true')
    
    return () => {
      document.removeEventListener('click', handleElementClick, true)
      document.removeEventListener('mouseover', handleElementHover)
      document.removeEventListener('click', handleLinkClick, true)
      document.body.removeAttribute('data-edit-mode')
    }
  }, [isEditing, handleElementClick, handleElementHover, handleLinkClick])

  const handleSave = async () => {
    setSaveStatus('saving')
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSaveStatus('saved')
    setTimeout(() => {
      setShowSaveModal(false)
      setSaveStatus('idle')
    }, 1000)
  }

  return (
    <>
      {/* Edit Mode Indicator - Top Bar */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            data-edit-toolbar
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
                    <p className="text-white/70 text-xs hidden sm:block">Haz clic en cualquier elemento para editarlo • ESC para salir</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open('/studio', '_blank')}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="hidden sm:inline">Editor Completo</span>
                </button>

                <button
                  onClick={() => setShowSaveModal(true)}
                  className="px-5 py-2 bg-white text-[#FF8C21] hover:bg-white/95 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  <span className="hidden sm:inline">Guardar</span>
                </button>

                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-red-500/90 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover Indicator */}
      {isEditing && hoveredElement && (
        <div
          className="fixed pointer-events-none z-[9998]"
          style={{
            top: hoveredElement.getBoundingClientRect().top - 4,
            left: hoveredElement.getBoundingClientRect().left - 4,
            width: hoveredElement.getBoundingClientRect().width + 8,
            height: hoveredElement.getBoundingClientRect().height + 8,
            border: '2px dashed #FF8C21',
            borderRadius: '4px',
            transition: 'all 0.15s ease-out',
          }}
        >
          <div className="absolute -top-6 left-0 px-2 py-0.5 text-[10px] font-medium text-white bg-[#FF8C21] rounded-t whitespace-nowrap">
            {hoveredElement.getAttribute('data-edit-label') || hoveredElement.getAttribute('data-edit-id')}
          </div>
        </div>
      )}

      {/* Edit Panel - Contextual */}
      <AnimatePresence>
        {isEditing && openPanel && selectedElement && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            data-edit-panel
            className="fixed right-4 top-20 z-[9997] w-80 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden"
          >
            {/* Panel Header */}
            <div className="bg-gradient-to-r from-[#FF8C21] to-[#FF6C00] px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-lg">{selectedElement.label}</h3>
                  <p className="text-white/70 text-xs capitalize">{selectedElement.type}</p>
                </div>
                <button
                  data-edit-modal
                  onClick={() => {
                    setOpenPanel(false)
                    setSelectedElement(null)
                    document.querySelectorAll('[data-edit-selected]').forEach(el => {
                      el.removeAttribute('data-edit-selected')
                    })
                  }}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Panel Content */}
            <div className="p-5">
              {selectedElement.type === 'text' && (
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">Contenido del texto</label>
                  <textarea
                    defaultValue={selectedElement.value}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8C21] focus:border-transparent text-gray-800 resize-none"
                    rows={4}
                    onChange={(e) => {
                      // Update element in real-time
                      if (selectedElement.element) {
                        selectedElement.element.textContent = e.target.value
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500">Los cambios se aplican inmediatamente</p>
                </div>
              )}

              {selectedElement.type === 'image' && (
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">Imagen actual</label>
                  <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                    {selectedElement.value && (
                      <img src={selectedElement.value} alt="Preview" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <button 
                    data-edit-modal
                    className="w-full py-3 bg-gradient-to-r from-[#FF8C21] to-[#FF6C00] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                  >
                    Cambiar imagen
                  </button>
                </div>
              )}

              {selectedElement.type === 'link' && (
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">Destino del enlace</label>
                  <input
                    type="url"
                    defaultValue={selectedElement.value}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8C21] focus:border-transparent text-gray-800"
                    onChange={(e) => {
                      if (selectedElement.element) {
                        selectedElement.element.setAttribute('href', e.target.value)
                      }
                    }}
                  />
                </div>
              )}

              {selectedElement.type === 'section' && (
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm">
                    Esta es una sección completa del sitio. Para editar su contenido, haz clic en los elementos individuales dentro de ella.
                  </p>
                  <button
                    data-edit-modal
                    onClick={() => window.open('/studio', '_blank')}
                    className="w-full py-3 border border-[#FF8C21] text-[#FF8C21] rounded-xl font-semibold hover:bg-[#FF8C21]/10 transition-colors"
                  >
                    Abrir Editor Completo
                  </button>
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
              <button
                data-edit-modal
                onClick={() => setShowSaveModal(true)}
                className="w-full py-3 bg-gradient-to-r from-[#FF8C21] to-[#FF6C00] text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
              >
                Guardar cambios
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (when not editing) */}
      {!isEditing && (
        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEditing(true)}
          data-edit-toolbar
          className="fixed bottom-6 right-6 z-[9999] w-16 h-16 bg-gradient-to-r from-[#FF8C21] to-[#FF6C00] text-white rounded-full shadow-2xl hover:shadow-[0_20px_60px_rgba(255,140,33,0.5)] transition-all flex items-center justify-center group"
          title="Activar modo edición"
        >
          <svg className="w-7 h-7 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </motion.button>
      )}

      {/* Save Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-edit-modal
            className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => saveStatus === 'idle' && setShowSaveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              data-edit-modal
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
                      data-edit-modal
                      onClick={handleSave}
                      className="w-full py-4 bg-gradient-to-r from-[#FF8C21] to-[#FF6C00] text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-[#FF8C21]/30"
                    >
                      Guardar y Publicar Ahora
                    </button>
                    
                    <button
                      data-edit-modal
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

      {/* Spacing for toolbar */}
      {isEditing && <div className="h-16" />}
    </>
  )
}
