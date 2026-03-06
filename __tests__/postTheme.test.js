const { monthsSinceBase, pickTheme, loadThemes } = require('../postTheme')

test('monthsSinceBase base and increment', () => {
  const d0 = new Date(Date.UTC(2000, 0, 1))
  const d1 = new Date(Date.UTC(2000, 1, 1))
  expect(monthsSinceBase(d0)).toBe(0)
  expect(monthsSinceBase(d1)).toBe(1)
})

test('pickTheme advances by one month', () => {
  const themes = ['a', 'b', 'c', 'd']
  const salt = 'testsalt'
  const d = new Date(Date.UTC(2026, 2, 6)) // Mar 6 2026 UTC
  const dNext = new Date(Date.UTC(2026, 3, 6)) // Apr 6 2026 UTC
  const { idx: i0 } = pickTheme(themes, salt, d)
  const { idx: i1 } = pickTheme(themes, salt, dNext)
  expect(i1).toBe((i0 + 1) % themes.length)
})

test('loadThemes reads themes file', () => {
  const themes = loadThemes('themes.txt')
  expect(Array.isArray(themes)).toBe(true)
  expect(themes.length).toBeGreaterThanOrEqual(1)
})
