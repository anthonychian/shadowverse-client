import * as fs from "fs";
import * as path from "path";
import { ScenarioDefinition } from "./scenario-types";

export function loadScenarioFile(filePath: string): ScenarioDefinition {
  const raw = fs.readFileSync(filePath, "utf8");
  const ext = path.extname(filePath).toLowerCase();
  let data: ScenarioDefinition;
  if (ext === ".json") {
    data = JSON.parse(raw) as ScenarioDefinition;
  } else if (ext === ".yaml" || ext === ".yml") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const yaml = require("yaml") as { parse: (s: string) => ScenarioDefinition };
    data = yaml.parse(raw);
  } else {
    throw new Error(`Unsupported scenario format: ${ext}`);
  }
  if (!data.id) {
    data.id = path.basename(filePath, ext);
  }
  return data;
}

export function findScenariosForCard(
  scenariosDir: string,
  cardNo: string,
): string[] {
  if (!fs.existsSync(scenariosDir)) return [];
  const found: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(json|ya?ml)$/i.test(entry.name)) {
        if (entry.name.startsWith(cardNo) || entry.name.includes(cardNo)) {
          found.push(full);
          continue;
        }
        try {
          const s = loadScenarioFile(full);
          if (s.cardNo === cardNo) found.push(full);
        } catch {
          /* skip invalid */
        }
      }
    }
  };
  walk(scenariosDir);
  return found;
}

export function listAllScenarioFiles(scenariosDir: string): string[] {
  if (!fs.existsSync(scenariosDir)) return [];
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(json|ya?ml)$/i.test(entry.name)) files.push(full);
    }
  };
  walk(scenariosDir);
  return files;
}
