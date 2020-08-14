import * as bcrypt from 'bcryptjs'
import { User } from './user.entity'

describe('User entity', () => {
  let user: User

  beforeEach(() => {
    user = new User()
    user.password = 'password'
    user.salt = 'salt'
    bcrypt.hash = jest.fn()
  })

  describe('validatePassword', () => {
    it('should return true because password is valid', async () => {
      bcrypt.hash.mockReturnValue('password')
      const result = await user.validatePassword('123456')
      expect(bcrypt.hash).toHaveBeenCalledWith('123456', user.salt)
      expect(result).toEqual(true)
    })

    it('should return false because password is invalid', async () => {
      bcrypt.hash.mockReturnValue('wrongPassword')
      const result = await user.validatePassword('wrongPassword')
      expect(bcrypt.hash).toHaveBeenCalledWith('wrongPassword', user.salt)
      expect(result).toEqual(false)
    })
  })
})