export declare class AiService {
    private client;
    constructor();
    private buildClient;
    generateTasks(goal: string, apiKey?: string): Promise<string[]>;
    private supportsJsonMode;
    private parseResponse;
    private mockTasks;
}
