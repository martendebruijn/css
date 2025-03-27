import * as fs from "fs";
import * as toml from "toml";

// import { isArray } from "@martendebruijn/types";
function isArray<T>(x: T): x is T extends unknown[] ? T : never {
  return Array.isArray(x);
}

function arrayToCssValue(array: string[]): string {
  const mapped = array.map((value) => {
    return value.includes(" ") ? `"${value}"` : value;
  });
  const joined = mapped.join(", ");

  return joined;
}

function parseToml(tomlInput: string): any {
  return toml.parse(tomlInput);
}

function cssProperty(property: string, value: string): string {
  return `--${property}: ${value};\n`;
}

function withSpace(input: string): string {
  return `  ${input}`;
}

function convertProperties(styles: Record<string, any>): string {
  let cssOutput = "";
  for (const [property, value] of Object.entries(styles)) {
    if (isArray(value)) {
      cssOutput += withSpace(cssProperty(property, arrayToCssValue(value)));
    } else {
      cssOutput += withSpace(cssProperty(property, value));
    }
  }
  return cssOutput;
}

function createSelector(selector: string): string {
  return `${selector} {\n`;
}

function createEndTag() {
  return `}\n`;
}

function tomlToCss(tomlInput: string): string {
  const parsedToml = parseToml(tomlInput);
  let cssOutput = "";

  for (const [selector, styles] of Object.entries(parsedToml)) {
    cssOutput += createSelector(selector);
    cssOutput += convertProperties(styles as Record<string, any>);
    cssOutput += createEndTag();
  }

  return cssOutput;
}

const tomlFilePath = "./src/config.toml";
const tomlData = fs.readFileSync(tomlFilePath, "utf8");

const cssOutput = tomlToCss(tomlData);

const cssFilePath = "./output.css";
fs.writeFileSync(cssFilePath, cssOutput, "utf8");

console.log("Generated CSS at ", cssFilePath);
