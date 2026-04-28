import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private repo: Repository<Task>,
  ) {}

  findAll(): Promise<Task[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  create(data: { title: string; source?: string }): Promise<Task> {
    const task = this.repo.create({ title: data.title, source: data.source ?? 'manual' });
    return this.repo.save(task);
  }

  async update(id: string, data: { title?: string; isCompleted?: boolean }): Promise<Task> {
    const task = await this.repo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    Object.assign(task, data);
    return this.repo.save(task);
  }

  async delete(id: string): Promise<void> {
    const task = await this.repo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    await this.repo.remove(task);
  }
}
