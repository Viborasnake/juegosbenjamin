import { execFile } from 'node:child_process'
import { mkdirSync, rmSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { promisify } from 'node:util'

const run = promisify(execFile)

const outputRoot = join(process.cwd(), 'public', 'audio')
const temporaryRoot = join(process.cwd(), '.audio-temp')

const alphabetEs = ['a', 'be', 'ce', 'de', 'e', 'efe', 'ge', 'hache', 'i', 'jota', 'ka', 'ele', 'eme', 'ene', 'eñe', 'o', 'pe', 'cu', 'erre', 'ese', 'te', 'u', 'uve', 'doble uve', 'equis', 'y griega', 'zeta']
// Letter names, not uppercase glyphs: `say "A"` becomes "capital A".
const alphabetEn = ['ay', 'bee', 'see', 'dee', 'ee', 'ef', 'gee', 'aitch', 'eye', 'jay', 'kay', 'el', 'em', 'en', 'oh', 'pee', 'cue', 'ar', 'ess', 'tee', 'you', 'vee', 'double you', 'ex', 'wye', 'zee']
const numbersEs = ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce']
const numbersEn = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']
const animalsEs = ['perro', 'gato', 'vaca', 'chancho', 'caballo', 'oveja', 'elefante', 'león', 'mono', 'rana']
const animalsEn = ['dog', 'cat', 'cow', 'pig', 'horse', 'sheep', 'elephant', 'lion', 'monkey', 'frog']
const vehiclesEs = ['auto', 'autobús', 'tren', 'bicicleta', 'avión', 'helicóptero', 'barco', 'tractor', 'camión de bomberos', 'moto']
const vehiclesEn = ['car', 'bus', 'train', 'bicycle', 'airplane', 'helicopter', 'boat', 'tractor', 'fire truck', 'motorcycle']
const foodEs = ['manzana', 'plátano', 'frutilla', 'naranja', 'uva', 'sandía', 'zanahoria', 'tomate', 'choclo', 'papa']
const foodEn = ['apple', 'banana', 'strawberry', 'orange', 'grapes', 'watermelon', 'carrot', 'tomato', 'corn', 'potato']
const emotionsEs = ['feliz', 'triste', 'enojado', 'asustado', 'sorprendido', 'cansado', 'cariño', 'tímido', 'risa', 'tranquilo']
const emotionsEn = ['happy', 'sad', 'angry', 'scared', 'surprised', 'sleepy', 'love', 'shy', 'laughing', 'calm']

const collections = {
  es: {
    voice: 'Paulina',
    games: { vowels: ['a', 'e', 'i', 'o', 'u'], alphabet: alphabetEs, numbers: numbersEs, animals: animalsEs, vehicles: vehiclesEs, food: foodEs, emotions: emotionsEs },
  },
  en: {
    voice: 'Samantha',
    games: { vowels: ['ay', 'ee', 'eye', 'oh', 'you'], alphabet: alphabetEn, numbers: numbersEn, animals: animalsEn, vehicles: vehiclesEn, food: foodEn, emotions: emotionsEn },
  },
}

mkdirSync(temporaryRoot, { recursive: true })
const tasks = []

for (const [locale, { voice, games }] of Object.entries(collections)) {
  for (const [game, words] of Object.entries(games)) {
    const gameDirectory = join(outputRoot, locale, game)
    mkdirSync(gameDirectory, { recursive: true })

    words.forEach((word, index) => {
      const position = game === 'alphabet' && locale === 'en' && index >= 14 ? index + 2 : index + 1
      const aiffPath = join(temporaryRoot, `${locale}-${game}-${position}.aiff`)
      const outputPath = join(gameDirectory, `${position}.wav`)
      tasks.push(async () => {
        const spokenVoice = word === 'y griega' ? 'Paulina' : voice
        await run('say', ['-v', spokenVoice, '-r', spokenVoice === 'Paulina' ? '145' : '160', '-o', aiffPath, word])
        await run('afconvert', ['-f', 'WAVE', '-d', 'LEI16@22050', aiffPath, outputPath])
        if (statSync(outputPath).size <= 4096) throw new Error(`Audio vacío: ${outputPath}`)
      })
    })
  }
}

let nextTask = 0
async function worker() {
  while (nextTask < tasks.length) {
    const task = tasks[nextTask]
    nextTask += 1
    await task()
  }
}

await Promise.all(Array.from({ length: 8 }, () => worker()))
rmSync(temporaryRoot, { recursive: true, force: true })
