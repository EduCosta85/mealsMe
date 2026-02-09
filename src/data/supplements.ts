import type { Supplement } from './types'

export const SUPPLEMENTS: readonly Supplement[] = [
  {
    id: 'colageno-vitc',
    name: 'Colageno 10g + Vit C 500mg',
    time: '06:00',
    withMeal: 'Jejum (com agua)',
    note: 'Tomar em jejum para maximizar absorcao',
  },
  {
    id: 'd3-k2',
    name: 'Vitamina D3 4000UI + K2 200ug',
    time: '~06:30',
    withMeal: 'Cafe da manha (com gordura)',
    note: 'Lipossoluveis — precisam de gordura',
  },
  {
    id: 'complexo-b',
    name: 'Complexo B Ativo',
    time: '~06:30',
    withMeal: 'Cafe da manha',
    note: 'Estimulante — tomar de manha',
  },
  {
    id: 'mg-dimalato',
    name: 'Magnesio Dimalato 300mg',
    time: '~06:30',
    withMeal: 'Cafe da manha',
    note: 'Forma energizante — ideal pela manha',
  },
  {
    id: 'omega3-almoco',
    name: 'Omega-3 1g EPA+DHA',
    time: '~12:30',
    withMeal: 'Almoco (com gordura)',
  },
  {
    id: 'calcio-almoco',
    name: 'Calcio Citrato 250mg',
    time: '~12:30',
    withMeal: 'Almoco',
  },
  {
    id: 'zinco',
    name: 'Zinco 30mg',
    time: '18:30',
    withMeal: '30 min antes do jantar (estomago vazio)',
    note: 'Separar do calcio',
  },
  {
    id: 'omega3-jantar',
    name: 'Omega-3 1g EPA+DHA',
    time: '~19:00',
    withMeal: 'Jantar (com gordura)',
  },
  {
    id: 'calcio-jantar',
    name: 'Calcio Citrato 250mg',
    time: '~19:00',
    withMeal: 'Jantar',
  },
  {
    id: 'mg-glicinato',
    name: 'Magnesio Glicinato 200mg',
    time: '21:00',
    withMeal: 'Antes de dormir',
    note: 'Forma calmante — melhora sono',
  },
  {
    id: 'creatina',
    name: 'Creatina 5g',
    time: 'Pos-treino',
    withMeal: 'Shake pos-treino ou refeicao',
    note: 'Dia off: tomar com almoco ou jantar',
  },
]
