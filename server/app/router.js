const express = require("express");
const jsonParser = express.json();

const router = express.Router();
const FellowService = require("./fellowService"),
  service = new FellowService();
router.post("/getFellows", async (req, res) => {
  const fellows = await service.getFellows();
  res.json({ fellows });
});
//TO DO: добавить валидацию
router.post("/addFellow", jsonParser, async (req, res) => {
  const newFellow = await service.addFellow(req.body);
  res.json({ id: newFellow?.id });
});
module.exports = router;
