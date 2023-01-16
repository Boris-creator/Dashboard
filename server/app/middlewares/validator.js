const zod = require("zod");
const validationSchema = zod.object({
  name: zod
    .string({
      invalid_type_error: "Введите имя",
    })
    .min(1, "Заполните это поле")
    .regex(/^[а-яa-z]+$/i, "Только буквы"),
  sex: zod.number({ invalid_type_error: "Укажите пол" }),
  age: zod
    .number({ invalid_type_error: "Укажите возраст" })
    .int()
    .min(18, "Участник должен быть 18 лет или старше"),
  phone: zod
    .string({ invalid_type_error: "Заполните это поле" })
    .regex(
      /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/,
      "Некорректный номер"
    )
    .transform((phone) => phone.replace(/\D/g, "")),
  chief: zod.number().min(0).optional(),
});
module.exports = async (req, res, next) => {
  try {
    await validationSchema.parseAsync(req.body);
    next();
  } catch (err) {
    res.status(400).json(err);
  }
};
