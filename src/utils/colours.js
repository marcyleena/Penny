const PALETTE = [
  '#FF6B9D', '#06D6A0', '#A78BFA', '#FFD166', '#4FC3F7',
  '#FF8A65', '#81C784', '#BA68C8', '#4DB6AC', '#F06292',
  '#AED581', '#7986CB', '#FF7043', '#26C6DA', '#D4E157',
]

export function categoryColour(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

export function categoryBg(name = '') {
  const bgs = ['#FFE8F0', '#E8F9F0', '#EDE8F9', '#FFF8E1', '#E8F4FF']
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return bgs[Math.abs(hash) % bgs.length]
}
