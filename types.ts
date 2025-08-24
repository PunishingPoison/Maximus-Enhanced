
export enum Role {
    USER = 'user',
    ASSISTANT = 'assistant',
    SYSTEM = 'system',
}

export enum View {
    LANDING = 'landing',
    CHAT = 'chat',
}

export enum Mode {
    STANDARD = 'standard',
    RESEARCH = 'research',
    OPTIMIZE = 'optimize',
}

export interface Message {
    id: number;
    role: Role;
    content: string;
    isOptimizer?: boolean;
}

export interface OptimizerResponse {
    status: 'complete' | 'needs_more_info';
    content: string;
}
