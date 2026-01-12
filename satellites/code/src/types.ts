export type EventType = 'code_context' | 'audio_chunk' | 'web_context';

export interface BaseEvent {
    type: EventType;
    source: string;
    timestamp: number;
}

export interface CodeContextPayload {
    filename: string;
    cursor_line: number;
    content_snippet: string;
    language: string;
}

export interface CodeEvent extends BaseEvent {
    type: 'code_context';
    payload: CodeContextPayload;
}

// Union type for all events
export type CortexEvent = CodeEvent; // Add Audio/Web later
