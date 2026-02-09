import type {
  Mesocycle,
  TrainingSession,
  LissSession,
  WarmupItem,
  CooldownItem,
  DailyCorrectiveItem,
  Exercise,
} from './training-types'

// --- Warmup (same for all sessions) ---

const WARMUP: readonly WarmupItem[] = [
  { id: 'w1', phase: 'Liberacao Miofascial', name: 'Foam roller coluna toracica (T4 e T6)', prescription: '1x30s cada nivel', minutes: 2 },
  { id: 'w2', phase: 'Mobilidade Toracica', name: 'Cat-Cow (enfase na extensao)', prescription: '1x10 reps lentas', minutes: 1.5 },
  { id: 'w3', phase: 'Mobilidade Toracica', name: 'Open Book (rotacao toracica)', prescription: '1x8 cada lado', minutes: 2 },
  { id: 'w4', phase: 'Alongamento Dinamico', name: 'Along. flexores de quadril (semi-ajoelhado)', prescription: '1x30s cada lado', minutes: 1.5 },
  { id: 'w5', phase: 'Alongamento Dinamico', name: 'Along. peitoral na porta', prescription: '1x20s cada angulo (45° e 90°)', minutes: 1 },
  { id: 'w6', phase: 'Ativacao Core', name: 'Dead Bug', prescription: '2x6 cada lado', minutes: 2 },
  { id: 'w7', phase: 'Ativacao Core', name: 'Bird-Dog', prescription: '2x6 cada lado', minutes: 2 },
  { id: 'w8', phase: 'Ativacao Escapular', name: 'Band Pull-Aparts', prescription: '2x15', minutes: 1 },
  { id: 'w9', phase: 'Ativacao Escapular', name: 'Face Pulls (carga leve)', prescription: '2x12', minutes: 1 },
]

// --- Cooldowns ---

const COOLDOWN_UPPER: readonly CooldownItem[] = [
  { id: 'cu1', name: 'Along. peitoral na porta (2 angulos)', prescription: '2x30s' },
  { id: 'cu2', name: 'Along. trapezio superior/levantador escapula', prescription: '2x30s cada lado' },
  { id: 'cu3', name: 'Chin Tucks (retracao cervical)', prescription: '10 reps x 5s' },
  { id: 'cu4', name: 'Respiracao diafragmatica', prescription: '1 min' },
]

const COOLDOWN_LOWER_A: readonly CooldownItem[] = [
  { id: 'cla1', name: 'Along. flexores de quadril (semi-ajoelhado)', prescription: '2x30s cada lado' },
  { id: 'cla2', name: 'Foam roller quadriceps + IT band', prescription: '1 min cada perna' },
  { id: 'cla3', name: 'Respiracao diafragmatica', prescription: '1 min' },
]

const COOLDOWN_LOWER_B: readonly CooldownItem[] = [
  { id: 'clb1', name: 'Along. flexores de quadril (semi-ajoelhado)', prescription: '2x30s cada lado' },
  { id: 'clb2', name: 'Along. isquiotibiais (pe no banco)', prescription: '2x30s cada perna' },
  { id: 'clb3', name: 'Foam roller coluna toracica (extensao passiva)', prescription: '2x30s' },
  { id: 'clb4', name: 'Respiracao diafragmatica', prescription: '1 min' },
]

// --- Daily correctives ---

export const DAILY_CORRECTIVES: readonly DailyCorrectiveItem[] = [
  { id: 'dc1', name: 'Chin Tucks', frequency: 'Diario', when: 'A cada hora sentado' },
  { id: 'dc2', name: 'Band Pull-Aparts', frequency: 'Diario', when: '2-3x pausa no trabalho' },
  { id: 'dc3', name: 'Along. peitoral porta', frequency: 'Diario', when: 'Pos-treino ou pausas' },
  { id: 'dc4', name: 'Along. flexores quadril', frequency: 'Diario', when: 'Pre-treino ou pausas' },
  { id: 'dc5', name: 'Along. trapezio superior', frequency: 'Diario', when: 'Pausas no trabalho' },
  { id: 'dc6', name: 'Foam roller toracica', frequency: '4-5x/semana', when: 'Pos-treino ou noite' },
]

// --- Exercise builder helpers ---

const s = (sets: number, reps: string, load: string, rest: string, rir: string): Exercise['sets'] =>
  [{ sets, reps, load, rest, rir }]

// --- MESOCYCLE 1: Adaptation (Weeks 1-4) ---

const upperA_m1: readonly Exercise[] = [
  { id: 'ua1', name: 'Supino Reto c/ Halteres', category: 'main', muscles: 'Peitoral, deltoide ant., triceps', sets: s(3, '12-15', '8kg cada', '90s', '3-4'), cues: ['Cotovelos a 45°', 'Escapulas retraidas', 'Arco toracico MINIMO', 'Descer 3s'], safety: 'Se dor em T6-T8 → PARAR' },
  { id: 'ua2', name: 'Lat Pulldown (Puxada Alta)', category: 'main', muscles: 'Dorsal, romboides, biceps', sets: s(3, '12-15', '25kg', '90s', '3-4'), cues: ['Puxar ATE O PEITO', 'Iniciar com cotovelos', 'Apertar escapulas 1s', 'Subir 3s'] },
  { id: 'ua3', name: 'Desenvolvimento Sentado c/ Apoio', category: 'main', muscles: 'Deltoide ant./medio, triceps', sets: s(3, '12-15', '5kg cada', '75s', '3-4'), cues: ['Banco 75-80°', 'Costas COLADAS no encosto', 'Nao travar cotovelos', 'Chin tuck'], safety: 'Se lombar desgrudar → carga ALTA' },
  { id: 'ua4', name: 'Face Pulls', category: 'accessory', muscles: 'Trapezio medio/inf., rotadores ext.', sets: s(3, '15-20', '10kg', '60s', '2-3'), cues: ['Cabo na altura dos olhos', 'Abrir cotovelos', 'Apertar escapulas 2s'] },
  { id: 'ua5', name: 'Rosca Direta Halteres (Alternada)', category: 'accessory', muscles: 'Biceps', sets: s(3, '12-15 cada', '6kg cada', '60s', '3-4'), cues: ['Iniciar pelo E (mais fraco)', 'Cotovelo FIXO', 'Descer 3s'] },
  { id: 'ua6', name: 'Prancha Frontal', category: 'corrective', muscles: 'Core (isometrico)', sets: s(3, '20-30s', 'Corporal', '45s', '-'), cues: ['Corpo em linha reta', 'Gluteos ATIVOS', 'Respirar normalmente'] },
]

const lowerA_m1: readonly Exercise[] = [
  { id: 'la1', name: 'Leg Press 45°', category: 'main', muscles: 'Quadriceps, gluteos, posteriores', sets: s(3, '12-15', '60kg', '120s', '3-4'), cues: ['Costas COLADAS no encosto', 'Joelhos ~90°', 'Nao travar joelhos', 'Pes largura ombros'], safety: 'Se lombar descolar → reduzir amplitude' },
  { id: 'la2', name: 'Bulgarian Split Squat c/ Halteres', category: 'main', muscles: 'Quadriceps, gluteos, core', sets: s(3, '10-12 cada', '6kg cada', '90s', '3-4'), cues: ['Tronco ~15-20° a frente', 'Joelho alinhado com pe', 'Iniciar pela E', 'Empurrar com calcanhar'] },
  { id: 'la3', name: 'Hip Thrust', category: 'main', muscles: 'Gluteo maximo, posteriores', sets: s(3, '12-15', '20kg', '90s', '3-4'), cues: ['Costas no banco (escapulas)', 'Joelhos 90° no topo', 'Contrair GLUTEOS', 'Queixo tucked'] },
  { id: 'la4', name: 'Cadeira Extensora', category: 'accessory', muscles: 'Quadriceps (isolado)', sets: s(3, '12-15', '20kg', '60s', '3-4'), cues: ['Pad acima do tornozelo', 'Apertar quad 1s no topo', 'Descer 3s'] },
  { id: 'la5', name: 'Cadeira Flexora', category: 'accessory', muscles: 'Isquiotibiais (isolado)', sets: s(3, '12-15', '15kg', '60s', '3-4'), cues: ['Quadris alinhados eixo maquina', 'Apertar 1s no topo', 'Sem momentum'] },
  { id: 'la6', name: 'Pallof Press', category: 'corrective', muscles: 'Core anti-rotacao', sets: s(3, '10 (5s) cada', '5kg', '45s', '-'), cues: ['Semi-ajoelhado', 'Empurrar maos a frente', 'Tronco IMOVEL'] },
]

const upperB_m1: readonly Exercise[] = [
  { id: 'ub1', name: 'Chest-Supported Row', category: 'main', muscles: 'Romboides, trapezio, dorsal, biceps', sets: s(3, '12-15', '12kg cada', '90s', '3-4'), cues: ['Banco 30-45°', 'Peito no banco SEMPRE', 'Puxar p/ quadril', 'Escapulas 2s'] },
  { id: 'ub2', name: 'Supino Inclinado c/ Halteres', category: 'main', muscles: 'Peitoral superior, deltoide, triceps', sets: s(3, '12-15', '7kg cada', '90s', '3-4'), cues: ['Banco a 30°', 'Cotovelos a 45°', 'Escapulas retraidas'] },
  { id: 'ub3', name: 'Cable Row Sentado', category: 'main', muscles: 'Dorsal, romboides, trapezio, biceps', sets: s(3, '12-15', '25kg', '90s', '3-4'), cues: ['Costas RETAS', 'Puxar para abdomen baixo', 'Cotovelos colados', 'NAO inclinar a frente'] },
  { id: 'ub4', name: 'Elevacao Lateral Sentado', category: 'accessory', muscles: 'Deltoide medio', sets: s(3, '12-15', '4kg cada', '60s', '3-4'), cues: ['Levantar ate ~80-90°', 'Cotovelos levemente flexionados', 'NAO encolher ombros'] },
  { id: 'ub5', name: 'Triceps Corda no Cross', category: 'accessory', muscles: 'Triceps', sets: s(3, '12-15', '10kg', '60s', '3-4'), cues: ['Cotovelos FIXOS ao corpo', 'Abrir corda no final', 'Subir 3s'] },
  { id: 'ub6', name: 'Band Pull-Aparts', category: 'corrective', muscles: 'Retracao escapular', sets: s(3, '20', 'Elastico leve', '30s', '-'), cues: ['Bracos estendidos', 'Esticar ate tocar peito', 'Escapulas 2s', 'Ombros ABAIXADOS'] },
]

const lowerB_m1: readonly Exercise[] = [
  { id: 'lb1', name: 'Hip Thrust (Primario)', category: 'main', muscles: 'Gluteo maximo, posteriores', sets: s(3, '12-15', '25kg', '120s', '3-4'), cues: ['Exercicio #1 = mais energia', 'Mesmo protocolo Lower A'] },
  { id: 'lb2', name: 'RDL com Halteres', category: 'main', muscles: 'Isquiotibiais, gluteos, eretores', sets: s(3, '10-12', '10kg cada', '90s', '3-4'), cues: ['Joelhos LEVEMENTE flexionados', 'Empurrar quadril para TRAS', 'Coluna NEUTRA sempre', 'Descer ate joelhos'], safety: 'TETO: 30kg total. Se lombar arredondar → PARAR' },
  { id: 'lb3', name: 'Bulgarian Split Squat c/ Halteres', category: 'main', muscles: 'Quadriceps, gluteos, core', sets: s(3, '10-12 cada', '6kg cada', '90s', '3-4'), cues: ['Mesmo protocolo Lower A'] },
  { id: 'lb4', name: 'Pull-Through com Cabo', category: 'accessory', muscles: 'Gluteos, isquiotibiais', sets: s(3, '12-15', '15kg', '60s', '3-4'), cues: ['De costas p/ cabo baixo', 'Hip hinge', 'Squeeze gluteos 2s no topo'] },
  { id: 'lb5', name: 'Panturrilha no Leg Press', category: 'accessory', muscles: 'Gastrocnemio, soleo', sets: s(3, '15-20', '40kg', '45s', '2-3'), cues: ['Ponta dos pes na plataforma', 'Amplitude COMPLETA', 'Descer 3s'] },
  { id: 'lb6', name: 'Dead Bug (Core)', category: 'corrective', muscles: 'Core anti-extensao', sets: s(3, '8 cada lado', 'Corporal', '45s', '-'), cues: ['Lombar COLADA no chao', 'Estender oposto braço/perna', 'Respirar normalmente'] },
]

// --- MESOCYCLE 2: Hypertrophy (Weeks 5-8) ---

const upperA_m2: readonly Exercise[] = [
  { id: 'ua1', name: 'Supino Reto c/ Halteres', category: 'main', muscles: 'Peitoral, deltoide ant., triceps', sets: s(4, '8-12', '10-12kg cada', '90s', '2-3'), cues: ['Cotovelos a 45°', 'Escapulas retraidas', 'Arco toracico MINIMO'] },
  { id: 'ua2', name: 'Lat Pulldown', category: 'main', muscles: 'Dorsal, romboides, biceps', sets: s(4, '8-12', '30-35kg', '90s', '2-3'), cues: ['Puxar ATE O PEITO', 'Apertar escapulas 1s'] },
  { id: 'ua3', name: 'Desenvolvimento Sentado c/ Apoio', category: 'main', muscles: 'Deltoide ant./medio, triceps', sets: s(3, '8-12', '7-8kg cada', '75s', '2-3'), cues: ['Banco 75-80°', 'Costas COLADAS'] },
  { id: 'ua4', name: 'Face Pulls', category: 'accessory', muscles: 'Trapezio medio/inf., rotadores ext.', sets: s(3, '15-20', '12-15kg', '60s', '2-3'), cues: ['Apertar escapulas 2s'] },
  { id: 'ua5', name: 'Rosca Direta Halteres (Alternada)', category: 'accessory', muscles: 'Biceps', sets: s(3, '8-12', '8kg cada', '60s', '2-3'), cues: ['Iniciar pelo E', 'Descer 3s'] },
  { id: 'ua7', name: 'Triceps Testa c/ Barra W', category: 'accessory', muscles: 'Triceps (cabeca longa)', sets: s(3, '8-12', '12kg', '60s', '2-3'), cues: ['Descer barra em direcao a TESTA', 'Cotovelos FIXOS', 'Descer 3s'], isNew: true },
  { id: 'ua6', name: 'Prancha Frontal', category: 'corrective', muscles: 'Core (isometrico)', sets: s(3, '30-45s', 'Corporal', '45s', '-'), cues: ['Gluteos ATIVOS', 'Respirar normalmente'] },
]

const lowerA_m2: readonly Exercise[] = [
  { id: 'la1', name: 'Leg Press 45°', category: 'main', muscles: 'Quadriceps, gluteos, posteriores', sets: s(4, '8-12', '80-90kg', '120s', '2-3'), cues: ['Costas COLADAS', 'Joelhos ~90°'] },
  { id: 'la2', name: 'Bulgarian Split Squat c/ Halteres', category: 'main', muscles: 'Quadriceps, gluteos, core', sets: s(3, '8-12 cada', '8-10kg cada', '90s', '2-3'), cues: ['Iniciar pela E', 'Empurrar com calcanhar'] },
  { id: 'la3', name: 'Hip Thrust', category: 'main', muscles: 'Gluteo maximo, posteriores', sets: s(4, '8-12', '35-40kg', '90s', '2-3'), cues: ['Contrair GLUTEOS', 'Descer 3s'] },
  { id: 'la4', name: 'Cadeira Extensora', category: 'accessory', muscles: 'Quadriceps (isolado)', sets: s(3, '10-12', '25-30kg', '60s', '2-3'), cues: ['Apertar quad 1s no topo'] },
  { id: 'la5', name: 'Cadeira Flexora', category: 'accessory', muscles: 'Isquiotibiais (isolado)', sets: s(3, '10-12', '20-25kg', '60s', '2-3'), cues: ['Sem momentum'] },
  { id: 'la6', name: 'Pallof Press', category: 'corrective', muscles: 'Core anti-rotacao', sets: s(3, '10 (5s) cada', '7-8kg', '45s', '-'), cues: ['Tronco IMOVEL'] },
  { id: 'la7', name: "Farmer's Walk", category: 'accessory', muscles: 'Core integrado, grip, ombros', sets: s(3, '30m', '16-20kg cada', '60s', '-'), cues: ['Postura ERETA', 'Core ativado', 'Passos curtos'], isNew: true },
]

const upperB_m2: readonly Exercise[] = [
  { id: 'ub1', name: 'Chest-Supported Row', category: 'main', muscles: 'Romboides, trapezio, dorsal, biceps', sets: s(4, '8-12', '14-16kg cada', '90s', '2-3'), cues: ['Peito no banco SEMPRE', 'Escapulas 2s'] },
  { id: 'ub2', name: 'Supino Inclinado c/ Halteres', category: 'main', muscles: 'Peitoral superior, deltoide, triceps', sets: s(4, '8-12', '10-12kg cada', '90s', '2-3'), cues: ['Banco a 30°'] },
  { id: 'ub3', name: 'Cable Row Sentado', category: 'main', muscles: 'Dorsal, romboides, trapezio, biceps', sets: s(3, '8-12', '30-35kg', '90s', '2-3'), cues: ['Costas RETAS', 'NAO inclinar a frente'] },
  { id: 'ub4', name: 'Elevacao Lateral Sentado', category: 'accessory', muscles: 'Deltoide medio', sets: s(3, '10-12', '5-6kg cada', '60s', '2-3'), cues: ['NAO encolher ombros'] },
  { id: 'ub7', name: 'Rosca Martelo', category: 'accessory', muscles: 'Biceps, braquiorradial', sets: s(3, '8-12', '8kg cada', '60s', '2-3'), cues: ['Palmas PARA DENTRO', 'Iniciar pelo E', 'Descer 3s'], isNew: true },
  { id: 'ub5', name: 'Triceps Corda no Cross', category: 'accessory', muscles: 'Triceps', sets: s(3, '10-12', '12-15kg', '60s', '2-3'), cues: ['Abrir corda no final'] },
  { id: 'ub6', name: 'Band Pull-Aparts', category: 'corrective', muscles: 'Retracao escapular', sets: s(3, '20', 'Elastico medio', '30s', '-'), cues: ['Ombros ABAIXADOS'] },
]

const lowerB_m2: readonly Exercise[] = [
  { id: 'lb1', name: 'Hip Thrust (Primario)', category: 'main', muscles: 'Gluteo maximo, posteriores', sets: s(4, '8-12', '40-45kg', '120s', '2-3'), cues: ['Squeeze gluteos FORTE'] },
  { id: 'lb2', name: 'RDL com Halteres', category: 'main', muscles: 'Isquiotibiais, gluteos, eretores', sets: s(4, '8-12', '14-16kg cada', '90s', '2-3'), cues: ['Coluna NEUTRA', 'Hip hinge'], safety: 'Coluna neutra SEMPRE' },
  { id: 'lb3', name: 'Bulgarian Split Squat c/ Halteres', category: 'main', muscles: 'Quadriceps, gluteos, core', sets: s(3, '8-12 cada', '10-12kg cada', '90s', '2-3'), cues: ['Iniciar pela E'] },
  { id: 'lb4', name: 'Pull-Through com Cabo', category: 'accessory', muscles: 'Gluteos, isquiotibiais', sets: s(3, '10-12', '20-25kg', '60s', '2-3'), cues: ['Squeeze gluteos 2s'] },
  { id: 'lb5', name: 'Panturrilha no Leg Press', category: 'accessory', muscles: 'Gastrocnemio, soleo', sets: s(4, '12-15', '50-60kg', '45s', '2-3'), cues: ['Amplitude COMPLETA'] },
  { id: 'lb6', name: 'Dead Bug (c/ elastico)', category: 'corrective', muscles: 'Core anti-extensao', sets: s(3, '8 cada lado', 'Elastico leve', '45s', '-'), cues: ['Lombar COLADA no chao'] },
]

// --- MESOCYCLE 3: Strength-Hypertrophy (Weeks 9-12) ---

const upperA_m3: readonly Exercise[] = [
  { id: 'ua1', name: 'Supino Reto c/ Halteres', category: 'main', muscles: 'Peitoral, deltoide ant., triceps', sets: s(4, '6-10', '14-16kg cada', '120s', '1-2'), cues: ['Cotovelos a 45°', 'Arco toracico MINIMO'] },
  { id: 'ua2', name: 'Lat Pulldown', category: 'main', muscles: 'Dorsal, romboides, biceps', sets: s(4, '6-10', '40-45kg', '120s', '1-2'), cues: ['Puxar ATE O PEITO'] },
  { id: 'ua3', name: 'Desenvolvimento Sentado c/ Apoio', category: 'main', muscles: 'Deltoide ant./medio, triceps', sets: s(3, '8-10', '10-12kg cada', '90s', '2'), cues: ['Costas COLADAS'] },
  { id: 'ua4', name: 'Face Pulls', category: 'accessory', muscles: 'Trapezio medio/inf., rotadores ext.', sets: s(3, '12-15', '15-17kg', '60s', '2'), cues: ['Apertar escapulas 2s'] },
  { id: 'ua5', name: 'Rosca Direta Halteres (Alternada)', category: 'accessory', muscles: 'Biceps', sets: s(3, '8-10', '10kg cada', '60s', '2'), cues: ['Iniciar pelo E'] },
  { id: 'ua7', name: 'Triceps Testa c/ Barra W', category: 'accessory', muscles: 'Triceps (cabeca longa)', sets: s(3, '8-10', '16-18kg', '60s', '2'), cues: ['Cotovelos FIXOS'] },
  { id: 'ua6', name: 'Prancha Frontal', category: 'corrective', muscles: 'Core (isometrico)', sets: s(3, '45-60s', 'Corporal', '45s', '-'), cues: ['Gluteos ATIVOS'] },
]

const lowerA_m3: readonly Exercise[] = [
  { id: 'la1', name: 'Leg Press 45°', category: 'main', muscles: 'Quadriceps, gluteos, posteriores', sets: s(4, '6-10', '110-130kg', '150s', '1-2'), cues: ['Costas COLADAS'] },
  { id: 'la2', name: 'Bulgarian Split Squat c/ Halteres', category: 'main', muscles: 'Quadriceps, gluteos, core', sets: s(3, '8-10 cada', '12-14kg cada', '90s', '2'), cues: ['Iniciar pela E'] },
  { id: 'la3', name: 'Hip Thrust', category: 'main', muscles: 'Gluteo maximo, posteriores', sets: s(4, '6-10', '50-60kg', '120s', '1-2'), cues: ['Contrair GLUTEOS'] },
  { id: 'la4', name: 'Cadeira Extensora', category: 'accessory', muscles: 'Quadriceps (isolado)', sets: s(3, '8-10', '35-40kg', '60s', '2'), cues: ['Apertar quad 1s'] },
  { id: 'la5', name: 'Cadeira Flexora', category: 'accessory', muscles: 'Isquiotibiais (isolado)', sets: s(3, '8-10', '25-30kg', '60s', '2'), cues: ['Sem momentum'] },
  { id: 'la6', name: 'Pallof Press', category: 'corrective', muscles: 'Core anti-rotacao', sets: s(3, '10 (5s) cada', '10kg', '45s', '-'), cues: ['Tronco IMOVEL'] },
  { id: 'la7', name: "Farmer's Walk", category: 'accessory', muscles: 'Core integrado, grip, ombros', sets: s(3, '30m', '20-24kg cada', '60s', '-'), cues: ['Postura ERETA'] },
]

const upperB_m3: readonly Exercise[] = [
  { id: 'ub1', name: 'Chest-Supported Row', category: 'main', muscles: 'Romboides, trapezio, dorsal, biceps', sets: s(4, '6-10', '18-20kg cada', '120s', '1-2'), cues: ['Escapulas 2s'] },
  { id: 'ub2', name: 'Supino Inclinado c/ Halteres', category: 'main', muscles: 'Peitoral superior, deltoide, triceps', sets: s(4, '6-10', '14-16kg cada', '120s', '1-2'), cues: ['Banco a 30°'] },
  { id: 'ub3', name: 'Cable Row Sentado', category: 'main', muscles: 'Dorsal, romboides, trapezio, biceps', sets: s(3, '8-10', '40-45kg', '90s', '2'), cues: ['Costas RETAS'] },
  { id: 'ub4', name: 'Elevacao Lateral Sentado', category: 'accessory', muscles: 'Deltoide medio', sets: s(3, '10-12', '7-8kg cada', '60s', '2'), cues: ['NAO encolher ombros'] },
  { id: 'ub7', name: 'Rosca Martelo', category: 'accessory', muscles: 'Biceps, braquiorradial', sets: s(3, '8-10', '10-12kg cada', '60s', '2'), cues: ['Palmas PARA DENTRO'] },
  { id: 'ub5', name: 'Triceps Corda no Cross', category: 'accessory', muscles: 'Triceps', sets: s(3, '8-10', '17-20kg', '60s', '2'), cues: ['Abrir corda no final'] },
  { id: 'ub6', name: 'Band Pull-Aparts', category: 'corrective', muscles: 'Retracao escapular', sets: s(3, '20', 'Elastico medio-forte', '30s', '-'), cues: ['Ombros ABAIXADOS'] },
]

const lowerB_m3: readonly Exercise[] = [
  { id: 'lb1', name: 'Hip Thrust (Primario)', category: 'main', muscles: 'Gluteo maximo, posteriores', sets: s(4, '6-10', '60-70kg', '150s', '1-2'), cues: ['Squeeze FORTE'] },
  { id: 'lb2', name: 'RDL com Halteres', category: 'main', muscles: 'Isquiotibiais, gluteos, eretores', sets: s(4, '6-10', '18-20kg cada', '120s', '1-2'), cues: ['Coluna NEUTRA'], safety: 'NUNCA arredondar lombar' },
  { id: 'lb3', name: 'Bulgarian Split Squat c/ Halteres', category: 'main', muscles: 'Quadriceps, gluteos, core', sets: s(3, '8-10 cada', '14-16kg cada', '90s', '2'), cues: ['Iniciar pela E'] },
  { id: 'lb4', name: 'Pull-Through com Cabo', category: 'accessory', muscles: 'Gluteos, isquiotibiais', sets: s(3, '8-10', '25-30kg', '60s', '2'), cues: ['Squeeze gluteos 2s'] },
  { id: 'lb5', name: 'Panturrilha no Leg Press', category: 'accessory', muscles: 'Gastrocnemio, soleo', sets: s(4, '12-15', '70-80kg', '45s', '2'), cues: ['Amplitude COMPLETA'] },
  { id: 'lb6', name: 'Dead Bug (c/ halter leve)', category: 'corrective', muscles: 'Core anti-extensao', sets: s(3, '8 cada lado', '2-3kg', '45s', '-'), cues: ['Lombar COLADA'] },
]

// --- Session builders ---

type MesocycleExercises = Record<string, readonly Exercise[]>

const EXERCISES_BY_MESO: Record<Mesocycle, MesocycleExercises> = {
  1: { 'upper-a': upperA_m1, 'lower-a': lowerA_m1, 'upper-b': upperB_m1, 'lower-b': lowerB_m1 },
  2: { 'upper-a': upperA_m2, 'lower-a': lowerA_m2, 'upper-b': upperB_m2, 'lower-b': lowerB_m2 },
  3: { 'upper-a': upperA_m3, 'lower-a': lowerA_m3, 'upper-b': upperB_m3, 'lower-b': lowerB_m3 },
}

const SESSION_META: Record<string, Omit<TrainingSession, 'exercises'>> = {
  'upper-a': { id: 'upper-a', name: 'Upper A', shortName: 'UA', weekday: 1, focus: 'Empurrar horizontal + Puxar vertical + Ombros + Core', duration: '65-70 min', warmup: WARMUP, cooldown: COOLDOWN_UPPER },
  'lower-a': { id: 'lower-a', name: 'Lower A', shortName: 'LA', weekday: 2, focus: 'Quadriceps dominante + Gluteos + Core', duration: '65-70 min', warmup: WARMUP, cooldown: COOLDOWN_LOWER_A },
  'upper-b': { id: 'upper-b', name: 'Upper B', shortName: 'UB', weekday: 4, focus: 'Puxar horizontal + Empurrar inclinado + Ombros laterais + Core', duration: '65-70 min', warmup: WARMUP, cooldown: COOLDOWN_UPPER, extraWarmup: 'Y-T-W Prone no banco (2x8 cada posicao) +3 min' },
  'lower-b': { id: 'lower-b', name: 'Lower B', shortName: 'LB', weekday: 5, focus: 'Hip-hinge dominante + Gluteos + Unilateral + Core', duration: '65-70 min', warmup: WARMUP, cooldown: COOLDOWN_LOWER_B },
}

export const getTrainingSession = (sessionId: string, meso: Mesocycle): TrainingSession => {
  const meta = SESSION_META[sessionId]
  const exercises = EXERCISES_BY_MESO[meso][sessionId]
  return { ...meta, exercises }
}

export const LISS_SESSIONS: readonly LissSession[] = [
  { id: 'liss', name: 'LISS Cardio (Zona 2)', weekday: 3, zone: 'Zona 2', bpmRange: '108-126 bpm', duration: '30-40 min', options: ['Caminhada rapida 5.5-6.5 km/h', 'Bike ergometrica (reclinada preferida)', 'Eliptico'] },
  { id: 'liss', name: 'LISS Cardio (Zona 2)', weekday: 6, zone: 'Zona 2', bpmRange: '108-126 bpm', duration: '30-40 min', options: ['Caminhada rapida 5.5-6.5 km/h', 'Bike ergometrica (reclinada preferida)', 'Eliptico'] },
]

export const MESOCYCLE_INFO: Record<Mesocycle, { name: string; weeks: string; intensity: string; reps: string; rir: string }> = {
  1: { name: 'Adaptacao', weeks: 'Sem 1-4', intensity: '60-70% 1RM', reps: '10-15', rir: '3-4' },
  2: { name: 'Hipertrofia', weeks: 'Sem 5-8', intensity: '65-75% 1RM', reps: '8-12', rir: '2-3' },
  3: { name: 'Forca-Hipertrofia', weeks: 'Sem 9-12', intensity: '75-85% 1RM', reps: '6-10', rir: '1-2' },
}

// Map weekday to session type
const WEEKDAY_TO_SESSION: Record<number, string | null> = {
  0: null,    // Domingo — descanso
  1: 'upper-a',
  2: 'lower-a',
  3: null,    // Quarta — LISS
  4: 'upper-b',
  5: 'lower-b',
  6: null,    // Sabado — LISS
}

export const getTodaySessionId = (date: Date): string | null =>
  WEEKDAY_TO_SESSION[date.getDay()] ?? null

export const isLissDay = (date: Date): boolean =>
  date.getDay() === 3 || date.getDay() === 6

export const isRestDay = (date: Date): boolean =>
  date.getDay() === 0
