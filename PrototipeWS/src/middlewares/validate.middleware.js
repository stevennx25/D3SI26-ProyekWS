/**
 * Middleware generik untuk validasi request body menggunakan schema Joi.
 * Pakai: router.post("/", validate(pendaftaranSchema), controller)
 */
export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // tampilkan semua error sekaligus, bukan cuma yang pertama
      stripUnknown: true, // buang field yang tidak didefinisikan di schema
    });

    if (error) {
      const messages = error.details.map((d) => d.message);
      return res.status(400).json({
        success: false,
        message: "Input tidak valid",
        errors: messages,
      });
    }

    req.body = value;
    next();
  };
}
