import argon2 from 'argon2'

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password)
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password)
  } catch {
    return false
  }
}

export function validatePasswordPolicy(password: string): string[] {
  const errors: string[] = []
  if (password.length < 8) errors.push('Mínimo de 8 caracteres')
  if (!/[A-Z]/.test(password)) errors.push('Pelo menos uma letra maiúscula')
  if (!/[a-z]/.test(password)) errors.push('Pelo menos uma letra minúscula')
  if (!/[0-9]/.test(password)) errors.push('Pelo menos um número')
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('Pelo menos um caractere especial')
  return errors
}

export function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$'
  let pwd = ''
  // ensure policy: 1 upper, 1 lower, 1 digit, 1 special
  pwd += 'ABCDEFGHJKMNPQRSTUVWXYZ'[Math.floor(Math.random() * 23)]
  pwd += 'abcdefghjkmnpqrstuvwxyz'[Math.floor(Math.random() * 23)]
  pwd += '23456789'[Math.floor(Math.random() * 8)]
  pwd += '!@#$'[Math.floor(Math.random() * 4)]
  for (let i = 4; i < 10; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)]
  }
  return pwd.split('').sort(() => Math.random() - 0.5).join('')
}
