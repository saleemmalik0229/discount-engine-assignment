import { formatINR } from '../utils/currency.js'

/**
 * Displays a rupee amount formatted for the Indian locale.
 * @param {{ amount: number, bold?: boolean, color?: string, style?: import('react').CSSProperties }} props
 */
export default function MoneyDisplay({ amount, bold = false, color, style = {} }) {
  const className = ['money-display', bold && 'money-display--bold'].filter(Boolean).join(' ')

  return (
    <span
      className={className}
      style={{
        color: color ?? undefined,
        ...style,
      }}
    >
      {formatINR(amount)}
    </span>
  )
}
