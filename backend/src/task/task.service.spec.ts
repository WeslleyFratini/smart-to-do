import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { TaskService } from './task.service';
import { Task } from './task.entity';

const mockTask = (): Task =>
  ({ id: 'uuid-1', title: 'Test', isCompleted: false, createdAt: new Date(), source: 'manual' }) as Task;

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe('TaskService', () => {
  let service: TaskService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: getRepositoryToken(Task), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get(TaskService);
    repo = module.get(getRepositoryToken(Task));
  });

  describe('findAll', () => {
    it('returns tasks ordered by createdAt DESC', async () => {
      repo.find.mockResolvedValue([mockTask()]);
      const result = await service.findAll();
      expect(repo.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
      expect(result).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('creates with source manual by default', async () => {
      const task = mockTask();
      repo.create.mockReturnValue(task);
      repo.save.mockResolvedValue(task);

      await service.create({ title: 'Test' });
      expect(repo.create).toHaveBeenCalledWith({ title: 'Test', source: 'manual' });
      expect(repo.save).toHaveBeenCalledWith(task);
    });

    it('creates with source ai when specified', async () => {
      const task = { ...mockTask(), source: 'ai' } as Task;
      repo.create.mockReturnValue(task);
      repo.save.mockResolvedValue(task);

      const result = await service.create({ title: 'AI task', source: 'ai' });
      expect(repo.create).toHaveBeenCalledWith({ title: 'AI task', source: 'ai' });
      expect(result.source).toBe('ai');
    });
  });

  describe('update', () => {
    it('updates and saves task', async () => {
      const task = mockTask();
      repo.findOne.mockResolvedValue(task);
      repo.save.mockResolvedValue({ ...task, isCompleted: true });

      const result = await service.update('uuid-1', { isCompleted: true });
      expect(repo.save).toHaveBeenCalled();
      expect(result.isCompleted).toBe(true);
    });

    it('throws NotFoundException when task not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.update('bad-id', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('removes task', async () => {
      const task = mockTask();
      repo.findOne.mockResolvedValue(task);
      repo.remove.mockResolvedValue(task);

      await service.delete('uuid-1');
      expect(repo.remove).toHaveBeenCalledWith(task);
    });

    it('throws NotFoundException when task not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.delete('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
