import { Hono } from "hono";
import auth from "./routes/auth";
import { errorHandler } from "./error";
import { CFBindings, MiddlewareVars } from "./types/context";

const app = new Hono<{ Bindings: CFBindings; Variables: MiddlewareVars }>();

// Global error handler using Hono's onError
app.onError(errorHandler);

// Mount routes
app.basePath("/api").route("/", auth);

export default app;
