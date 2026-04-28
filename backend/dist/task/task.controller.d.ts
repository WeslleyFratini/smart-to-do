import { TaskService } from './task.service';
import { AiService } from './ai.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GenerateTasksDto } from './dto/generate-tasks.dto';
export declare class TaskController {
    private taskService;
    private aiService;
    constructor(taskService: TaskService, aiService: AiService);
    findAll(): Promise<import("./task.entity").Task[]>;
    create(dto: CreateTaskDto): Promise<import("./task.entity").Task>;
    generate(dto: GenerateTasksDto, apiKey?: string): Promise<import("./task.entity").Task[]>;
    update(id: string, dto: UpdateTaskDto): Promise<import("./task.entity").Task>;
    delete(id: string): Promise<void>;
}
