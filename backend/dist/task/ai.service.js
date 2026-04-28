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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = __importDefault(require("openai"));
let AiService = class AiService {
    client;
    constructor() {
        this.client = this.buildClient(process.env.AI_API_KEY);
    }
    buildClient(apiKey) {
        return new openai_1.default({
            apiKey: apiKey ?? 'no-key',
            baseURL: process.env.AI_BASE_URL || undefined,
            timeout: 30000,
            defaultHeaders: {
                'HTTP-Referer': 'https://github.com/smart-todo',
                'X-Title': 'Smart To-Do',
            },
        });
    }
    async generateTasks(goal, apiKey) {
        const effectiveKey = apiKey || process.env.AI_API_KEY;
        if (process.env.AI_MOCK === 'true' || !effectiveKey) {
            return this.mockTasks(goal);
        }
        const client = apiKey ? this.buildClient(apiKey) : this.client;
        const model = process.env.AI_MODEL ?? 'mistralai/mistral-7b-instruct:free';
        const prompt = [
            {
                role: 'user',
                content: `You are a task planning assistant. Break this goal into 4 to 6 clear, actionable tasks. Respond ONLY with valid JSON, no markdown fences, no extra text:\n{"tasks": ["task 1", "task 2"]}\n\nGoal: ${goal}`,
            },
        ];
        let raw = '';
        try {
            const response = await client.chat.completions.create({
                model,
                messages: prompt,
                ...(this.supportsJsonMode() ? { response_format: { type: 'json_object' } } : {}),
            });
            raw = response.choices[0]?.message?.content ?? '';
        }
        catch (err) {
            if (err?.code === 'ETIMEDOUT' || err?.message?.includes('timeout')) {
                throw new common_1.InternalServerErrorException('AI service timed out');
            }
            throw new common_1.InternalServerErrorException(`AI service error: ${err?.message ?? 'unknown'}`);
        }
        return this.parseResponse(raw);
    }
    supportsJsonMode() {
        const baseURL = process.env.AI_BASE_URL ?? '';
        return baseURL === '' || baseURL.includes('api.openai.com');
    }
    parseResponse(raw) {
        const cleaned = raw
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/gi, '')
            .trim();
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (!match)
            throw new common_1.InternalServerErrorException('AI returned invalid JSON');
        let parsed;
        try {
            parsed = JSON.parse(match[0]);
        }
        catch {
            throw new common_1.InternalServerErrorException('AI returned invalid JSON');
        }
        if (!Array.isArray(parsed.tasks)) {
            throw new common_1.BadRequestException('AI response missing tasks array');
        }
        return parsed.tasks
            .filter((t) => typeof t === 'string' && t.trim().length > 0)
            .map((t) => t.trim());
    }
    mockTasks(goal) {
        return [
            `Pesquisar e entender o básico de: ${goal}`,
            `Definir um plano de ação para: ${goal}`,
            `Aplicar os primeiros passos de: ${goal}`,
            `Praticar com um projeto real relacionado a: ${goal}`,
            `Revisar o progresso e ajustar a abordagem de: ${goal}`,
        ];
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AiService);
//# sourceMappingURL=ai.service.js.map