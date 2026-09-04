export type Story = {
  id: string
  title: { es: string; en: string }
  teller: { es: string; en: string }
  icon: string
  color: 'coral' | 'blue' | 'green' | 'purple' | 'orange' | 'pink'
  /** File name inside public/audio/cuentos/. Leave empty until the recording arrives. */
  audio?: string
}

/**
 * Add a family story:
 * 1. Drop the uncle/aunt audio in public/audio/cuentos/ (mp3, m4a, ogg or wav).
 * 2. Set `audio` to that file name and `teller` to who recorded it.
 */
export const stories: Story[] = [
  {
    id: 'tres-cerditos',
    title: { es: 'Los tres cerditos', en: 'The Three Little Pigs' },
    teller: { es: 'Un tío', en: 'An uncle' },
    icon: '🐷',
    color: 'coral',
  },
  {
    id: 'caperucita',
    title: { es: 'Caperucita Roja', en: 'Little Red Riding Hood' },
    teller: { es: 'Un tío', en: 'An uncle' },
    icon: '🧺',
    color: 'pink',
  },
  {
    id: 'ositos',
    title: { es: 'Ricitos de oro', en: 'Goldilocks' },
    teller: { es: 'Un tío', en: 'An uncle' },
    icon: '🐻',
    color: 'orange',
  },
  {
    id: 'patito',
    title: { es: 'El patito feo', en: 'The Ugly Duckling' },
    teller: { es: 'Un tío', en: 'An uncle' },
    icon: '🦆',
    color: 'blue',
  },
  {
    id: 'tortuga',
    title: { es: 'La tortuga y la liebre', en: 'The Tortoise and the Hare' },
    teller: { es: 'Un tío', en: 'An uncle' },
    icon: '🐢',
    color: 'green',
  },
  {
    id: 'estrellita',
    title: { es: 'Estrellita', en: 'Twinkle Twinkle' },
    teller: { es: 'Un tío', en: 'An uncle' },
    icon: '⭐',
    color: 'purple',
  },
]
