import { Hono } from "hono";
import articles from "./routes/articles";
import image from "./routes/image";
import sites from "./routes/sites";
import apiKeys from "./routes/api-keys";
import { errorHandler } from "./error";
import { CFBindings, MiddlewareVars } from "./types/context";

const app = new Hono<{ Bindings: CFBindings; Variables: MiddlewareVars }>();

// Global error handler using Hono's onError
app.onError(errorHandler);

// Mount routes
app.route("/", articles);
app.route("/", image);
app.route("/", sites);
app.route("/", apiKeys);

export default app;
