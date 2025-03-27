import * as fs from "fs";
import * as toml from "toml";

// import { isArray } from "@martendebruijn/types";
function isArray<T>(x: T): x is T extends unknown[] ? T : never {
  return Array.isArray(x);
}

function hasSpace(value: string): boolean {
  return value.includes(" ");
}

function generateCssValue(value: string): string {
  return hasSpace(value) ? `"${value}"` : value;
}

function addComma(values: string[]): string {
  return values.join(", ");
}

function mapCssValues(array: string[]): string[] {
  return array.map((value) => {
    return generateCssValue(value);
  });
}

function arrayToCssValue(array: string[]): string {
  const mapped = mapCssValues(array);
  const joined = addComma(mapped);

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

function generateProperties(value: any, property: string, cssOutput = "") {
  if (isArray(value)) {
    cssOutput += withSpace(cssProperty(property, arrayToCssValue(value)));
  } else {
    cssOutput += withSpace(cssProperty(property, value));
  }

  return cssOutput;
}

function entries<T>(object: Record<string, T>): [string, T][] {
  return Object.entries(object);
}

function convertProperties(styles: Record<string, any>): string {
  let cssOutput = "";
  for (const [property, value] of entries(styles)) {
    generateProperties(value, property, cssOutput);
  }
  return cssOutput;
}

function createSelector(selector: string): string {
  return `${selector} {\n`;
}

function createEndTag() {
  return `}\n`;
}

function generateCss(
  selector: string,
  styles: unknown,
  cssOutput = ""
): string {
  cssOutput += createSelector(selector);
  cssOutput += convertProperties(styles as Record<string, any>);
  cssOutput += createEndTag();

  return cssOutput;
}

function tomlToCss(tomlInput: string): string {
  const parsedToml = parseToml(tomlInput);
  let cssOutput = "";

  for (const [selector, styles] of entries(parsedToml)) {
    generateCss(selector, styles, cssOutput);
  }

  return cssOutput;
}

const tomlFilePath = "./src/config.toml";
const tomlData = fs.readFileSync(tomlFilePath, "utf8");

const cssOutput = tomlToCss(tomlData);

const cssFilePath = "./output.css";
fs.writeFileSync(cssFilePath, cssOutput, "utf8");

console.log("Generated CSS at ", cssFilePath);
