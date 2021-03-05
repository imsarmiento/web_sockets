var express = require("express");
var Joi = require("joi");
var router = express.Router();
var fs = require("fs");

const path_json = "messages.json";

const name_surname = (value, helpers) => {
  if (value.split(" ").length <= 1) {
    return helpers.message(
      "Author must contain name and lastname separated by white space."
    );
  }
  return value;
};

function validateMessage(body) {
  const schema = Joi.object({
    message: Joi.string().min(5).required(),
    author: Joi.string()
      .trim()
      .required()
      .custom(name_surname, "custom validation"),
    ts: Joi.string().required(),
  });

  return schema.validate(body);
}

const getMessages = (callback) => {
  fs.readFile(path_json, (err, data) => {
    if (err) throw err;
    let messages = JSON.parse(data);
    console.log("messages", messages);
    callback(messages);
  });
};

/* GET messages . */
router.get("/", function (req, res, next) {
  getMessages((messages) => {
    console.log(messages);
    res.send(messages);
  });
});

/* GET messages ts. */
router.get("/:ts", function (req, res, next) {
  getMessages((messages) => {
    const message = messages.find((item) => item.ts === req.params.ts);
    if (!message)
      return res
        .status(404)
        .send("The message with the given ts was not found");
    res.send(message);
  });
});

/* POST messages */
router.post("/", function (req, res, next) {
  getMessages((messages) => {
    const { error } = validateMessage(req.body);
    if (error) {
      return res.status(414).send(error.details[0].message);
    }

    const message = {
      message: req.body.message,
      author: req.body.author,
      ts: req.body.ts,
    };

    messages.push(message);

    fs.writeFile(path_json, JSON.stringify(messages, null, 2), (err) => {
      if (err) throw err;
      console.log("Message saved!");
    });

    res.send(message);
  });
});

/* PUT messages */
router.put("/:ts", function (req, res, next) {
  getMessages((messages) => {
    const message = messages.find((item) => item.ts === req.params.ts);
    if (!message)
      return res
        .status(404)
        .send("The message with the given ts was not found");

    const { error } = validateMessage(req.body);
    if (error) {
      return res.status(414).send(error.details[0].message);
    }

    message.message = req.body.message;
    message.author = req.body.author;
    message.ts = req.body.ts;

    fs.writeFile(path_json, JSON.stringify(messages, null, 2), (err) => {
      if (err) throw err;
      console.log("Message updated!");
    });

    res.send(message);
  });
});

/* DELETE messages */
router.delete("/:ts", function (req, res, next) {
  getMessages((messages) => {
    const message = messages.find((item) => item.ts === req.params.ts);
    if (!message)
      return res
        .status(404)
        .send("The message with the given ts was not found");

    const index = messages.indexOf(message);
    messages.splice(index, 1);

    fs.writeFile(path_json, JSON.stringify(messages, null, 2), (err) => {
      if (err) throw err;
      console.log("Message deleted!");
    });

    res.status(200).send(message);
  });
});

module.exports = router;
