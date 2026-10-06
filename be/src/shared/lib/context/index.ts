import { AsyncLocalStorage } from "async_hooks";

import { JwtPayload } from "../jwt";

export type RequestContext = {
    jwtPayload?: JwtPayload;
    requestId: string;
};

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();
export const extractContext = () => {
    const context = requestContextStorage.getStore();
    if (!context) throw new Error("Request context not found");
    return context;
};
