export interface ShoppingItem {
  readonly id: string
  readonly name: string
  readonly amount: number
  readonly unit: string
  readonly costMin: number
  readonly costMax: number
  readonly note?: string
}

export interface ShoppingCategory {
  readonly id: string
  readonly name: string
  readonly icon: string
  readonly color: string
  readonly bgColor: string
  readonly borderColor: string
  readonly accentColor: string
  readonly items: readonly ShoppingItem[]
}

export const SHOPPING_CATEGORIES: readonly ShoppingCategory[] = [
  {
    id: 'proteinas',
    name: 'Proteinas',
    icon: '🥩',
    color: 'text-red-800',
    bgColor: 'bg-red-50/50',
    borderColor: 'border-red-200',
    accentColor: 'accent-red-500',
    items: [
      { id: 'p1', name: 'Peito de frango', amount: 1.5, unit: 'kg', costMin: 25, costMax: 35, note: 'Proteina magra principal' },
      { id: 'p2', name: 'Ovos (bandeja 30)', amount: 30, unit: 'un', costMin: 20, costMax: 28, note: '3/dia = 21/sem + extras' },
      { id: 'p3', name: 'Sardinha em lata (azeite)', amount: 3, unit: 'latas', costMin: 18, costMax: 24, note: 'Calcio + omega-3 + vit D' },
      { id: 'p4', name: 'Carne moida (patinho)', amount: 500, unit: 'g', costMin: 20, costMax: 25, note: 'Ferro heme + B12' },
      { id: 'p5', name: 'Alcatra', amount: 300, unit: 'g', costMin: 25, costMax: 30, note: 'Variacao carne vermelha' },
      { id: 'p6', name: 'Tilapia/merluza (file)', amount: 300, unit: 'g', costMin: 15, costMax: 20, note: 'Peixe branco magro' },
      { id: 'p7', name: 'Salmao', amount: 200, unit: 'g', costMin: 20, costMax: 30, note: 'Omega-3 premium (1x/sem)' },
      { id: 'p8', name: 'Iogurte natural integral', amount: 2, unit: 'potes', costMin: 16, costMax: 24, note: 'Probiotico + calcio diario' },
      { id: 'p9', name: 'Leite integral', amount: 3, unit: 'L', costMin: 15, costMax: 20, note: 'Calcio diario' },
      { id: 'p10', name: 'Queijo minas frescal', amount: 300, unit: 'g', costMin: 12, costMax: 18, note: 'Calcio + proteina' },
      { id: 'p11', name: 'Ricota', amount: 200, unit: 'g', costMin: 8, costMax: 12, note: 'Variacao de laticinios' },
    ],
  },
  {
    id: 'carboidratos',
    name: 'Carboidratos',
    icon: '🍚',
    color: 'text-amber-800',
    bgColor: 'bg-amber-50/50',
    borderColor: 'border-amber-200',
    accentColor: 'accent-amber-500',
    items: [
      { id: 'c1', name: 'Arroz integral', amount: 1, unit: 'kg', costMin: 8, costMax: 12, note: 'Base de carbo LOW GI' },
      { id: 'c2', name: 'Pao integral (forma)', amount: 2, unit: 'pct', costMin: 14, costMax: 20, note: 'Pratico, fibras' },
      { id: 'c3', name: 'Aveia em flocos', amount: 500, unit: 'g', costMin: 6, costMax: 10, note: 'Beta-glucana, cafe, lanches' },
      { id: 'c4', name: 'Batata-doce', amount: 1, unit: 'kg', costMin: 5, costMax: 8, note: 'Carbo complexo, versatil' },
      { id: 'c5', name: 'Mandioquinha', amount: 300, unit: 'g', costMin: 4, costMax: 6, note: 'Variacao de carbo' },
      { id: 'c6', name: 'Feijao carioca', amount: 500, unit: 'g', costMin: 5, costMax: 7, note: 'Fibra + proteina vegetal' },
      { id: 'c7', name: 'Lentilha', amount: 300, unit: 'g', costMin: 6, costMax: 8, note: 'Variacao de leguminosa' },
      { id: 'c8', name: 'Grao-de-bico', amount: 300, unit: 'g', costMin: 6, costMax: 8, note: 'Variacao de leguminosa' },
      { id: 'c9', name: 'Tapioca (goma)', amount: 500, unit: 'g', costMin: 5, costMax: 8, note: 'Opcao sem gluten' },
      { id: 'c10', name: 'Granola sem acucar', amount: 200, unit: 'g', costMin: 8, costMax: 12, note: 'Variacao no lanche' },
    ],
  },
  {
    id: 'frutas',
    name: 'Frutas',
    icon: '🍎',
    color: 'text-pink-800',
    bgColor: 'bg-pink-50/50',
    borderColor: 'border-pink-200',
    accentColor: 'accent-pink-500',
    items: [
      { id: 'f1', name: 'Banana (cacho)', amount: 12, unit: 'un', costMin: 6, costMax: 10 },
      { id: 'f2', name: 'Maca', amount: 3, unit: 'un', costMin: 5, costMax: 8 },
      { id: 'f3', name: 'Laranja', amount: 3, unit: 'un', costMin: 3, costMax: 5 },
      { id: 'f4', name: 'Mamao papaya', amount: 1, unit: 'un', costMin: 4, costMax: 7 },
      { id: 'f5', name: 'Morango (bandeja)', amount: 1, unit: 'bdj', costMin: 6, costMax: 10 },
      { id: 'f6', name: 'Kiwi', amount: 2, unit: 'un', costMin: 4, costMax: 6 },
      { id: 'f7', name: 'Pera', amount: 2, unit: 'un', costMin: 4, costMax: 6 },
      { id: 'f8', name: 'Abacate', amount: 2, unit: 'un', costMin: 4, costMax: 8 },
      { id: 'f9', name: 'Manga', amount: 1, unit: 'un', costMin: 3, costMax: 5 },
      { id: 'f10', name: 'Limao', amount: 5, unit: 'un', costMin: 2, costMax: 3 },
    ],
  },
  {
    id: 'vegetais',
    name: 'Vegetais e Verduras',
    icon: '🥦',
    color: 'text-emerald-800',
    bgColor: 'bg-emerald-50/50',
    borderColor: 'border-emerald-200',
    accentColor: 'accent-emerald-500',
    items: [
      { id: 'v1', name: 'Brocolis', amount: 500, unit: 'g', costMin: 8, costMax: 12 },
      { id: 'v2', name: 'Couve (maco)', amount: 2, unit: 'macos', costMin: 4, costMax: 6 },
      { id: 'v3', name: 'Espinafre', amount: 200, unit: 'g', costMin: 4, costMax: 6 },
      { id: 'v4', name: 'Cenoura', amount: 500, unit: 'g', costMin: 3, costMax: 5 },
      { id: 'v5', name: 'Tomate', amount: 1, unit: 'kg', costMin: 6, costMax: 10 },
      { id: 'v6', name: 'Alface', amount: 2, unit: 'pes', costMin: 4, costMax: 6 },
      { id: 'v7', name: 'Rucula', amount: 1, unit: 'maco', costMin: 3, costMax: 5 },
      { id: 'v8', name: 'Pepino', amount: 3, unit: 'un', costMin: 3, costMax: 5 },
      { id: 'v9', name: 'Vagem', amount: 200, unit: 'g', costMin: 4, costMax: 6 },
      { id: 'v10', name: 'Abobrinha', amount: 2, unit: 'un', costMin: 3, costMax: 5 },
      { id: 'v11', name: 'Abobora cabotia', amount: 500, unit: 'g', costMin: 3, costMax: 5 },
      { id: 'v12', name: 'Beterraba', amount: 300, unit: 'g', costMin: 3, costMax: 4 },
      { id: 'v13', name: 'Cebola', amount: 500, unit: 'g', costMin: 3, costMax: 5 },
      { id: 'v14', name: 'Alho', amount: 2, unit: 'cab', costMin: 3, costMax: 5 },
    ],
  },
  {
    id: 'gorduras',
    name: 'Gorduras e Oleaginosas',
    icon: '🥜',
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-50/50',
    borderColor: 'border-yellow-200',
    accentColor: 'accent-yellow-600',
    items: [
      { id: 'g1', name: 'Azeite extra virgem', amount: 170, unit: 'mL', costMin: 10, costMax: 15, note: '500mL rende ~3 sem' },
      { id: 'g2', name: 'Pasta de amendoim sem acucar', amount: 170, unit: 'g', costMin: 6, costMax: 8, note: '500g rende ~3 sem' },
      { id: 'g3', name: 'Castanha-do-para', amount: 50, unit: 'g', costMin: 5, costMax: 8 },
      { id: 'g4', name: 'Castanha de caju', amount: 50, unit: 'g', costMin: 5, costMax: 8 },
      { id: 'g5', name: 'Amendoas', amount: 50, unit: 'g', costMin: 5, costMax: 8 },
      { id: 'g6', name: 'Nozes', amount: 30, unit: 'g', costMin: 4, costMax: 6 },
      { id: 'g7', name: 'Semente de linhaca', amount: 100, unit: 'g', costMin: 3, costMax: 5 },
      { id: 'g8', name: 'Semente de chia', amount: 50, unit: 'g', costMin: 4, costMax: 6 },
      { id: 'g9', name: 'Uva-passa/damasco seco', amount: 50, unit: 'g', costMin: 3, costMax: 5 },
    ],
  },
  {
    id: 'temperos',
    name: 'Temperos e Outros',
    icon: '🧂',
    color: 'text-stone-800',
    bgColor: 'bg-stone-50/50',
    borderColor: 'border-stone-200',
    accentColor: 'accent-stone-500',
    items: [
      { id: 't1', name: 'Mel', amount: 250, unit: 'g', costMin: 3, costMax: 5, note: 'Dura ~1 mes' },
      { id: 't2', name: 'Canela em po', amount: 30, unit: 'g', costMin: 1, costMax: 2, note: 'Beneficio insulinico' },
      { id: 't3', name: 'Cacau em po', amount: 50, unit: 'g', costMin: 2, costMax: 3, note: 'Flavonoides, HDL' },
      { id: 't4', name: 'Oregano, pimenta, salsinha', amount: 1, unit: 'kit', costMin: 3, costMax: 5, note: 'Temperos naturais' },
      { id: 't5', name: 'Cafe em po', amount: 250, unit: 'g', costMin: 5, costMax: 8, note: 'Cafeina = performance' },
    ],
  },
]

export const formatAmount = (amount: number, unit: string): string =>
  `${amount}${unit}`

export const getCategoryTotalCost = (category: ShoppingCategory): { min: number; max: number } =>
  category.items.reduce(
    (acc, item) => ({ min: acc.min + item.costMin, max: acc.max + item.costMax }),
    { min: 0, max: 0 },
  )

export const getTotalWeeklyCost = (): { min: number; max: number } =>
  SHOPPING_CATEGORIES.reduce(
    (acc, cat) => {
      const catCost = getCategoryTotalCost(cat)
      return { min: acc.min + catCost.min, max: acc.max + catCost.max }
    },
    { min: 0, max: 0 },
  )

export const getToBuyAmount = (needed: number, inventory: number): number =>
  Math.max(0, needed - inventory)

export const getAllItems = (): readonly ShoppingItem[] =>
  SHOPPING_CATEGORIES.flatMap((cat) => cat.items)
