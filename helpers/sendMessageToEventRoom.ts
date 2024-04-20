import { EventConnections } from "../@types/websockets";

export const sendMessageToEventWithId = (
    eventId: string,
    eventConnections: EventConnections,
    message: string
) => {
    eventConnections[eventId].forEach((client) => {
        //@ts-ignore
        if (client.readyState === 1) {
            //@ts-ignore
            client.send(message);
        }
    });
};
