import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, HttpCode, HttpStatus, Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { AiService } from './ai.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GenerateTasksDto } from './dto/generate-tasks.dto';

@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
  constructor(
    private taskService: TaskService,
    private aiService: AiService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  findAll() {
    return this.taskService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a task manually' })
  @ApiResponse({ status: 201, description: 'Task created' })
  create(@Body() dto: CreateTaskDto) {
    return this.taskService.create({ title: dto.title });
  }

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate tasks from a goal using AI' })
  @ApiHeader({ name: 'x-api-key', description: 'Provider API key (optional, overrides env)', required: false })
  @ApiResponse({ status: 201, description: 'Tasks generated and saved' })
  async generate(
    @Body() dto: GenerateTasksDto,
    @Headers('x-api-key') apiKey?: string,
  ) {
    const titles = await this.aiService.generateTasks(dto.goal, apiKey);
    return Promise.all(
      titles.map((title) => this.taskService.create({ title, source: 'ai' })),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.taskService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 204, description: 'Task deleted' })
  async delete(@Param('id') id: string) {
    await this.taskService.delete(id);
  }
}
