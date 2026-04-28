import { InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { AiService } from './ai.service';

const mockCreate = jest.fn();

jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: { completions: { create: mockCreate } },
    })),
  };
});

const makeResponse = (content: string) => ({
  choices: [{ message: { content } }],
});

describe('AiService', () => {
  let service: AiService;
  let originalMock: string | undefined;

  beforeAll(() => {
    originalMock = process.env.AI_MOCK;
    process.env.AI_MOCK = 'false';
    process.env.AI_API_KEY = 'test-key';
  });

  afterAll(() => {
    process.env.AI_MOCK = originalMock ?? '';
  });

  beforeEach(() => {
    mockCreate.mockReset();
    service = new AiService();
  });

  it('returns parsed task titles from valid response', async () => {
    mockCreate.mockResolvedValue(makeResponse(JSON.stringify({ tasks: ['t1', 't2'] })));
    const result = await service.generateTasks('Learn TS');
    expect(result).toEqual(['t1', 't2']);
  });

  it('filters out empty string entries', async () => {
    mockCreate.mockResolvedValue(makeResponse(JSON.stringify({ tasks: ['t1', '', '  ', 't2'] })));
    const result = await service.generateTasks('goal');
    expect(result).toEqual(['t1', 't2']);
  });

  it('throws InternalServerErrorException on invalid JSON', async () => {
    mockCreate.mockResolvedValue(makeResponse('not json'));
    await expect(service.generateTasks('goal')).rejects.toThrow(InternalServerErrorException);
  });

  it('throws BadRequestException when tasks key is missing', async () => {
    mockCreate.mockResolvedValue(makeResponse(JSON.stringify({ result: [] })));
    await expect(service.generateTasks('goal')).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException when tasks is not an array', async () => {
    mockCreate.mockResolvedValue(makeResponse(JSON.stringify({ tasks: 'not-array' })));
    await expect(service.generateTasks('goal')).rejects.toThrow(BadRequestException);
  });

  it('throws InternalServerErrorException with timeout message on timeout error', async () => {
    mockCreate.mockRejectedValue(new Error('Request timeout exceeded'));
    await expect(service.generateTasks('goal')).rejects.toThrow(
      new InternalServerErrorException('AI service timed out'),
    );
  });

  it('throws InternalServerErrorException on generic API error', async () => {
    mockCreate.mockRejectedValue(new Error('Network error'));
    await expect(service.generateTasks('goal')).rejects.toThrow(InternalServerErrorException);
  });
});
