import { describe, it, expect } from 'vitest'
import { validatePasswordPolicy, generateTemporaryPassword } from '@/lib/password'

describe('validatePasswordPolicy', () => {
  it('returns all errors for an empty password', () => {
    const errors = validatePasswordPolicy('')
    expect(errors).toContain('Mínimo de 8 caracteres')
    expect(errors).toContain('Pelo menos uma letra maiúscula')
    expect(errors).toContain('Pelo menos uma letra minúscula')
    expect(errors).toContain('Pelo menos um número')
    expect(errors).toContain('Pelo menos um caractere especial')
    expect(errors).toHaveLength(5)
  })

  it('fails when password is too short (7 chars)', () => {
    // Has uppercase, lowercase, digit, special — but only 7 chars
    const errors = validatePasswordPolicy('Aa1!bcd')
    expect(errors).toContain('Mínimo de 8 caracteres')
    expect(errors).toHaveLength(1)
  })

  it('fails when password has no uppercase letter', () => {
    const errors = validatePasswordPolicy('aabbcc1!')
    expect(errors).toContain('Pelo menos uma letra maiúscula')
    expect(errors).not.toContain('Pelo menos uma letra minúscula')
    expect(errors).not.toContain('Pelo menos um número')
    expect(errors).not.toContain('Pelo menos um caractere especial')
  })

  it('fails when password has no lowercase letter', () => {
    const errors = validatePasswordPolicy('AABBCC1!')
    expect(errors).toContain('Pelo menos uma letra minúscula')
    expect(errors).not.toContain('Pelo menos uma letra maiúscula')
  })

  it('fails when password has no digit', () => {
    const errors = validatePasswordPolicy('AaBbCcDd!')
    expect(errors).toContain('Pelo menos um número')
    expect(errors).not.toContain('Pelo menos uma letra maiúscula')
    expect(errors).not.toContain('Pelo menos uma letra minúscula')
  })

  it('fails when password has no special character', () => {
    const errors = validatePasswordPolicy('AaBbCc12')
    expect(errors).toContain('Pelo menos um caractere especial')
    expect(errors).not.toContain('Pelo menos uma letra maiúscula')
    expect(errors).not.toContain('Pelo menos uma letra minúscula')
    expect(errors).not.toContain('Pelo menos um número')
  })

  it('returns no errors for a fully valid password', () => {
    const errors = validatePasswordPolicy('Secure1!')
    expect(errors).toHaveLength(0)
  })

  it('returns no errors for a longer complex password', () => {
    const errors = validatePasswordPolicy('MyStr0ng@P4ssword#2025')
    expect(errors).toHaveLength(0)
  })

  it('accepts various special characters', () => {
    const specials = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')']
    for (const ch of specials) {
      const pwd = `AaBb1234${ch}`
      const errors = validatePasswordPolicy(pwd)
      expect(errors).toHaveLength(0)
    }
  })

  it('returns multiple errors simultaneously for multiple missing criteria', () => {
    // Missing uppercase, number, and special char — 8 chars
    const errors = validatePasswordPolicy('abcdefgh')
    expect(errors).toContain('Pelo menos uma letra maiúscula')
    expect(errors).toContain('Pelo menos um número')
    expect(errors).toContain('Pelo menos um caractere especial')
    expect(errors).not.toContain('Mínimo de 8 caracteres')
    expect(errors).not.toContain('Pelo menos uma letra minúscula')
  })
})

describe('generateTemporaryPassword', () => {
  it('always generates a password that passes the policy', () => {
    // Run multiple times to account for randomness
    for (let i = 0; i < 50; i++) {
      const pwd = generateTemporaryPassword()
      const errors = validatePasswordPolicy(pwd)
      expect(errors).toHaveLength(0)
    }
  })

  it('generates a password of at least 8 characters', () => {
    for (let i = 0; i < 20; i++) {
      const pwd = generateTemporaryPassword()
      expect(pwd.length).toBeGreaterThanOrEqual(8)
    }
  })

  it('generates unique passwords on successive calls', () => {
    const passwords = new Set(Array.from({ length: 20 }, () => generateTemporaryPassword()))
    // With 20 calls, we should have very high probability of uniqueness
    expect(passwords.size).toBeGreaterThan(15)
  })

  it('generates a password of exactly 10 characters', () => {
    // The implementation generates 4 guaranteed chars + 6 random = 10, then shuffles
    const pwd = generateTemporaryPassword()
    expect(pwd.length).toBe(10)
  })
})
