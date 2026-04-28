"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const task_service_1 = require("./task.service");
const ai_service_1 = require("./ai.service");
const create_task_dto_1 = require("./dto/create-task.dto");
const update_task_dto_1 = require("./dto/update-task.dto");
const generate_tasks_dto_1 = require("./dto/generate-tasks.dto");
let TaskController = class TaskController {
    taskService;
    aiService;
    constructor(taskService, aiService) {
        this.taskService = taskService;
        this.aiService = aiService;
    }
    findAll() {
        return this.taskService.findAll();
    }
    create(dto) {
        return this.taskService.create({ title: dto.title });
    }
    async generate(dto, apiKey) {
        const titles = await this.aiService.generateTasks(dto.goal, apiKey);
        return Promise.all(titles.map((title) => this.taskService.create({ title, source: 'ai' })));
    }
    update(id, dto) {
        return this.taskService.update(id, dto);
    }
    async delete(id) {
        await this.taskService.delete(id);
    }
};
exports.TaskController = TaskController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all tasks' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a task manually' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Task created' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_task_dto_1.CreateTaskDto]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Generate tasks from a goal using AI' }),
    (0, swagger_1.ApiHeader)({ name: 'x-api-key', description: 'Provider API key (optional, overrides env)', required: false }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Tasks generated and saved' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_tasks_dto_1.GenerateTasksDto, String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "generate", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a task' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_task_dto_1.UpdateTaskDto]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a task' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Task deleted' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "delete", null);
exports.TaskController = TaskController = __decorate([
    (0, swagger_1.ApiTags)('tasks'),
    (0, common_1.Controller)('tasks'),
    __metadata("design:paramtypes", [task_service_1.TaskService,
        ai_service_1.AiService])
], TaskController);
//# sourceMappingURL=task.controller.js.map