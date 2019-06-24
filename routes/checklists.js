const router = require("express").Router();
const { Checklist, validator } = require("../models/checklist");
const { auth, admin } = require("../middleware/auth");
const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/object-id-validator");

router.get("/all", [auth, admin], async (req, res) => {
  const checklists = await Checklist.find({});

  return res.send(checklists);
});

router.post("/", [auth, validate(validator)], async (req, res) => {
  const checklist = new Checklist(req.body);
  checklist.user = req.user;

  await checklist.save();

  return res.send(checklist);
});

router.get("/", [auth], async (req, res) => {
  const userId = req.user._id;

  const checklists = await Checklist.getUserChecklists(userId);

  return res.send(checklists);
});

router.put(
  "/:id",
  [auth, validateObjectId, validate(validator)],
  async (req, res) => {
    
    const user_id = req.user._id;
    const checklist_id = req.params.id;
    const updatedChecklist = req.body;

    let checklist = await Checklist.getUserChecklist(user_id, checklist_id);
    if (!checklist) return res.status(404).send("Checklist not found.");

    await checklist.updateTo(updatedChecklist);

    return res.send(checklist);
  }
);


router.delete("/:id",[auth,validateObjectId],async (req, res)=>{
  
  const user_id = req.user._id;
  const checklist_id = req.params.id;

  let checklist = await Checklist.getUserChecklist(user_id, checklist_id);
  if (!checklist) return res.status(404).send("Checklist not found.");

  await Checklist.deleteOne({_id:checklist_id});

  return res.send(checklist);
});

module.exports = router;
