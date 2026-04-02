"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface VisualEditorContextType {
  isEditing: boolean
  setIsEditing: (value: boolean) => void
  selectedField: string | null
  setSelectedField: (field: string | null) => void
}

const VisualEditorContext = createContext<VisualEditorContextType>({
  isEditing: false,
  setIsEditing: () => {},
  selectedField: null,
  setSelectedField: () => {},
})

export function useVisualEditor() {
  return useContext(VisualEditorContext)
}

export function VisualEditorProvider({ children }: { children: ReactNode }) {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedField, setSelectedField] = useState<string | null>(null)

  useEffect(() => {
    // Check URL params for edit mode
    const params = new URLSearchParams(window.location.search)
    if (params.get('editMode') === 'true') {
      setIsEditing(true)
    }
  }, [])

  return (
    <VisualEditorContext.Provider
      value={{
        isEditing,
        setIsEditing,
        selectedField,
        setSelectedField,
      }}
    >
      {children}
    </VisualEditorContext.Provider>
  )
}

// Component to wrap editable elements
export function EditableWrapper({
  fieldId,
  fieldType,
  children,
  className = '',
}: {
  fieldId: string
  fieldType: 'text' | 'image' | 'array' | 'object'
  children: ReactNode
  className?: string
}) {
  const { isEditing, selectedField, setSelectedField } = useVisualEditor()
  const isSelected = selectedField === fieldId

  if (!isEditing) {
    return <>{children}</>
  }

  return (
    <div
      className={`relative ${className}`}
      data-sanity-edit-target={fieldId}
      data-sanity-edit-type={fieldType}
      onClick={(e) => {
        e.stopPropagation()
        setSelectedField(fieldId)
      }}
      style={{
        outline: isSelected ? '2px solid #FF8C21' : 'none',
        outlineOffset: '2px',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {isEditing && (
        <>
          {/* Hover overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity"
            style={{
              background: 'rgba(255, 140, 33, 0.1)',
              border: '1px dashed #FF8C21',
              zIndex: 10,
            }}
          />
          
          {/* Field label */}
          <div
            className="absolute -top-6 left-0 px-2 py-0.5 text-xs font-medium text-white bg-[#FF8C21] rounded-t"
            style={{ zIndex: 11 }}
          >
            {fieldId}
          </div>
          
          {/* Selection indicator */}
          {isSelected && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'rgba(255, 140, 33, 0.05)',
                border: '2px solid #FF8C21',
                boxShadow: '0 0 0 4px rgba(255, 140, 33, 0.2)',
                zIndex: 9,
              }}
            />
          )}
        </>
      )}
      {children}
    </div>
  )
}
