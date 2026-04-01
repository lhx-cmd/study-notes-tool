import { describe, expect, it } from 'vitest'
import { isHttpUrl, toNavigableUrl } from './url'

describe('url helpers', () => {
  it('accepts http and https urls', () => {
    expect(isHttpUrl('http://example.com')).toBe(true)
    expect(isHttpUrl('https://example.com/a?b=1')).toBe(true)
  })

  it('rejects non-http urls or plain text', () => {
    expect(isHttpUrl('www.example.com')).toBe(false)
    expect(isHttpUrl('paper title')).toBe(false)
    expect(isHttpUrl('')).toBe(false)
  })

  it('normalizes navigable urls by trimming whitespace', () => {
    expect(toNavigableUrl('  https://example.com  ')).toBe('https://example.com')
  })
})
