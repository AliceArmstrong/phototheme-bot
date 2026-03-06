#!/usr/bin/env node
'use strict'

/*
 * Deterministic monthly photography theme poster (Node.js)
 * - Uses Incoming Webhook URL from SLACK_WEBHOOK_URL
 * - Reads themes from themes.txt (or THEME_FILE env)
 * - Deterministically picks a theme using months since base + salt-derived offset
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const https = require('https')
const { URL } = require('url')

const THEMES_FILE_DEFAULT = 'themes.txt'
const DEFAULT_SALT = 'photothemes-default-salt-2026'

function loadThemes(filePath = THEMES_FILE_DEFAULT) {
  const p = path.resolve(process.cwd(), filePath)
  const raw = fs.readFileSync(p, { encoding: 'utf8' })
  const lines = raw.split(/\r?\n/).map(l => l.trim())
  const themes = lines.filter(l => l && !l.startsWith('#'))
  if (!themes.length) throw new Error(`No themes found in ${filePath}`)
  return themes
}

function monthsSinceBase(date = new Date(), baseYear = 2000, baseMonth = 1) {
  const months = date.getUTCFullYear() * 12 + (date.getUTCMonth())
  const base = baseYear * 12 + (baseMonth - 1)
  return months - base
}

function pickTheme(themes, salt = DEFAULT_SALT, date = new Date()) {
  const n = themes.length
  const hash = crypto.createHash('sha256').update(salt, 'utf8').digest('hex')
  const big = BigInt('0x' + hash)
  const offset = Number(big % BigInt(n))
  const mi = monthsSinceBase(date)
  const idx = (offset + mi) % n
  return { theme: themes[idx], idx }
}

function postToSlack(webhookUrl, text) {
  return new Promise((resolve, reject) => {
    const url = new URL(webhookUrl)
    const payload = JSON.stringify({ text })
    const opts = {
      method: 'POST',
      hostname: url.hostname,
      path: url.pathname + (url.search || ''),
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }
    const req = https.request(opts, res => {
      let body = ''
      res.setEncoding('utf8')
      res.on('data', d => (body += d))
      res.on('end', () => resolve({ status: res.statusCode, body }))
    })
    req.on('error', reject)
    req.write(payload)
    req.end()
  })
}

async function main() {
  const webhook = process.env.SLACK_WEBHOOK_URL
  if (!webhook) {
    console.error('Error: set SLACK_WEBHOOK_URL (Incoming Webhook) in environment')
    process.exit(2)
  }
  const themesPath = process.env.THEMES_FILE || THEMES_FILE_DEFAULT
  const salt = process.env.THEME_SALT || DEFAULT_SALT
  const dry = process.argv.includes('--dry-run') || process.env.DRY_RUN

  const themes = loadThemes(themesPath)
  const now = new Date()
  const { theme, idx } = pickTheme(themes, salt, now)
  const title = now.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
  const message = `Photography theme for ${title}: *${theme}*`

  if (dry) {
    console.log(message)
    return
  }

  try {
    const res = await postToSlack(webhook, message)
    console.log(`Posted theme #${idx}: '${theme}' -> Slack status ${res.status}`)
  } catch (err) {
    console.error('Failed to post to Slack:', err)
    process.exit(1)
  }
}

if (require.main === module) main()

module.exports = { loadThemes, monthsSinceBase, pickTheme, postToSlack }
