import DataTable from './DataTable.jsx'
import MoneyDisplay from './MoneyDisplay.jsx'

const RESULTS_COLUMNS = [
  {
    key: 'itemId',
    label: 'Item',
    render: (v) => <span className="badge badge--rule-id">{v}</span>,
  },
  { key: 'product', label: 'Product' },
  {
    key: 'basePrice',
    label: 'Base Price',
    render: (v) => <MoneyDisplay amount={v} />,
  },
  {
    key: 'finalPrice',
    label: 'Final Price',
    render: (v, row) => (
      <MoneyDisplay
        amount={v}
        bold
        color={row.totalDiscount > 0 ? '#047857' : undefined}
      />
    ),
  },
  {
    key: 'totalDiscount',
    label: 'Savings',
    render: (v) =>
      v > 0 ? (
        <span className="badge badge--discount">
          <MoneyDisplay amount={v} bold color="#047857" />
        </span>
      ) : (
        <span className="badge badge--no-offer">No savings</span>
      ),
  },
  {
    key: 'reasoning',
    label: 'Applied Offer',
    render: (v) =>
      v === 'No offers available' ? (
        <span className="badge badge--no-offer">No Offer</span>
      ) : (
        <span className="badge badge--discount">{v}</span>
      ),
  },
]

function CheckIcon() {
  return (
    <svg className="icon-check" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

/**
 * Displays item-level discount results, optional cart offer, and final total.
 * @param {{ summary: import('../domain/types.js').CartSummary }} props
 */
export default function CartSummaryPanel({ summary }) {
  const { items, itemSubtotal, cartOffer, finalTotal } = summary

  const baseTotal = items.reduce((sum, item) => sum + item.basePrice, 0)
  const itemSavings = items.reduce((sum, item) => sum + item.totalDiscount, 0)
  const cartDiscount = cartOffer?.discountAmount ?? 0
  const totalSavings = itemSavings + cartDiscount

  return (
    <section id="results-section" className="results-panel page-section" aria-labelledby="results-heading">
      <div className="results-panel__header">
        <h2 id="results-heading" className="results-panel__title">
          Results
        </h2>
        <span className="results-panel__badge">
          <CheckIcon />
          Calculated
        </span>
      </div>

      <div className="results-kpi-grid" role="group" aria-label="Pricing summary">
        <div className="results-kpi">
          <p className="results-kpi__label">Subtotal</p>
          <p className="results-kpi__value">
            <MoneyDisplay amount={baseTotal} bold />
          </p>
        </div>
        <div className="results-kpi">
          <p className="results-kpi__label">Cart Offer</p>
          <p className="results-kpi__value results-kpi__value--discount">
            {cartDiscount > 0 ? (
              <>
                −<MoneyDisplay amount={cartDiscount} bold color="#047857" />
              </>
            ) : (
              <MoneyDisplay amount={0} />
            )}
          </p>
        </div>
        <div className="results-kpi">
          <p className="results-kpi__label">Savings</p>
          <p className="results-kpi__value results-kpi__value--discount">
            <MoneyDisplay amount={totalSavings} bold color="#047857" />
          </p>
        </div>
      </div>

      <div className="results-kpi-grid results-kpi-grid--final">
        <div className="results-kpi results-kpi--final">
          <p className="results-kpi__label">Final Total</p>
          <p className="results-kpi__value">
            <MoneyDisplay amount={finalTotal} bold color="#047857" />
          </p>
        </div>
      </div>

      {cartOffer && (
        <div className="cart-offer-card" role="status">
          <div className="cart-offer-card__left">
            <div className="cart-offer-card__check" aria-hidden="true">
              <CheckIcon />
            </div>
            <div>
              <p className="cart-offer-card__title">Cart Offer Applied — {cartOffer.ruleId}</p>
              <p className="cart-offer-card__reasoning">{cartOffer.reasoning}</p>
            </div>
          </div>
          <div className="cart-offer-card__amount">
            −<MoneyDisplay amount={cartOffer.discountAmount} bold color="#047857" />
          </div>
        </div>
      )}

      <div className="results-table-section">
        <h3 className="results-table-section__label">Item breakdown</h3>
        <DataTable columns={RESULTS_COLUMNS} rows={items} />
      </div>

      <div className="results-subtotal-row">
        <p className="results-subtotal-row__label">Subtotal after item offers</p>
        <p className="results-subtotal-row__value">
          <MoneyDisplay amount={itemSubtotal} bold />
        </p>
      </div>
    </section>
  )
}
