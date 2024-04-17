export type WebSocketArray = WebSocket[];
export type EventConnections = {
    [eventId: string]: WebSocketArray;
};
