import { Repository } from 'typeorm';
import { Task } from './task.entity';
export declare class TaskService {
    private repo;
    constructor(repo: Repository<Task>);
    findAll(): Promise<Task[]>;
    create(data: {
        title: string;
        source?: string;
    }): Promise<Task>;
    update(id: string, data: {
        title?: string;
        isCompleted?: boolean;
    }): Promise<Task>;
    delete(id: string): Promise<void>;
}
