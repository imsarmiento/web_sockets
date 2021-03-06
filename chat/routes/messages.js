var express = require("express");
var router = express.Router();

const Joi = require("joi");
const Message = require("../models/Message");

/* GET messages . */
router.get("/", function (req, res, next) {
  Message.findAll().then((messages) => {
    //console.log(messages);
    res.send(messages);
  });
});

/* GET messages ts. */
router.get("/:ts", function (req, res, next) {
  Message.findByPk(req.params.ts).then((message) => {
    if (message === null)
      return res
        .status(404)
        .send("The message with the given ts was not found");
    res.send(message);
  });
});

/* POST messages */
router.post("/", function (req, res, next) {
  const { error } = validateMessage(req.body);
  if (error) {
    return res.status(414).send(error.details[0].message);
  }

  Message.create({
    message: req.body.message,
    author: req.body.author,
    ts: req.body.ts,
  })
    .then((result) => {
      res.send(result);
      webSoc.send(result["message"]);
    })
    .catch((result) => {
      console.log(result);
      //res.send(result.errors[0].message);
    });
});

/* PUT messages */
router.put("/:ts", function (req, res, next) {
  const { error } = validateMessage(req.body);

  if (error) {
    return res.status(414).send(error.details[0].message);
  }

  Message.update(req.body, { where: { ts: req.params.ts } }).then(
    (response) => {
      if (response[0] !== 0) res.send({ message: "Message updated" });
      else res.status(404).send({ message: "Message was not found" });
    }
  );
});

/* DELETE messages */
router.delete("/:ts", function (req, res, next) {
  Message.destroy({
    where: {
      ts: req.params.ts,
    },
  }).then((response) => {
    if (response === 1) res.send({ message: "Message deleted" });
    else res.status(404).send({ message: "Message was not found" });
  });
});

/* Validation of message*/
function validateMessage(body) {
  const schema = Joi.object({
    message: Joi.string().min(5).required(),
    author: Joi.string()
      .trim()
      .required()
      .custom(name_surname, "custom validation"),
    ts: Joi.number().integer().required(),
  });

  return schema.validate(body);
}

/* Validation of name and surname */
const name_surname = (value, helpers) => {
  if (value.split(" ").length <= 1) {
    return helpers.message(
      "Author must contain name and lastname separated by white space."
    );
  }
  return value;
};

module.exports = router;
