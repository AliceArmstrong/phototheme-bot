#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')

const THEMES_FILE = process.env.THEMES_FILE || 'themes.txt'

function loadThemes(p) {
  const fp = path.resolve(process.cwd(), p)
  const raw = fs.readFileSync(fp, { encoding: 'utf8' })
  return raw.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'))
}

function main() {
  try {
    const themes = loadThemes(THEMES_FILE)
    console.log(`Loaded ${themes.length} themes from ${THEMES_FILE}`)
    if (themes.length === 0) {
      console.error('No themes found; please add themes to the file.')
      process.exit(2)
    }
    // check duplicates
    const seen = new Map()
    const dupes = []
    themes.forEach((t, i) => {
      const key = t.toLowerCase()
      if (seen.has(key)) dupes.push({ theme: t, first: seen.get(key), second: i + 1 })
      else seen.set(key, i + 1)
    })
    if (dupes.length) {
      console.error('Duplicate themes found:')
      dupes.forEach(d => console.error(`  '${d.theme}' (lines ${d.first} and ${d.second})`))
      process.exit(3)
    }

    console.log('No duplicate themes detected.')
    console.log('First 8 themes:')
    themes.slice(0, 8).forEach((t, i) => console.log(`  ${i + 1}. ${t}`))
  } catch (err) {
    console.error('Failed to validate themes:', err.message)
    process.exit(1)
  }
}

if (require.main === module) main()
