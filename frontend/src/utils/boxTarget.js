export const boxCategoriesByTargetStatus = {
  tryingToConceive: ['Đang mong con'],
  pregnant: ['Đang trong thai kỳ'],
  ivf: ['IVF'],
  normal: ['Chăm sóc sức khỏe', 'Thư giãn'],
  periodTracking: ['Theo dõi chu kỳ', 'Chăm sóc kỳ kinh']
}

export const targetStatusLabels = {
  tryingToConceive: 'Đang mong con',
  pregnant: 'Đang trong thai kỳ',
  ivf: 'IVF',
  normal: 'Chăm sóc sức khỏe',
  periodTracking: 'Theo dõi chu kỳ',
  partner: 'Người thân',
  relatives: 'Người thân'
}

export const formatBoxTarget = (category) => (
  String(category || '').replace(/^(mục|muc)\s*(tiêu|tieu)\s*:\s*/i, '').trim()
)

export const canAccessAllBoxes = (targetStatus) => (
  targetStatus === 'partner' || targetStatus === 'relatives'
)

export const isBoxCompatibleWithTarget = (box, targetStatus) => {
  if (canAccessAllBoxes(targetStatus)) return true

  const allowedCategories = boxCategoriesByTargetStatus[targetStatus]
  if (!allowedCategories) return false

  return allowedCategories.includes(formatBoxTarget(box?.category))
}
