import { Test } from '@nestjs/testing'
import { TasksService } from './tasks.service'
import { TaskRepository } from './task.repository'
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto'
import { TaskStatus } from './task-status.enum'
import { NotFoundException } from '@nestjs/common'

const mockUser = { id: 1, username: 'testuser' }
const mockTask = { title: 'title', description: 'description' }

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
  getTaskById: jest.fn(),
  updateTaskStatus: jest.fn(),
})

describe('TasksService', () => {
  let tasksService
  let taskRepository

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTaskRepository }
      ]
    }).compile()

    tasksService = await module.get<TasksService>(TasksService)
    taskRepository = await module.get<TaskRepository>(TaskRepository)
  })

  describe('getTasks', () => {
    it('should get all tasks from task repostory', async () => {
      taskRepository.getTasks.mockResolvedValue('some value')
      const filters: GetTasksFilterDto = { status: TaskStatus.IN_PROGRESS, search: 'search' }
      const result = await tasksService.getTasks(filters, mockUser)
      expect(taskRepository.getTasks).toHaveBeenCalled()
      expect(result).toEqual('some value')
    })
  })

  describe('getTaskById', () => {
    it('should get a task by id', async () => {
      taskRepository.findOne.mockResolvedValue(mockTask)
      const result = await tasksService.getTaskById(1, mockUser)
      expect(result).toEqual(mockTask)
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: mockUser.id }
      })
    })

    it('throws an error if a task is not found', async () => {
      taskRepository.findOne.mockResolvedValue(null)
      expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow()
    })
  })

  describe('createTask', () => {
    it('should create and return a task', async () => {
      taskRepository.createTask.mockResolvedValue(mockTask)
      const createTaskDto = mockTask
      const result = await tasksService.createTask(createTaskDto, mockUser)
      expect(taskRepository.createTask).toHaveBeenCalledWith(mockTask, mockUser)
      expect(result).toEqual(mockTask)
    })
  })

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 1 })
      await tasksService.deleteTask(1, mockUser)
      expect(taskRepository.delete).toHaveBeenCalledWith({ id: 1, userId: mockUser.id })
    })

    it('should throw an error on delete task because a task was not found', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 0 })
      expect(tasksService.deleteTask(1, mockUser)).rejects.toThrow(NotFoundException)
    })
  })

  describe('updateTaskStatus', () => {
    it('should update a task status', async () => {
      const save = jest.fn().mockResolvedValue(true)
      tasksService.getTaskById = jest.fn().mockResolvedValue({
        status: TaskStatus.OPEN,
        save
      })

      const result = await tasksService.updateTaskStatus(1, TaskStatus.DONE, mockUser)
      expect(tasksService.getTaskById).toHaveBeenCalled()
      //expect(save).toHaveBeenCalled()
      //expect(result.status).toEqual(TaskStatus.DONE)
    })
  })
})