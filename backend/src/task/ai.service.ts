import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private client: OpenAI;

  constructor() {
    this.client = this.buildClient(process.env.AI_API_KEY);
  }

  private buildClient(apiKey?: string): OpenAI {
    return new OpenAI({
      apiKey: apiKey ?? 'no-key',
      baseURL: process.env.AI_BASE_URL || undefined,
      timeout: 30000,
      defaultHeaders: {
        'HTTP-Referer': 'https://github.com/smart-todo',
        'X-Title': 'Smart To-Do',
      },
    });
  }

  async generateTasks(goal: string, apiKey?: string): Promise<string[]> {
    const effectiveKey = apiKey || process.env.AI_API_KEY;

    if (process.env.AI_MOCK === 'true' || !effectiveKey) {
      return this.mockTasks(goal);
    }

    const client = apiKey ? this.buildClient(apiKey) : this.client;
    const model = process.env.AI_MODEL ?? 'mistralai/mistral-7b-instruct:free';

    const prompt = [
      {
        role: 'user' as const,
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
    } catch (err: any) {
      if (err?.code === 'ETIMEDOUT' || err?.message?.includes('timeout')) {
        throw new InternalServerErrorException('AI service timed out');
      }
      throw new InternalServerErrorException(`AI service error: ${err?.message ?? 'unknown'}`);
    }

    return this.parseResponse(raw);
  }

  private supportsJsonMode(): boolean {
    // Only use json_object mode with native OpenAI endpoint
    const baseURL = process.env.AI_BASE_URL ?? '';
    return baseURL === '' || baseURL.includes('api.openai.com');
  }

  private parseResponse(raw: string): string[] {
    // Strip markdown fences if model ignored instructions
    const cleaned = raw
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();

    // Extract JSON object from response
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new InternalServerErrorException('AI returned invalid JSON');

    let parsed: { tasks?: unknown };
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      throw new InternalServerErrorException('AI returned invalid JSON');
    }

    if (!Array.isArray(parsed.tasks)) {
      throw new BadRequestException('AI response missing tasks array');
    }

    return (parsed.tasks as unknown[])
      .filter((t) => typeof t === 'string' && t.trim().length > 0)
      .map((t) => (t as string).trim());
  }

  private mockTasks(goal: string): string[] {
    return [
      `Pesquisar e entender o básico de: ${goal}`,
      `Definir um plano de ação para: ${goal}`,
      `Aplicar os primeiros passos de: ${goal}`,
      `Praticar com um projeto real relacionado a: ${goal}`,
      `Revisar o progresso e ajustar a abordagem de: ${goal}`,
    ];
  }
}
