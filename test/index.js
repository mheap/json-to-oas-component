const sinon = require("sinon");
const sinonTest = require("sinon-test")(sinon);

const chai = require("chai");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const expect = chai.expect;

const json2oas = require("../src/index");

const stringDefinition = {
  type: "string",
  maxLength: 32,
  description: "Description goes here",
  example: "bar"
};

const numberDefinition = {
  type: "number",
  minimum: 0,
  maximum: 9999,
  description: "Description goes here",
  example: 18
};

describe("json2oas", function() {
  it("throws an error if the input is not an object (not provided)", function() {
    expect(() => {
      json2oas.generate("Foo");
    }).to.throw("You must provide an object");
  });

  it("throws an error if the input is not an object (string provided)", function() {
    expect(() => {
      json2oas.generate("Demo", "Foo");
    }).to.throw("You must provide an object");
  });

  it("doesn't return anything for an empty object", function() {
    let actual = json2oas.generate({});
    expect(actual).to.equal("");
  });

  it("uses the name AnonymousObject when no name is provided", function() {
    let actual = json2oas.generate({ foo: "bar" });
    expect(actual.components.schemas.AnonymousObject).to.eql({
      foo: stringDefinition
    });
  });

  it("uses the provided name if set", function() {
    let actual = json2oas.generate("DemoObject", { foo: "bar" });
    expect(actual.components.schemas.DemoObject).to.eql({
      foo: stringDefinition
    });
  });

  it("generates a string type", function() {
    let actual = json2oas.generate("DemoObject", { foo: "bar" });
    expect(actual.components.schemas.DemoObject.foo).to.eql(stringDefinition);
  });

  it("generates an number type", function() {
    let actual = json2oas.generate("DemoObject", { foo: 18 });
    expect(actual.components.schemas.DemoObject.foo).to.eql(numberDefinition);
  });

  it("generates an object type", function() {
    let actual = json2oas.generate("DemoObject", {
      foo: { banana: "bar", bee: 18 }
    });
    expect(actual.components.schemas.DemoObject.foo).to.eql({
      type: "object",
      properties: {
        banana: stringDefinition,
        bee: numberDefinition
      }
    });
  });

  it("generates a homogenous array type (object)", function() {
    let actual = json2oas.generate("DemoObject", { foo: [{ demo: "bar" }] });
    expect(actual.components.schemas.DemoObject.foo).to.eql({
      type: "array",
      items: {
        type: "object",
        properties: {
          demo: stringDefinition
        }
      }
    });
  });

  it("generates a homogenous array type (string)", function() {
    let actual = json2oas.generate("DemoObject", {
      foo: ["foo", "bar", "baz"]
    });
    expect(actual.components.schemas.DemoObject.foo).to.eql({
      type: "array",
      items: {
        type: "string"
      }
    });
  });

  it("generates a homogenous array type (number)", function() {
    let actual = json2oas.generate("DemoObject", { foo: [1, 2, 3] });
    expect(actual.components.schemas.DemoObject.foo).to.eql({
      type: "array",
      items: {
        type: "number"
      }
    });
  });

  it("generates a heterogenous array type (string + number)", function() {
    let actual = json2oas.generate("DemoObject", {
      foo: ["hello", 123, "world"]
    });
    expect(actual.components.schemas.DemoObject.foo).to.eql({
      type: "array",
      items: {
        oneOf: [{ type: "string" }, { type: "number" }]
      }
    });
  });
});
