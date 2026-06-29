import { formatINR } from '../utils/currency.js'

/**
 * Displays a rupee amount formatted for the Indian locale.
 * @param {{ amount: number, bold?: boolean, color?: string, style?: import('react').CSSProperties }} props
 */
export default function MoneyDisplay({ amount, bold = false, color, style = {} }) {
  return (
    <span
      style={{
        fontWeight: bold ? 700 : 400,
        color: color ?? '#131A48',
        ...style,
      }}
    >
      {formatINR(amount)}
    </span>
  )
}
