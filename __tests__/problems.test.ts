import { describe, it, expect } from 'vitest'
import { getAllProblems, getProblemBySlug } from '../src/lib/problems'

describe('problems', () => {
  it('loads all 36 problems', () => {
    expect(getAllProblems()).toHaveLength(36)
  })

  it('each problem has required fields', () => {
    for (const p of getAllProblems()) {
      expect(p.slug, `${p.slug} slug`).toBeTruthy()
      expect(p.title, `${p.slug} title`).toBeTruthy()
      expect(['easy', 'medium', 'hard'], `${p.slug} difficulty`).toContain(p.difficulty)
      expect(p.functionName, `${p.slug} functionName`).toBeTruthy()
      expect(p.testCases.length, `${p.slug} testCases`).toBeGreaterThanOrEqual(2)
      expect(p.starterCode, `${p.slug} starterCode`).toBeTruthy()
    }
  })

  it('slugs are unique', () => {
    const slugs = getAllProblems().map(p => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('looks up problem by slug', () => {
    const p = getProblemBySlug('two-sum')
    expect(p).not.toBeNull()
    expect(p!.title).toBe('Two Sum')
  })

  it('returns null for unknown slug', () => {
    expect(getProblemBySlug('does-not-exist')).toBeNull()
  })
})
