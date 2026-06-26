import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// ── MIDDLEWARE GLOBAL ──
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Static file serving untuk file ijazah yang sudah diupload
// Contoh akses: http://localhost:5000/uploads/ijazah/167890-ijazah.pdf
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ── ROUTES ──
app.use("/api", routes);

// ── 404 & ERROR HANDLER (WAJIB DI PALING BAWAH) ──
app.use(notFound);
app.use(errorHandler);

export default app;
