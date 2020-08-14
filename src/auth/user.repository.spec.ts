import * as bcrypt from 'bcryptjs'
import { Test } from '@nestjs/testing'
import { ConflictException, InternalServerErrorException } from '@nestjs/common'
import { UserRepository } from './user.repository'
import { User } from './user.entity'

const mockCredentialDto = { username: 'username', password: 'password' }

describe('TasksService', () => {
  let userRepository

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserRepository
      ]
    }).compile()

    userRepository = await module.get<UserRepository>(UserRepository)
  })

  describe('signUp', () => {
    let save

    beforeEach(() => {
      save = jest.fn()
      userRepository.create = jest.fn().mockReturnValue({ save })
    })

    it('should signs up a user', async () => {
      save.mockReturnValue(undefined)
      expect(userRepository.signUp(mockCredentialDto)).resolves.not.toThrow()
    })

    it('should throws a conflict exception because username already exists', async () => {
      save.mockRejectedValue('ER_DUP_ENTRY')
      expect(userRepository.signUp(mockCredentialDto)).resolves.toThrow(ConflictException)
    })

    it('should throws a internal server error exception because username already exists', async () => {
      save.mockRejectedValue('ANY')
      expect(userRepository.signUp(mockCredentialDto)).resolves.toThrow(InternalServerErrorException)
    })
  })

  describe('validateUserPassword', () => {
    let user

    beforeEach(() => {
      userRepository.findOne = jest.fn()
      user = new User()
      user.username = 'username'
      user.validatePassword = jest.fn()
    })

    it('should return the username', async () => {
      userRepository.findOne.mockResolvedValue(user)
      user.validatePassword.mockResolvedValue(true)
      const result = await userRepository.validateUserPassword(mockCredentialDto)
      expect(result).toEqual('username')
    })

    it('should return null because user was not found', async () => {
      userRepository.findOne.mockResolvedValue(null)
      const result = await userRepository.validateUserPassword(mockCredentialDto)
      expect(user.validatePassword).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })

    it('should return null because password is invalid', async () => {
      userRepository.findOne.mockResolvedValue(user)
      user.validatePassword.mockResolvedValue(false)
      const result = await userRepository.validateUserPassword(mockCredentialDto)
      expect(user.validatePassword).toHaveBeenCalled()
      expect(result).toBeNull()
    })
  })

  describe('hashPassword', () => {
    it('should generate a hash', async () => {
      bcrypt.hash = jest.fn().mockResolvedValue('hash')
      expect(bcrypt.hash).not.toHaveBeenCalled()
      const result = await userRepository.hashPassword('password', 'salt')
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 'salt')
      expect(result).toEqual('hash')
    })
  })

})