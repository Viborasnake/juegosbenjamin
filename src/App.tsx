import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from './lib/supabase'

type CategoryId = 'letters' | 'numbers' | 'world' | 'planets'
type GameId = 'vowels' | 'alphabet' | 'numbers' | 'animals' | 'vehicles' | 'food' | 'emotions' | 'planets'
type Mode = 'explore' | 'memory' | 'find' | 'space'
type Locale = 'es' | 'en'

type LearningItem = {
  id: number
  game: GameId
  symbol: string
  spoken_text: string
  position: number
}

type MemoryCard = LearningItem & { cardId: string }

const letterNames = [
  ['A', 'a'], ['B', 'be'], ['C', 'ce'], ['D', 'de'], ['E', 'e'], ['F', 'efe'], ['G', 'ge'],
  ['H', 'hache'], ['I', 'i'], ['J', 'jota'], ['K', 'ka'], ['L', 'ele'], ['M', 'eme'], ['N', 'ene'],
  ['Ñ', 'eñe'], ['O', 'o'], ['P', 'pe'], ['Q', 'cu'], ['R', 'erre'], ['S', 'ese'], ['T', 'te'],
  ['U', 'u'], ['V', 'uve'], ['W', 'doble uve'], ['X', 'equis'], ['Y', 'y griega'], ['Z', 'zeta'],
]

const numberNames = ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce']
const animals = [['🐶', 'perro'], ['🐱', 'gato'], ['🐮', 'vaca'], ['🐷', 'chancho'], ['🐴', 'caballo'], ['🐑', 'oveja'], ['🐘', 'elefante'], ['🦁', 'león'], ['🐵', 'mono'], ['🐸', 'rana']]
const vehicles = [['🚗', 'auto'], ['🚌', 'autobús'], ['🚂', 'tren'], ['🚲', 'bicicleta'], ['✈️', 'avión'], ['🚁', 'helicóptero'], ['🚢', 'barco'], ['🚜', 'tractor'], ['🚒', 'camión de bomberos'], ['🏍️', 'moto']]
const foods = [['🍎', 'manzana'], ['🍌', 'plátano'], ['🍓', 'frutilla'], ['🍊', 'naranja'], ['🍇', 'uva'], ['🍉', 'sandía'], ['🥕', 'zanahoria'], ['🍅', 'tomate'], ['🌽', 'choclo'], ['🥔', 'papa']]
const emotions = [['😄', 'feliz'], ['😢', 'triste'], ['😠', 'enojado'], ['😨', 'asustado'], ['😲', 'sorprendido'], ['😴', 'cansado'], ['🥰', 'cariño'], ['😳', 'tímido'], ['😂', 'risa'], ['😌', 'tranquilo']]
const planets = [['sol', 'sol'], ['mercurio', 'mercurio'], ['venus', 'venus'], ['tierra', 'tierra'], ['marte', 'marte'], ['jupiter', 'júpiter'], ['saturno', 'saturno'], ['urano', 'urano'], ['neptuno', 'neptuno'], ['pluton', 'plutón'], ['luna', 'luna'], ['asteroide', 'asteroide']]

const fallbackItems: LearningItem[] = [
  ...['A', 'E', 'I', 'O', 'U'].map((symbol, index) => ({
    id: index + 1, game: 'vowels' as const, symbol, spoken_text: symbol.toLowerCase(), position: index + 1,
  })),
  ...letterNames.map(([symbol, spoken_text], index) => ({
    id: index + 101, game: 'alphabet' as const, symbol, spoken_text, position: index + 1,
  })),
  ...numberNames.map((spoken_text, index) => ({
    id: index + 201, game: 'numbers' as const, symbol: String(index + 1), spoken_text, position: index + 1,
  })),
  ...animals.map(([symbol, spoken_text], index) => ({
    id: index + 301, game: 'animals' as const, symbol, spoken_text, position: index + 1,
  })),
  ...vehicles.map(([symbol, spoken_text], index) => ({
    id: index + 401, game: 'vehicles' as const, symbol, spoken_text, position: index + 1,
  })),
  ...foods.map(([symbol, spoken_text], index) => ({
    id: index + 501, game: 'food' as const, symbol, spoken_text, position: index + 1,
  })),
  ...emotions.map(([symbol, spoken_text], index) => ({
    id: index + 601, game: 'emotions' as const, symbol, spoken_text, position: index + 1,
  })),
  ...planets.map(([symbol, spoken_text], index) => ({
    id: index + 701, game: 'planets' as const, symbol, spoken_text, position: index + 1,
  })),
]

const categoryMeta = {
  letters: { eyebrow: 'a · b · c', title: { es: 'Letras', en: 'Letters' }, icon: '🎈', color: 'coral' },
  numbers: { eyebrow: '1 · 2 · 3', title: { es: 'Números', en: 'Numbers' }, icon: '🚂', color: 'blue' },
  world: { eyebrow: '🐶 · 🍎 · 😄', title: { es: 'Mundo', en: 'World' }, icon: '🌎', color: 'green' },
  planets: { eyebrow: '☀️ · 🌍 · 🪐', title: { es: 'Planetas', en: 'Planets' }, icon: '🪐', color: 'navy' },
} as const

const gameMeta = {
  vowels: { title: { es: 'Vocales', en: 'Vowels' }, prompt: { es: 'Toca una vocal', en: 'Tap a vowel' }, icon: '🌈', color: 'coral' },
  alphabet: { title: { es: 'Abecedario', en: 'Alphabet' }, prompt: { es: 'Toca una letra', en: 'Tap a letter' }, icon: '🐝', color: 'purple' },
  numbers: { title: { es: 'Números', en: 'Numbers' }, prompt: { es: 'Toca un número', en: 'Tap a number' }, icon: '🚂', color: 'blue' },
  animals: { title: { es: 'Animales', en: 'Animals' }, prompt: { es: 'Toca un animal', en: 'Tap an animal' }, icon: '🐶', color: 'green' },
  vehicles: { title: { es: 'Vehículos', en: 'Vehicles' }, prompt: { es: 'Toca un vehículo', en: 'Tap a vehicle' }, icon: '🚗', color: 'orange' },
  food: { title: { es: 'Frutas y verduras', en: 'Fruit & veg' }, prompt: { es: 'Toca una fruta o verdura', en: 'Tap a fruit or veggie' }, icon: '🍎', color: 'yellow' },
  emotions: { title: { es: 'Emociones', en: 'Emotions' }, prompt: { es: 'Toca una emoción', en: 'Tap a feeling' }, icon: '😄', color: 'pink' },
  planets: { title: { es: 'Planetas', en: 'Planets' }, prompt: { es: 'Toca un planeta', en: 'Tap a planet' }, icon: '🪐', color: 'navy' },
} as const

const englishLetterNames = ['ay', 'bee', 'see', 'dee', 'ee', 'ef', 'gee', 'aitch', 'eye', 'jay', 'kay', 'el', 'em', 'en', 'oh', 'pee', 'cue', 'ar', 'ess', 'tee', 'you', 'vee', 'double you', 'ex', 'wye', 'zee']

const englishNames: Record<GameId, Record<string, string>> = {
  vowels: { A: 'ay', E: 'ee', I: 'eye', O: 'oh', U: 'you' },
  alphabet: Object.fromEntries('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter, index) => [letter, englishLetterNames[index]])),
  numbers: Object.fromEntries(['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'].map((name, index) => [String(index + 1), name])),
  animals: Object.fromEntries(['dog', 'cat', 'cow', 'pig', 'horse', 'sheep', 'elephant', 'lion', 'monkey', 'frog'].map((name, index) => [animals[index][0], name])),
  vehicles: Object.fromEntries(['car', 'bus', 'train', 'bicycle', 'airplane', 'helicopter', 'boat', 'tractor', 'fire truck', 'motorcycle'].map((name, index) => [vehicles[index][0], name])),
  food: Object.fromEntries(['apple', 'banana', 'strawberry', 'orange', 'grapes', 'watermelon', 'carrot', 'tomato', 'corn', 'potato'].map((name, index) => [foods[index][0], name])),
  emotions: Object.fromEntries(['happy', 'sad', 'angry', 'scared', 'surprised', 'sleepy', 'love', 'shy', 'laughing', 'calm'].map((name, index) => [emotions[index][0], name])),
  planets: Object.fromEntries(['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'moon', 'asteroid'].map((name, index) => [planets[index][0], name])),
}

const audioFile = (locale: Locale, game: GameId, position: number) =>
  `${import.meta.env.BASE_URL}audio/${locale}/${game}/${position}.wav`

const spokenFor = (item: LearningItem, locale: Locale) =>
  locale === 'en' ? englishNames[item.game][item.symbol] ?? item.spoken_text : item.spoken_text

const shownSymbol = (item: LearningItem) =>
  item.game === 'vowels' || item.game === 'alphabet' ? item.symbol.toLocaleLowerCase('es') : item.symbol

const titleName = (item: LearningItem, locale: Locale) => {
  const name = spokenFor(item, locale)
  return name.charAt(0).toLocaleUpperCase('es') + name.slice(1)
}

function ItemArt({ item }: { item: LearningItem }) {
  if (item.game === 'planets') {
    return <img className="item-art" src={`${import.meta.env.BASE_URL}planets/${item.symbol}.png`} alt="" draggable={false} />
  }
  return shownSymbol(item)
}

function shuffle<T>(items: T[]) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[randomIndex]] = [result[randomIndex], result[index]]
  }
  return result
}

function useLearningItems() {
  const [items, setItems] = useState(fallbackItems)

  useEffect(() => {
    if (!supabase) return
    let active = true
    supabase.from('learning_items').select('id, game, symbol, spoken_text, position').order('position')
      .then(({ data, error }) => {
        if (!active || error || !data?.length) return
        const valid = data.filter((item): item is LearningItem =>
          ['vowels', 'alphabet', 'numbers', 'animals', 'vehicles', 'food', 'emotions', 'planets'].includes(item.game))
        if (valid.length) {
          const remoteGames = new Set(valid.map((item) => item.game))
          setItems([...valid, ...fallbackItems.filter((item) => !remoteGames.has(item.game))])
        }
      })
    return () => { active = false }
  }, [])

  return items
}

function useSpeech(locale: Locale) {
  const [speaking, setSpeaking] = useState<string | null>(null)
  const clearTimer = useRef<number | undefined>(undefined)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const speak = useCallback((text: string, symbol: string, audioPath: string) => {
    window.clearTimeout(clearTimer.current)
    audioRef.current?.pause()
    audioRef.current = null
    setSpeaking(symbol)

    const finish = () => setSpeaking((current) => current === symbol ? null : current)
    let fallbackStarted = false
    const playSystemVoice = () => {
      if (fallbackStarted) return
      fallbackStarted = true
      if (!('speechSynthesis' in window)) { finish(); return }
      try {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        const language = locale === 'es' ? 'es-CL' : 'en-US'
        const voices = window.speechSynthesis.getVoices()
        const matchingVoice = voices.find((voice) => voice.lang.toLowerCase() === language.toLowerCase())
          ?? voices.find((voice) => voice.lang.toLowerCase().startsWith(locale))
        utterance.lang = language
        utterance.rate = locale === 'es' ? 0.76 : 0.84
        utterance.pitch = 1
        utterance.voice = matchingVoice ?? null
        utterance.onend = finish
        utterance.onerror = finish
        window.speechSynthesis.speak(utterance)
        clearTimer.current = window.setTimeout(finish, 2200)
      } catch {
        finish()
      }
    }

    try {
      const audio = new Audio(audioPath)
      audioRef.current = audio
      audio.onended = finish
      audio.onerror = playSystemVoice
      void audio.play().catch(playSystemVoice)
    } catch {
      playSystemVoice()
    }
  }, [locale])

  useEffect(() => () => {
    window.clearTimeout(clearTimer.current)
    audioRef.current?.pause()
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }, [])
  return { speak, speaking }
}

function LanguageSwitch({ locale, onLocale }: { locale: Locale; onLocale: (locale: Locale) => void }) {
  return (
    <div className="language-switch" aria-label="Idioma / Language">
      <button type="button" className={locale === 'es' ? 'active' : ''} onClick={() => onLocale('es')}>ES</button>
      <button type="button" className={locale === 'en' ? 'active' : ''} onClick={() => onLocale('en')}>EN</button>
    </div>
  )
}

function Home({ onSelect, locale }: { onSelect: (category: CategoryId) => void; locale: Locale }) {
  return (
    <main className="home-shell">
      <header className="brand">
        <span className="brand-sun" aria-hidden="true">☀️</span>
        <div><p>{locale === 'es' ? 'Hola, Benjamín' : 'Hi, Benjamín'}</p><h1>{locale === 'es' ? '¿Jugamos?' : 'Let’s play!'}</h1></div>
      </header>
      <section className="game-grid" aria-label="Elige una categoría">
        {(Object.keys(categoryMeta) as CategoryId[]).map((categoryId) => {
          const category = categoryMeta[categoryId]
          const title = category.title[locale]
          return (
            <button className={`game-card ${category.color} ${categoryId}`} key={categoryId} type="button"
              onClick={() => onSelect(categoryId)} aria-label={`${locale === 'es' ? 'Jugar con' : 'Play with'} ${title}`}>
              <span className="game-icon" aria-hidden="true">{category.icon}</span>
              <span className="game-copy"><small>{category.eyebrow}</small><strong>{title}</strong>
                <span className="play-label">{locale === 'es' ? 'Jugar' : 'Play'} <b aria-hidden="true">→</b></span></span>
            </button>
          )
        })}
      </section>
      <p className="grownup-note">{locale === 'es' ? 'Toca una tarjeta para comenzar' : 'Tap a card to begin'}</p>
    </main>
  )
}

const subgames: Record<'letters' | 'world', { id: GameId; icon: string; hint: string; choiceClass: string }[]> = {
  letters: [
    { id: 'vowels', icon: '🌈', hint: 'a · e · i · o · u', choiceClass: 'vowels-choice' },
    { id: 'alphabet', icon: '🐝', hint: 'a · b · c · d · e...', choiceClass: 'alphabet-choice' },
  ],
  world: [
    { id: 'animals', icon: '🐶', hint: '🐶 · 🐱 · 🐮', choiceClass: 'animals-choice' },
    { id: 'vehicles', icon: '🚗', hint: '🚗 · 🚌 · 🚂', choiceClass: 'vehicles-choice' },
    { id: 'food', icon: '🍎', hint: '🍎 · 🥕 · 🍌', choiceClass: 'food-choice' },
    { id: 'emotions', icon: '😄', hint: '😄 · 😢 · 😠', choiceClass: 'emotions-choice' },
  ],
}

function SubMenu({ category, locale, onSelect, onBack }: { category: 'letters' | 'world'; locale: Locale; onSelect: (game: GameId) => void; onBack: () => void }) {
  return (
    <main className={`choice-shell ${category === 'letters' ? 'theme-coral' : 'theme-green'}`}>
      <header className="play-header">
        <button className="back-button" type="button" onClick={onBack} aria-label="Volver al inicio">←</button>
        <div><small>{locale === 'es' ? 'Elige un juego' : 'Choose a game'}</small><h1>{categoryMeta[category].title[locale]}</h1></div>
        <span className="header-slot" aria-hidden="true" />
      </header>
      <section className={`subgame-grid ${category}`}>
        {subgames[category].map((option) => (
          <button className={`subgame-card ${option.choiceClass}`} key={option.id} type="button" onClick={() => onSelect(option.id)}>
            <span aria-hidden="true">{option.icon}</span><small>{option.hint}</small>
            <strong>{gameMeta[option.id].title[locale]}</strong><b>{locale === 'es' ? 'Jugar' : 'Play'} →</b>
          </button>
        ))}
      </section>
    </main>
  )
}

function MemoryGame({ items, game, locale, speak }: { items: LearningItem[]; game: GameId; locale: Locale; speak: (text: string, symbol: string, audioPath: string) => void }) {
  const [round, setRound] = useState(0)
  const memoryItems = useMemo(() => shuffle(items).slice(0, 5), [items, round])
  const deck = useMemo(() => shuffle(memoryItems.flatMap((item) => [
    { ...item, cardId: `${item.id}-a` }, { ...item, cardId: `${item.id}-b` },
  ])), [memoryItems])
  const [openCards, setOpenCards] = useState<string[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [locked, setLocked] = useState(false)

  useEffect(() => { setOpenCards([]); setMatched([]); setLocked(false) }, [game, round])

  const selectCard = (card: MemoryCard) => {
    if (locked || openCards.includes(card.cardId) || matched.includes(card.id)) return
    const spokenText = spokenFor(card, locale)
    if (!openCards.length) {
      setOpenCards([card.cardId])
      speak(spokenText, card.symbol, audioFile(locale, card.game, card.position))
      return
    }
    const firstCard = deck.find((candidate) => candidate.cardId === openCards[0])
    setOpenCards([openCards[0], card.cardId])
    if (firstCard?.id === card.id) {
      setMatched((current) => [...current, card.id])
      window.setTimeout(() => setOpenCards([]), 450)
    } else {
      setLocked(true)
      window.setTimeout(() => { setOpenCards([]); setLocked(false) }, 900)
    }
    speak(spokenText, card.symbol, audioFile(locale, card.game, card.position))
  }

  const won = memoryItems.length > 0 && matched.length === memoryItems.length
  return (
    <section className="memory-wrap" aria-label={`${locale === 'es' ? 'Memorice de' : 'Memory game with'} ${gameMeta[game].title[locale]}`}>
      <div className="memory-grid">
        {deck.map((card) => {
          const visible = openCards.includes(card.cardId) || matched.includes(card.id)
          return (
            <button className={`memory-card ${visible ? 'is-open' : ''} ${matched.includes(card.id) ? 'is-matched' : ''}`}
              key={card.cardId} type="button" onClick={() => selectCard(card)}
              aria-label={visible ? spokenFor(card, locale) : (locale === 'es' ? 'Carta escondida' : 'Hidden card')} aria-pressed={visible}>
              <span className="card-back" aria-hidden="true">{card.game === 'numbers' ? '★' : '●'}</span>
              <span className="card-front">{card.game === 'planets' ? <><ItemArt item={card} /><small className="card-name">{titleName(card, locale)}</small></> : <ItemArt item={card} />}</span>
            </button>
          )
        })}
      </div>
      {won && <div className="win-card" role="status"><span aria-hidden="true">🎉</span><strong>{locale === 'es' ? '¡Muy bien!' : 'Great job!'}</strong>
        <button type="button" onClick={() => setRound((value) => value + 1)}>{locale === 'es' ? 'Otra vez' : 'Play again'}</button></div>}
    </section>
  )
}

function FindGame({ items, locale, speak }: { items: LearningItem[]; locale: Locale; speak: (text: string, symbol: string, audioPath: string) => void }) {
  const [round, setRound] = useState(0)
  const { target, choices } = useMemo(() => {
    const pool = shuffle(items)
    const nextTarget = pool[0]
    const nextChoices = shuffle([nextTarget, ...pool.slice(1, 3)].filter(Boolean))
    return { target: nextTarget, choices: nextChoices }
  }, [items, round])
  const [picked, setPicked] = useState<number | null>(null)
  const [wrong, setWrong] = useState<number | null>(null)
  const found = Boolean(target && picked === target.id)

  const ask = useCallback(() => {
    if (!target) return
    speak(spokenFor(target, locale), target.symbol, audioFile(locale, target.game, target.position))
  }, [target, locale, speak])

  useEffect(() => {
    setPicked(null)
    setWrong(null)
    const timer = window.setTimeout(ask, 280)
    return () => window.clearTimeout(timer)
  }, [round, ask])

  const choose = (item: LearningItem) => {
    if (!target || found) return
    if (item.id === target.id) {
      setPicked(item.id)
      setWrong(null)
      speak(spokenFor(item, locale), item.symbol, audioFile(locale, item.game, item.position))
      return
    }
    setWrong(item.id)
    window.setTimeout(() => setWrong(null), 420)
  }

  if (!target) return null
  return (
    <section className="find-wrap" aria-label={locale === 'es' ? 'Encuentra' : 'Find it'}>
      <button className="find-prompt" type="button" onClick={ask} aria-label={`${locale === 'es' ? 'Escuchar' : 'Listen'} ${titleName(target, locale)}`}>
        <small>{locale === 'es' ? '¿Dónde está?' : 'Where is it?'}</small>
        <strong>{titleName(target, locale)}</strong>
      </button>
      <div className="find-choices">
        {choices.map((item) => (
          <button
            className={`learning-card find-card ${item.game === 'planets' ? 'has-art' : ''} ${item.id === picked ? 'is-correct' : ''} ${item.id === wrong ? 'is-wrong' : ''}`}
            key={item.id} type="button" onClick={() => choose(item)}
            aria-label={titleName(item, locale)} aria-pressed={item.id === picked}>
            <span className="card-art"><ItemArt item={item} /></span>
            {item.game === 'planets' ? <small className="card-name">{titleName(item, locale)}</small> : null}
          </button>
        ))}
      </div>
      <div className="find-actions">
        {found ? (
          <button className="find-next" type="button" onClick={() => setRound((value) => value + 1)}>
            {locale === 'es' ? 'Siguiente' : 'Next'} →
          </button>
        ) : null}
      </div>
    </section>
  )
}

const solarOrbits = [
  { symbol: 'mercurio', orbit: '22%', size: '5%', duration: '16s', start: '-4s' },
  { symbol: 'venus', orbit: '30%', size: '6.2%', duration: '22s', start: '-11s' },
  { symbol: 'tierra', orbit: '38%', size: '6.8%', duration: '30s', start: '-18s', moon: true },
  { symbol: 'marte', orbit: '46%', size: '5.6%', duration: '38s', start: '-7s' },
  { symbol: 'asteroide', orbit: '54%', size: '4.6%', duration: '46s', start: '-21s' },
  { symbol: 'jupiter', orbit: '64%', size: '9.5%', duration: '56s', start: '-13s' },
  { symbol: 'saturno', orbit: '75%', size: '11%', duration: '68s', start: '-29s' },
  { symbol: 'urano', orbit: '84%', size: '7.4%', duration: '82s', start: '-9s' },
  { symbol: 'neptuno', orbit: '91%', size: '7.2%', duration: '96s', start: '-40s' },
  { symbol: 'pluton', orbit: '97%', size: '3.8%', duration: '114s', start: '-55s' },
] as const

function SpaceGame({ items, locale, speak, speaking }: { items: LearningItem[]; locale: Locale; speak: (text: string, symbol: string, audioPath: string) => void; speaking: string | null }) {
  const bySymbol = useMemo(() => Object.fromEntries(items.map((item) => [item.symbol, item])), [items])
  const sun = bySymbol.sol
  const play = (item?: LearningItem) => {
    if (!item) return
    speak(spokenFor(item, locale), item.symbol, audioFile(locale, item.game, item.position))
  }
  const stars = useMemo(() => Array.from({ length: 28 }, (_, index) => ({
    left: `${(index * 37) % 100}%`,
    top: `${(index * 53) % 100}%`,
    size: index % 5 === 0 ? 3 : 2,
    delay: `${(index % 7) * 0.8}s`,
  })), [])

  return (
    <section className="space-stage" aria-label={locale === 'es' ? 'Sistema solar' : 'Solar system'}>
      {stars.map((star, index) => (
        <span className="space-star" key={index} style={{ left: star.left, top: star.top, width: star.size, height: star.size, animationDelay: star.delay }} />
      ))}
      <div className="space-system">
        {sun ? (
          <button className={`space-sun ${speaking === sun.symbol ? 'is-speaking' : ''}`} type="button"
            onClick={() => play(sun)} aria-label={titleName(sun, locale)}>
            <img src={`${import.meta.env.BASE_URL}planets/sol.png`} alt="" draggable={false} />
          </button>
        ) : null}
        {solarOrbits.map((orbit) => {
          const item = bySymbol[orbit.symbol]
          if (!item) return null
          const moon = 'moon' in orbit && orbit.moon ? bySymbol.luna : undefined
          return (
            <div className="space-orbit" key={orbit.symbol} style={{ width: orbit.orbit, height: orbit.orbit, animationDuration: orbit.duration, animationDelay: orbit.start }}>
              <button className={`space-body ${speaking === item.symbol ? 'is-speaking' : ''}`} type="button"
                style={{ width: orbit.size, height: orbit.size, animationDuration: orbit.duration, animationDelay: orbit.start }}
                onClick={(event) => { event.stopPropagation(); play(item) }} aria-label={titleName(item, locale)}>
                <img src={`${import.meta.env.BASE_URL}planets/${item.symbol}.png`} alt="" draggable={false} />
                {moon ? (
                  <span className="space-moon-path" aria-hidden="true">
                    <button className={`space-moon ${speaking === moon.symbol ? 'is-speaking' : ''}`} type="button"
                      onClick={(event) => { event.stopPropagation(); play(moon) }} aria-label={titleName(moon, locale)}>
                      <img src={`${import.meta.env.BASE_URL}planets/luna.png`} alt="" draggable={false} />
                    </button>
                  </span>
                ) : null}
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function Game({ game, items, locale, onBack }: { game: GameId; items: LearningItem[]; locale: Locale; onBack: () => void }) {
  const [mode, setMode] = useState<Mode>('explore')
  const { speak, speaking } = useSpeech(locale)
  const meta = gameMeta[game]
  const gameItems = useMemo(
    () => items.filter((item) => item.game === game && !(locale === 'en' && game === 'alphabet' && item.symbol === 'Ñ')),
    [game, items, locale],
  )
  return (
    <main className={`play-shell theme-${meta.color} ${mode === 'space' ? 'is-space' : ''}`}>
      <header className="play-header">
        <button className="back-button" type="button" onClick={onBack} aria-label={locale === 'es' ? 'Volver' : 'Back'}>←</button>
        <div><small>{mode === 'memory' ? (locale === 'es' ? 'Encuentra las parejas' : 'Find the pairs') : mode === 'find' ? (locale === 'es' ? '¿Dónde está?' : 'Where is it?') : mode === 'space' ? (locale === 'es' ? 'Toca un planeta' : 'Tap a planet') : meta.prompt[locale]}</small><h1>{meta.title[locale]}</h1></div>
        <span className="header-slot" aria-hidden="true" />
      </header>
      <nav className="mode-switch" aria-label="Modo de juego">
        <button className={mode === 'explore' ? 'active' : ''} type="button" onClick={() => setMode('explore')}>👆 {locale === 'es' ? 'Explorar' : 'Explore'}</button>
        <button className={mode === 'memory' ? 'active' : ''} type="button" onClick={() => setMode('memory')}>🧠 {locale === 'es' ? 'Memorice' : 'Memory'}</button>
        <button className={mode === 'find' ? 'active' : ''} type="button" onClick={() => setMode('find')}>🔎 {locale === 'es' ? 'Encuentra' : 'Find'}</button>
        {game === 'planets' ? (
          <button className={mode === 'space' ? 'active' : ''} type="button" onClick={() => setMode('space')}>🌌 {locale === 'es' ? 'Espacio' : 'Space'}</button>
        ) : null}
      </nav>
      {mode === 'explore' ? (
        <section className={`learning-grid ${game}`} aria-label={meta.prompt[locale]}>
          {gameItems.map((item) => (
            <button className={`learning-card ${item.game === 'planets' ? 'has-art' : ''} ${speaking === item.symbol ? 'is-speaking' : ''}`} key={item.id}
              type="button" onClick={() => speak(spokenFor(item, locale), item.symbol, audioFile(locale, game, item.position))} aria-label={`${spokenFor(item, locale)}. ${locale === 'es' ? 'Toca para escuchar.' : 'Tap to listen.'}`}>
              <span className="card-art"><ItemArt item={item} /></span>
              {item.game === 'planets' ? <small className="card-name">{titleName(item, locale)}</small> : null}
            </button>
          ))}
        </section>
      ) : mode === 'find' ? (
        <FindGame items={gameItems} locale={locale} speak={speak} />
      ) : mode === 'space' ? (
        <SpaceGame items={gameItems} locale={locale} speak={speak} speaking={speaking} />
      ) : (
        <MemoryGame items={gameItems} game={game} locale={locale} speak={speak} />
      )}
    </main>
  )
}

export default function App() {
  const [category, setCategory] = useState<CategoryId | null>(null)
  const [game, setGame] = useState<GameId | null>(null)
  const [locale, setLocale] = useState<Locale>(() => localStorage.getItem('benjamin-language') === 'en' ? 'en' : 'es')
  const items = useLearningItems()

  const goHome = () => { window.history.replaceState(null, '', window.location.pathname); setGame(null); setCategory(null) }
  const goBack = () => ['vowels', 'alphabet', 'animals', 'vehicles', 'food', 'emotions'].includes(game ?? '') ? setGame(null) : goHome()
  const selectCategory = (next: CategoryId) => {
    setCategory(next)
    if (next === 'numbers' || next === 'planets') setGame(next)
  }
  const changeLocale = (next: Locale) => { localStorage.setItem('benjamin-language', next); setLocale(next) }

  return (
    <>
      <LanguageSwitch locale={locale} onLocale={changeLocale} />
      {game ? <Game game={game} items={items} locale={locale} onBack={goBack} />
        : category === 'letters' || category === 'world' ? <SubMenu category={category} locale={locale} onSelect={setGame} onBack={goHome} />
        : <Home onSelect={selectCategory} locale={locale} />}
    </>
  )
}
