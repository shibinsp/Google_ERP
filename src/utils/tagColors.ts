/**
 * Color styling helper for metadata tags across Invoice Scanner and Financial Ledger views.
 */
export interface TagStyle {
  bg: string;
  text: string;
  border: string;
  dot: string;
}

export const PRESET_METADATA_TAGS = [
  'Tax-Deductible',
  'Q4-Budget',
  'Urgent',
  'CapEx',
  'OpEx',
  'Audit-Required',
  'Vendor-Discount',
  'Client-Recharge',
];

export function getTagColorClasses(tag: string): TagStyle {
  const lower = tag.toLowerCase();

  if (lower.includes('tax') || lower.includes('deductible')) {
    return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
    };
  }
  if (lower.includes('urgent') || lower.includes('critical') || lower.includes('expedite')) {
    return {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      dot: 'bg-rose-500',
    };
  }
  if (lower.includes('budget') || lower.includes('q4') || lower.includes('q3') || lower.includes('q1') || lower.includes('q2')) {
    return {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      dot: 'bg-purple-500',
    };
  }
  if (lower.includes('audit') || lower.includes('compliance') || lower.includes('review')) {
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
    };
  }
  if (lower.includes('capex') || lower.includes('capital') || lower.includes('asset')) {
    return {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      dot: 'bg-blue-500',
    };
  }
  if (lower.includes('opex') || lower.includes('operating')) {
    return {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-300',
      dot: 'bg-slate-500',
    };
  }
  if (lower.includes('recharge') || lower.includes('client') || lower.includes('b2b')) {
    return {
      bg: 'bg-cyan-50',
      text: 'text-cyan-700',
      border: 'border-cyan-200',
      dot: 'bg-cyan-500',
    };
  }
  if (lower.includes('discount') || lower.includes('rebate')) {
    return {
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      border: 'border-teal-200',
      dot: 'bg-teal-500',
    };
  }

  // Default neutral indigo
  return {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
  };
}
