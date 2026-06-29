/**
 * App.jsx
 *
 * Thin orchestration layer: manages state, wires adapters → engine → UI.
 */

import { useState, useEffect } from 'react'
import CsvUploader from './components/CsvUploader.jsx'
import DataTable from './components/DataTable.jsx'
import ErrorBanner from './components/ErrorBanner.jsx'
import CartSummaryPanel from './components/CartSummaryPanel.jsx'
import MoneyDisplay from './components/MoneyDisplay.jsx'
import { parseRulesCSV, parseCartCSV } from './adapters/index.js'
import { useDiscountEngine } from './hooks/useDiscountEngine.js'

const RULES_COLUMNS = [
  {
    key: 'ruleId',
    label: 'Rule ID',
    render: (v) => <span className="badge badge--rule-id">{v}</span>,
  },
  {
    key: 'scope',
    label: 'Scope',
    render: (v) => (
      <span className="badge badge--scope">{v.charAt(0).toUpperCase() + v.slice(1)}</span>
    ),
  },
  {
    key: 'appliesTo',
    label: 'Applies To',
    render: (v) =>
      v ? <span className="badge badge--brand">{v}</span> : <span className="badge badge--no-offer">—</span>,
  },
  {
    key: 'type',
    label: 'Type',
    render: (v) => (
      <span className="badge badge--type">{v.charAt(0).toUpperCase() + v.slice(1)}</span>
    ),
  },
  {
    key: 'value',
    label: 'Value',
    render: (v, row) => (
      <span className="badge badge--discount">
        {row.type === 'percentage' ? `${v}% off` : `Rs.${v} off`}
      </span>
    ),
  },
  {
    key: 'stackable',
    label: 'Stackable',
    render: (v) => (
      <span className={`badge ${v ? 'badge--stackable-yes' : 'badge--stackable-no'}`}>
        {v ? 'Yes' : 'No'}
      </span>
    ),
  },
  {
    key: 'minCartValue',
    label: 'Min Cart',
    render: (v) => (v != null ? <MoneyDisplay amount={v} /> : '—'),
  },
]

const CART_COLUMNS = [
  {
    key: 'itemId',
    label: 'Item',
    render: (v) => <span className="badge badge--rule-id">{v}</span>,
  },
  { key: 'product', label: 'Product' },
  {
    key: 'brand',
    label: 'Brand',
    render: (v) => <span className="badge badge--brand">{v}</span>,
  },
  {
    key: 'platform',
    label: 'Platform',
    render: (v) => <span className="badge badge--platform">{v}</span>,
  },
  {
    key: 'basePrice',
    label: 'Base Price',
    render: (v) => <MoneyDisplay amount={v} />,
  },
]

function RulesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SavingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TotalIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 20V10M12 20V4M6 20v-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="icon-check" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

function EmptyIllustration() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect x="12" y="16" width="40" height="32" rx="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 28h40" stroke="currentColor" strokeWidth="1.5" />
      <rect x="20" y="36" width="16" height="3" rx="1.5" fill="currentColor" opacity="0.35" />
      <rect x="20" y="42" width="24" height="3" rx="1.5" fill="currentColor" opacity="0.2" />
      <circle cx="48" cy="14" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M45 14h6M48 11v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
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

  // Add useEffect to auto-scroll when calculated succeeds
  useEffect(() => {
    if (calculated && summary) {
      const timer = setTimeout(() => {
        const element = document.getElementById('results-section')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [calculated, summary])

  // Scroll to section helper
  const handleScrollTo = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Handle click on Calculate Discounts
  const handleCalculateClick = () => {
    if (!canCalculate) {
      handleScrollTo('upload-section')
    } else {
      handleCalculate()
    }
  }

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

  const totalSavings = summary
    ? summary.items.reduce((s, i) => s + i.totalDiscount, 0) + (summary.cartOffer?.discountAmount ?? 0)
    : null
  const finalTotal = summary?.finalTotal ?? null

  return (
    <div className="app">
      <nav className="sticky-navbar">
        <div className="sticky-navbar__container">
          <span className="sticky-navbar__brand">
            <span className="sticky-navbar__brand-dot"></span>
            Discount Engine
          </span>
          <div className="sticky-navbar__links">
            <button
              type="button"
              className="navbar-link"
              onClick={() => handleScrollTo('rules-upload')}
            >
              Upload Rules
            </button>
            <button
              type="button"
              className="navbar-link"
              onClick={() => handleScrollTo('cart-upload')}
            >
              Upload Cart
            </button>
            <button
              type="button"
              className="navbar-link navbar-link--calculate"
              onClick={handleCalculateClick}
            >
              Calculate
            </button>
            <a
              href="https://github.com/saleemmalik0229/discount-engine-assignment"
              target="_blank"
              rel="noopener noreferrer"
              className="navbar-link navbar-link--github"
              aria-label="GitHub Repository"
            >
              <svg className="icon-github" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </nav>

      <main className="app-main" id="main-content">
        <header className="hero">
          <span className="hero__eyebrow">Pricing Engine</span>
          <h1 className="hero__title">Discount Engine</h1>
          <p className="hero__subtitle">Commerce Discount Operations Dashboard</p>
          <p className="hero__description">
            Upload discount rules and shopping cart CSVs to calculate the optimal customer pricing
            using stackable and non-stackable discount rules.
          </p>
          <div className="hero__actions">
            <button
              type="button"
              className="btn-calculate"
              onClick={handleCalculateClick}
            >
              Calculate Discounts
            </button>
            {!canCalculate && (
              <p className="hero__hint" id="calculate-hint">
                Upload both CSV files to enable calculation
              </p>
            )}
          </div>
        </header>

        <div className="quick-actions-bar">
          <button
            type="button"
            className="btn-quick"
            onClick={() => handleScrollTo('rules-upload')}
          >
            <RulesIcon />
            <span>Upload Rules</span>
          </button>
          <button
            type="button"
            className="btn-quick"
            onClick={() => handleScrollTo('cart-upload')}
          >
            <CartIcon />
            <span>Upload Cart</span>
          </button>
          <button
            type="button"
            className="btn-quick btn-quick--calculate"
            onClick={handleCalculateClick}
          >
            <SavingsIcon />
            <span>Calculate Discounts</span>
          </button>
          <a
            href="https://github.com/saleemmalik0229/discount-engine-assignment"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-quick btn-quick--github"
          >
            <svg className="icon-github" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
            <span>GitHub</span>
          </a>
        </div>

        <section className="kpi-grid page-section" aria-label="Dashboard metrics">
          <article className="kpi-card" aria-labelledby="kpi-rules">
            <div className="kpi-card__icon kpi-card__icon--rules" aria-hidden="true">
              <RulesIcon />
            </div>
            <div className="kpi-card__content">
              <p id="kpi-rules" className="kpi-card__label">
                Rules
              </p>
              <p className="kpi-card__value" aria-label={`${rules.length} rules loaded`}>
                {rules.length}
              </p>
            </div>
          </article>
          <article className="kpi-card" aria-labelledby="kpi-cart">
            <div className="kpi-card__icon kpi-card__icon--cart" aria-hidden="true">
              <CartIcon />
            </div>
            <div className="kpi-card__content">
              <p id="kpi-cart" className="kpi-card__label">
                Cart Items
              </p>
              <p className="kpi-card__value" aria-label={`${cartItems.length} cart items`}>
                {cartItems.length}
              </p>
            </div>
          </article>
          <article className="kpi-card" aria-labelledby="kpi-savings">
            <div className="kpi-card__icon kpi-card__icon--savings" aria-hidden="true">
              <SavingsIcon />
            </div>
            <div className="kpi-card__content">
              <p id="kpi-savings" className="kpi-card__label">
                Savings
              </p>
              <p
                className={`kpi-card__value ${totalSavings != null ? 'kpi-card__value--success' : 'kpi-card__value--muted'}`}
              >
                {totalSavings != null ? (
                  <MoneyDisplay amount={totalSavings} bold color="#059669" />
                ) : (
                  '—'
                )}
              </p>
            </div>
          </article>
          <article className="kpi-card" aria-labelledby="kpi-total">
            <div className="kpi-card__icon kpi-card__icon--total" aria-hidden="true">
              <TotalIcon />
            </div>
            <div className="kpi-card__content">
              <p id="kpi-total" className="kpi-card__label">
                Final Total
              </p>
              <p
                className={`kpi-card__value ${finalTotal != null ? 'kpi-card__value--success' : 'kpi-card__value--muted'}`}
              >
                {finalTotal != null ? (
                  <MoneyDisplay amount={finalTotal} bold color="#059669" />
                ) : (
                  '—'
                )}
              </p>
            </div>
          </article>
        </section>

        <section id="upload-section" className="upload-section page-section" aria-label="File uploads">
          <div className="upload-grid">
            <div id="rules-upload" className="upload-card-wrapper">
              <div className="upload-card-wrapper__header">
                <div>
                  <h2 className="upload-card-wrapper__title">Discount Rules</h2>
                  <p className="upload-card-wrapper__hint">Discount scope, value, thresholds, and stacking</p>
                </div>
                <span className="upload-card-wrapper__badge">CSV</span>
              </div>
              <CsvUploader
                label="rules.csv"
                description="Drag & drop or click to upload discount rules"
                onLoad={handleRulesLoad}
                hasData={rules.length > 0}
                fileName={rulesFileName}
              />
              <ErrorBanner errors={rulesErrors} />
              {rules.length > 0 && (
                <>
                  <div className="upload-card-wrapper__status" aria-live="polite">
                    <CheckIcon />
                    {rules.length} rule{rules.length !== 1 ? 's' : ''} loaded
                  </div>
                  {rulesFileName && (
                    <p className="upload-card-wrapper__filename">{rulesFileName}</p>
                  )}
                </>
              )}
            </div>

            <div id="cart-upload" className="upload-card-wrapper">
              <div className="upload-card-wrapper__header">
                <div>
                  <h2 className="upload-card-wrapper__title">Cart Items</h2>
                  <p className="upload-card-wrapper__hint">Products, brands, platforms, and base prices</p>
                </div>
                <span className="upload-card-wrapper__badge">CSV</span>
              </div>
              <CsvUploader
                label="cart.csv"
                description="Drag & drop or click to upload cart items"
                onLoad={handleCartLoad}
                hasData={cartItems.length > 0}
                fileName={cartFileName}
              />
              <ErrorBanner errors={cartErrors} />
              {cartItems.length > 0 && (
                <>
                  <div className="upload-card-wrapper__status" aria-live="polite">
                    <CheckIcon />
                    {cartItems.length} cart item{cartItems.length !== 1 ? 's' : ''} loaded
                  </div>
                  {cartFileName && (
                    <p className="upload-card-wrapper__filename">{cartFileName}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {rules.length > 0 && (
          <section className="section-card page-section" aria-labelledby="rules-table-heading">
            <div className="section-card__header">
              <h2 id="rules-table-heading" className="section-card__title">
                Rules
              </h2>
              <span className="section-card__meta">
                {rules.length} rule{rules.length !== 1 ? 's' : ''}
              </span>
            </div>
            <DataTable columns={RULES_COLUMNS} rows={rules} />
          </section>
        )}

        {cartItems.length > 0 && (
          <section className="section-card page-section" aria-labelledby="cart-table-heading">
            <div className="section-card__header">
              <h2 id="cart-table-heading" className="section-card__title">
                Cart
              </h2>
              <span className="section-card__meta">
                {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
              </span>
            </div>
            <DataTable columns={CART_COLUMNS} rows={cartItems} />
          </section>
        )}

        {summary && <CartSummaryPanel summary={summary} />}
      </main>

      <footer className="app-footer">
        <p className="app-footer__text">
          Built with React
          <span className="app-footer__divider" aria-hidden="true">
            ·
          </span>
          Vite
          <span className="app-footer__divider" aria-hidden="true">
            ·
          </span>
          JavaScript
          <br />
          <span className="app-footer__brand">Discount Engine Assignment</span>
        </p>
      </footer>
    </div>
  )
}
