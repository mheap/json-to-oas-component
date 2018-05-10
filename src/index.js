const yaml = require("js-yaml");

function generate(objectName, input) {
  if (!input && typeof objectName === "object") {
    input = objectName;
  }

  if (typeof objectName !== "string") {
    objectName = "AnonymousObject";
  }

  if (typeof input !== "object") {
    throw new Error("You must provide an object");
  }

  if (Object.keys(input).length === 0) {
    return "";
  }

  // Everything lives under components.schemas
  let schema = { components: { schemas: {} } };
  let definition = schema.components.schemas;

  definition[objectName] = {};

  // Now we switch on the type provided in each key
  for (k of Object.keys(input)) {
    definition[objectName][k] = outputType(input[k]);
  }

  return schema;
}

function outputType(input) {
  let inputType = typeof input;

  if (inputType === "object" && Array.isArray(input)) {
    inputType = "array";
  }

  if (inputType === "string") {
    return {
      type: "string",
      maxLength: 32,
      description: "Description goes here",
      example: input
    };
  }

  if (inputType === "number") {
    return {
      type: "number",
      minimum: 0,
      maximum: 9999,
      description: "Description goes here",
      example: input
    };
  }

  if (inputType == "object") {
    let r = {
      type: "object",
      properties: {}
    };
    for (let k of Object.keys(input)) {
      r.properties[k] = outputType(input[k]);
    }

    return r;
  }
  if (inputType === "array") {
    let types = getTypeOfArray(input);
    if (typeof types == "object") {
      items = {
        oneOf: types.map(t => {
          return { type: t };
        })
      };
    } else {
      items = {
        type: types
      };
      if (typeof input[0] === "object") {
        items = outputType(input[0]);
      }
    }

    let r = {
      type: "array",
      items: items
    };

    return r;
  }
  return "";
}

function getTypeOfArray(input) {
  let types = [];
  for (let k of Object.keys(input)) {
    types.push(typeof input[k]);
  }

  types = types.filter(function(elem, pos) {
    return types.indexOf(elem) == pos;
  });

  if (types.length === 1) {
    return types[0];
  }

  return types;
}

function toYaml(objectName, input) {
  let schema = generate(objectName, input);
  return yaml.safeDump(schema);
}

module.exports = {
  generate,
  yaml: toYaml
};
