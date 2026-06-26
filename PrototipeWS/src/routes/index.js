import express from "express";
import authRoutes from "./auth.routes.js";
import mahasiswaRoutes from "./mahasiswa.routes.js";
import alumniRoutes from "./alumni.routes.js";
import pendaftaranRoutes from "./pendaftaran.routes.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "iSTTS API aktif",
    endpoints: {
      auth: "/api/auth",
      mahasiswa: "/api/mahasiswa",
      alumni: "/api/alumni",
      pendaftaran: "/api/pendaftaran",
    },
  });
});

router.use("/auth", authRoutes);
router.use("/mahasiswa", mahasiswaRoutes);
router.use("/alumni", alumniRoutes);
router.use("/pendaftaran", pendaftaranRoutes);

export default router;
