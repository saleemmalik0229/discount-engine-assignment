/**
 * App.jsx
 *
 * Thin orchestration layer: manages state, wires adapters → engine → UI.
 */

import { useState } from 'react'
import CsvUploader from './components/CsvUploader.jsx'
import DataTable from './components/DataTable.jsx'
import ErrorBanner from './components/ErrorBanner.jsx'
import CartSummaryPanel from './components/CartSummaryPanel.jsx'
import MoneyDisplay from './components/MoneyDisplay.jsx'
import { parseRulesCSV, parseCartCSV } from './adapters/index.js'
import { useDiscountEngine } from './hooks/useDiscountEngine.js'

const RULES_COLUMNS = [
  { key: 'ruleId', label: 'Rule ID' },
  { key: 'scope', label: 'Scope', render: (v) => v.charAt(0).toUpperCase() + v.slice(1) },
  { key: 'appliesTo', label: 'Applies To', render: (v) => v ?? '—' },
  { key: 'type', label: 'Type', render: (v) => v.charAt(0).toUpperCase() + v.slice(1) },
  {
    key: 'value',
    label: 'Value',
    render: (v, row) => (row.type === 'percentage' ? `${v}% off` : `Rs.${v} off`),
  },
  { key: 'stackable', label: 'Stackable', render: (v) => (v ? 'Yes' : 'No') },
  {
    key: 'minCartValue',
    label: 'Min Cart',
    render: (v) => (v != null ? <MoneyDisplay amount={v} /> : '—'),
  },
]

const CART_COLUMNS = [
  { key: 'itemId', label: 'Item' },
  { key: 'product', label: 'Product' },
  { key: 'brand', label: 'Brand' },
  { key: 'platform', label: 'Platform' },
  { key: 'basePrice', label: 'Base Price', render: (v) => <MoneyDisplay amount={v} /> },
]

const S = {
  page: { minHeight: '100vh', background: '#f7f7f9', fontFamily: 'Arial, sans-serif' },
  header: {
    background: '#131A48',
    padding: '0.85rem 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoTxt: {
    fontFamily: 'Georgia, serif',
    fontSize: 17,
    fontWeight: 700,
    color: '#fff',
    letterSpacing: '-0.02em',
  },
  logoSpan: { color: '#FF5800' },
  headerSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
  },
  main: { maxWidth: 960, margin: '0 auto', padding: '1.8rem 1.5rem' },
  section: {
    background: '#fff',
    border: '1px solid #CECECE',
    borderRadius: 6,
    padding: '1.2rem 1.4rem',
    marginBottom: '1.2rem',
  },
  sectionTitle: {
    fontFamily: 'Georgia, serif',
    fontWeight: 700,
    fontSize: 14,
    color: '#131A48',
    marginBottom: '0.7rem',
    paddingBottom: 6,
    borderBottom: '2px solid #FF5800',
    display: 'inline-block',
  },
}

export default function App() {
  const [rules, setRules] = useState([])
  const [rulesErrors, setRulesErrors] = useState([])
  const [rulesFileName, setRulesFileName] = useState('')

  const [cartItems, setCartItems] = useState([])
  const [cartErrors, setCartErrors] = useState([])
  const [cartFileName, setCartFileName] = useState('')

  const [calculated, setCalculated] = useState(false)

  const summary = useDiscountEngine(rules, cartItems, calculated)

  function handleRulesLoad(csvText, fileName) {
    const { data, errors } = parseRulesCSV(csvText)
    setRules(data)
    setRulesErrors(errors)
    setRulesFileName(fileName)
    setCalculated(false)
  }

  function handleCartLoad(csvText, fileName) {
    const { data, errors } = parseCartCSV(csvText)
    setCartItems(data)
    setCartErrors(errors)
    setCartFileName(fileName)
    setCalculated(false)
  }

  function handleCalculate() {
    setCalculated(true)
  }

  const canCalculate = rules.length > 0 && cartItems.length > 0

  return (
    <div style={S.page}>
      <header style={S.header} className="app-header">
        <div style={S.logoTxt}>
          O<span style={S.logoSpan}>pp</span>tra
        </div>
        <div style={S.headerSub}>Discount Engine</div>
      </header>

      <main style={S.main} className="app-main">
        <div className="upload-grid">
          <section style={S.section}>
            <div style={S.sectionTitle}>Discount Rules</div>
            <CsvUploader
              label="rules.csv"
              description="Drag & drop or click to upload discount rules"
              onLoad={handleRulesLoad}
              hasData={rules.length > 0}
              fileName={rulesFileName}
            />
            <ErrorBanner errors={rulesErrors} />
            {rules.length > 0 && (
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>
                  {rules.length} rule{rules.length > 1 ? 's' : ''} loaded
                  {rulesFileName ? ` · ${rulesFileName}` : ''}
                </div>
                <DataTable columns={RULES_COLUMNS} rows={rules} />
              </div>
            )}
          </section>

          <section style={S.section}>
            <div style={S.sectionTitle}>Cart Items</div>
            <CsvUploader
              label="cart.csv"
              description="Drag & drop or click to upload cart items"
              onLoad={handleCartLoad}
              hasData={cartItems.length > 0}
              fileName={cartFileName}
            />
            <ErrorBanner errors={cartErrors} />
            {cartItems.length > 0 && (
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>
                  {cartItems.length} item{cartItems.length > 1 ? 's' : ''} loaded
                  {cartFileName ? ` · ${cartFileName}` : ''}
                </div>
                <DataTable columns={CART_COLUMNS} rows={cartItems} />
              </div>
            )}
          </section>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
          <button
            type="button"
            className="btn-calculate"
            onClick={handleCalculate}
            disabled={!canCalculate}
          >
            Calculate Discounts
          </button>
          {!canCalculate && (
            <div style={{ fontSize: 11, color: '#888', marginTop: 6 }}>
              Upload both files to calculate
            </div>
          )}
        </div>

        {summary && <CartSummaryPanel summary={summary} />}
      </main>
    </div>
  )
}
