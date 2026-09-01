import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const outputRoot = join(process.cwd(), 'public', 'audio')
const temporaryRoot = join(process.cwd(), '.audio-temp')

const alphabetEs = ['a', 'be', 'ce', 'de', 'e', 'efe', 'ge', 'hache', 'i', 'jota', 'ka', 'ele', 'eme', 'ene', 'eñe', 'o', 'pe', 'cu', 'erre', 'ese', 'te', 'u', 'uve', 'doble uve', 'equis', 'ye', 'zeta']
const alphabetEn = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const numbersEs = ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce']
const numbersEn = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']
const animalsEs = ['perro', 'gato', 'vaca', 'cerdo', 'caballo', 'oveja', 'elefante', 'león', 'mono', 'rana']
const animalsEn = ['dog', 'cat', 'cow', 'pig', 'horse', 'sheep', 'elephant', 'lion', 'monkey', 'frog']
const vehiclesEs = ['auto', 'autobús', 'tren', 'bicicleta', 'avión', 'helicóptero', 'barco', 'tractor', 'camión de bomberos', 'moto']
const vehiclesEn = ['car', 'bus', 'train', 'bicycle', 'airplane', 'helicopter', 'boat', 'tractor', 'fire truck', 'motorcycle']

const collections = {
  es: {
    voice: 'Paulina',
    games: { vowels: ['a', 'e', 'i', 'o', 'u'], alphabet: alphabetEs, numbers: numbersEs, animals: animalsEs, vehicles: vehiclesEs },
  },
  en: {
    voice: 'Samantha',
    games: { vowels: ['A', 'E', 'I', 'O', 'U'], alphabet: alphabetEn, numbers: numbersEn, animals: animalsEn, vehicles: vehiclesEn },
  },
}

mkdirSync(temporaryRoot, { recursive: true })

for (const [locale, { voice, games }] of Object.entries(collections)) {
  for (const [game, words] of Object.entries(games)) {
    const gameDirectory = join(outputRoot, locale, game)
    mkdirSync(gameDirectory, { recursive: true })

    words.forEach((word, index) => {
      const position = game === 'alphabet' && locale === 'en' && index >= 14 ? index + 2 : index + 1
      const aiffPath = join(temporaryRoot, `${locale}-${game}-${position}.aiff`)
      const outputPath = join(gameDirectory, `${position}.wav`)
      execFileSync('say', ['-v', voice, '-r', locale === 'es' ? '145' : '160', '-o', aiffPath, word])
      execFileSync('afconvert', ['-f', 'WAVE', '-d', 'LEI16@22050', aiffPath, outputPath])
    })
  }
}

rmSync(temporaryRoot, { recursive: true, force: true })
