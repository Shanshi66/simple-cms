import { Hono } from "hono";
import auth from "./routes/auth";
import { errorHandler } from "./error";
import { CFBindings } from "./types/bindings";

const app = new Hono<{ Bindings: CFBindings }>();

// Global error handler using Hono's onError
app.onError(errorHandler);

// Mount routes
app.basePath("/api").route("/", auth);

export default app;
