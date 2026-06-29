/**
 * CsvUploader.jsx
 *
 * Drag-and-drop or click-to-upload area for a single CSV file.
 * Calls onLoad(csvText, fileName) when a valid file is selected.
 *
 * @param {{ label: string, description: string, onLoad: (csvText: string, fileName: string) => void, hasData: boolean, fileName: string }} props
 */

import { useRef, useState } from 'react'

export default function CsvUploader({ label, description, onLoad, hasData, fileName }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  function readFile(file) {
    if (!file || !file.name.toLowerCase().endsWith('.csv')) return
    const reader = new FileReader()
    reader.onload = (evt) => onLoad(evt.target.result, file.name)
    reader.readAsText(file)
  }

  function handleFileInput(e) {
    const file = e.target.files[0]
    readFile(file)
    e.target.value = ''
  }

  function handleDragOver(e) {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }

  function handleDragLeave(e) {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    readFile(e.dataTransfer.files[0])
  }

  const borderColor = dragOver ? '#FF5800' : hasData ? '#1e5c2c' : '#CECECE'
  const background = dragOver ? '#fff8f3' : hasData ? '#f0faf2' : '#fafafa'

  return (
    <div
      style={{
        border: `2px dashed ${borderColor}`,
        borderRadius: 6,
        padding: '1rem 1.2rem',
        background,
        cursor: 'pointer',
        transition: 'border-color 0.15s, background 0.15s',
      }}
      onClick={() => inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
      aria-label={`Upload ${label}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: 'none' }}
        onChange={handleFileInput}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span style={{ fontSize: 20 }} aria-hidden="true">
          {hasData ? '✅' : '📄'}
        </span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#131A48' }}>{label}</div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
            {hasData ? fileName : dragOver ? 'Drop CSV here' : description}
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: hasData ? '#1e5c2c' : '#FF5800',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {hasData ? 'Change' : 'Upload'}
          </span>
        </div>
      </div>
    </div>
  )
}
