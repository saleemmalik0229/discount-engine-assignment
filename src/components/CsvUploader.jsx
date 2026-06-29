/**
 * CsvUploader.jsx
 *
 * Drag-and-drop or click-to-upload area for a single CSV file.
 * Calls onLoad(csvText, fileName) when a valid file is selected.
 *
 * @param {{ label: string, description: string, onLoad: (csvText: string, fileName: string) => void, hasData: boolean, fileName: string }} props
 */

import { useId, useRef, useState } from 'react'

function UploadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 16V4m0 0l-4 4m4-4l4 4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DragIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SuccessIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function CsvUploader({ label, description, onLoad, hasData, fileName }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const descId = useId()

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

  const statusText = hasData
    ? `File uploaded: ${fileName}. Select or press Enter to replace.`
    : dragOver
      ? 'Release to upload this CSV'
      : description

  const classNames = [
    'csv-uploader',
    dragOver && 'csv-uploader--dragover',
    hasData && 'csv-uploader--success',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classNames}
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
      aria-describedby={descId}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: 'none' }}
        onChange={handleFileInput}
        aria-hidden="true"
        tabIndex={-1}
      />
      <div className="csv-uploader__inner">
        <div className="csv-uploader__icon-wrap">
          {hasData ? <SuccessIcon /> : dragOver ? <DragIcon /> : <UploadIcon />}
        </div>
        <p className="csv-uploader__label">{label}</p>
        <p id={descId} className="csv-uploader__description">
          {hasData ? fileName : dragOver ? 'Drop the CSV here' : description}
        </p>
        <span className="csv-uploader__action" aria-hidden="true">
          {hasData ? 'Replace CSV' : 'Select CSV'}
        </span>
        <span className="visually-hidden">{statusText}</span>
      </div>
    </div>
  )
}
