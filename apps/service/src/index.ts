import { Hono } from "hono";
import articles from "./routes/articles";
import { errorHandler } from "./error";
import { CFBindings, MiddlewareVars } from "./types/context";

const app = new Hono<{ Bindings: CFBindings; Variables: MiddlewareVars }>();

// Global error handler using Hono's onError
app.onError(errorHandler);

// Mount routes
// app.basePath("/api").route("/", auth);
app.basePath("/api").route("/", articles);

export default app;
