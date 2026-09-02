import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from './lib/supabase'

type CategoryId = 'letters' | 'numbers' | 'world' | 'planets'
type GameId = 'vowels' | 'alphabet' | 'numbers' | 'animals' | 'vehicles' | 'food' | 'emotions' | 'planets'
type Mode = 'explore' | 'memory'
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
const planets = [['☀️', 'sol'], ['🌍', 'tierra'], ['🌙', 'luna'], ['🔴', 'marte'], ['🪐', 'saturno'], ['🟠', 'júpiter'], ['🔵', 'neptuno'], ['🟡', 'venus'], ['⚪', 'mercurio'], ['☄️', 'cometa']]

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
  letters: { eyebrow: 'A · B · C', title: { es: 'Letras', en: 'Letters' }, icon: '🎈', color: 'coral' },
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
  planets: Object.fromEntries(['sun', 'earth', 'moon', 'mars', 'saturn', 'jupiter', 'neptune', 'venus', 'mercury', 'comet'].map((name, index) => [planets[index][0], name])),
}

const audioFile = (locale: Locale, game: GameId, position: number) =>
  `${import.meta.env.BASE_URL}audio/${locale}/${game}/${position}.wav`

const spokenFor = (item: LearningItem, locale: Locale) =>
  locale === 'en' ? englishNames[item.game][item.symbol] ?? item.spoken_text : item.spoken_text

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
    { id: 'vowels', icon: '🌈', hint: 'A · E · I · O · U', choiceClass: 'vowels-choice' },
    { id: 'alphabet', icon: '🐝', hint: 'A · B · C · D · E...', choiceClass: 'alphabet-choice' },
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
              <span className="card-front">{card.symbol}</span>
            </button>
          )
        })}
      </div>
      {won && <div className="win-card" role="status"><span aria-hidden="true">🎉</span><strong>{locale === 'es' ? '¡Muy bien!' : 'Great job!'}</strong>
        <button type="button" onClick={() => setRound((value) => value + 1)}>{locale === 'es' ? 'Otra vez' : 'Play again'}</button></div>}
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
    <main className={`play-shell theme-${meta.color}`}>
      <header className="play-header">
        <button className="back-button" type="button" onClick={onBack} aria-label={locale === 'es' ? 'Volver' : 'Back'}>←</button>
        <div><small>{mode === 'memory' ? (locale === 'es' ? 'Encuentra las parejas' : 'Find the pairs') : meta.prompt[locale]}</small><h1>{meta.title[locale]}</h1></div>
        <span className="header-slot" aria-hidden="true" />
      </header>
      <nav className="mode-switch" aria-label="Modo de juego">
        <button className={mode === 'explore' ? 'active' : ''} type="button" onClick={() => setMode('explore')}>👆 {locale === 'es' ? 'Explorar' : 'Explore'}</button>
        <button className={mode === 'memory' ? 'active' : ''} type="button" onClick={() => setMode('memory')}>🧠 {locale === 'es' ? 'Memorice' : 'Memory'}</button>
      </nav>
      {mode === 'explore' ? (
        <section className={`learning-grid ${game}`} aria-label={meta.prompt[locale]}>
          {gameItems.map((item) => (
            <button className={`learning-card ${speaking === item.symbol ? 'is-speaking' : ''}`} key={item.id}
              type="button" onClick={() => speak(spokenFor(item, locale), item.symbol, audioFile(locale, game, item.position))} aria-label={`${spokenFor(item, locale)}. ${locale === 'es' ? 'Toca para escuchar.' : 'Tap to listen.'}`}>
              <span>{item.symbol}</span><small aria-hidden="true">🔊</small>
            </button>
          ))}
        </section>
      ) : <MemoryGame items={gameItems} game={game} locale={locale} speak={speak} />}
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
