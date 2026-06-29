import DataTable from './DataTable.jsx'
import MoneyDisplay from './MoneyDisplay.jsx'

const RESULTS_COLUMNS = [
  { key: 'itemId', label: 'Item' },
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
        color={row.totalDiscount > 0 ? '#1e5c2c' : '#131A48'}
      />
    ),
  },
  {
    key: 'totalDiscount',
    label: 'You Save',
    render: (v) =>
      v > 0 ? (
        <MoneyDisplay amount={v} bold color="#1e5c2c" />
      ) : (
        <span style={{ color: '#888' }}>—</span>
      ),
  },
  {
    key: 'reasoning',
    label: 'Offer Applied',
    render: (v) => (
      <span
        style={{
          color: v === 'No offers available' ? '#888' : '#131A48',
          fontStyle: v === 'No offers available' ? 'italic' : 'normal',
        }}
      >
        {v}
      </span>
    ),
  },
]

const styles = {
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
  subtotalRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '0.75rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #CECECE',
  },
  cartOfferRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.5rem',
    padding: '0.65rem 0.9rem',
    background: '#fff8f3',
    border: '1px solid #FF5800',
    borderRadius: 4,
  },
  cartOfferLabel: {
    fontWeight: 700,
    fontSize: 13,
    color: '#131A48',
  },
  cartOfferReasoning: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  finalTotalRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '0.75rem',
    paddingTop: '0.75rem',
    borderTop: '2px solid #131A48',
  },
  totalLabel: {
    fontWeight: 700,
    fontSize: 14,
    color: '#131A48',
  },
}

/**
 * Displays item-level discount results, optional cart offer, and final total.
 * @param {{ summary: import('../domain/types.js').CartSummary }} props
 */
export default function CartSummaryPanel({ summary }) {
  const { items, itemSubtotal, cartOffer, finalTotal } = summary

  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>Cart Summary</div>
      <DataTable columns={RESULTS_COLUMNS} rows={items} />

      <div style={styles.subtotalRow}>
        <span style={styles.totalLabel}>Subtotal (after item offers)</span>
        <MoneyDisplay amount={itemSubtotal} bold />
      </div>

      {cartOffer && (
        <div style={styles.cartOfferRow}>
          <div>
            <div style={styles.cartOfferLabel}>
              Cart Offer ({cartOffer.ruleId})
            </div>
            <div style={styles.cartOfferReasoning}>{cartOffer.reasoning}</div>
          </div>
          <MoneyDisplay amount={-cartOffer.discountAmount} bold color="#1e5c2c" />
        </div>
      )}

      <div style={styles.finalTotalRow}>
        <span style={styles.totalLabel}>Final Cart Total</span>
        <MoneyDisplay amount={finalTotal} bold style={{ fontSize: 16 }} />
      </div>
    </div>
  )
}
