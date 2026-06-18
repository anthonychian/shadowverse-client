"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadScenarioFile = loadScenarioFile;
exports.findScenariosForCard = findScenariosForCard;
exports.listAllScenarioFiles = listAllScenarioFiles;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function loadScenarioFile(filePath) {
    const raw = fs.readFileSync(filePath, "utf8");
    const ext = path.extname(filePath).toLowerCase();
    let data;
    if (ext === ".json") {
        data = JSON.parse(raw);
    }
    else if (ext === ".yaml" || ext === ".yml") {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const yaml = require("yaml");
        data = yaml.parse(raw);
    }
    else {
        throw new Error(`Unsupported scenario format: ${ext}`);
    }
    if (!data.id) {
        data.id = path.basename(filePath, ext);
    }
    return data;
}
function findScenariosForCard(scenariosDir, cardNo) {
    if (!fs.existsSync(scenariosDir))
        return [];
    const found = [];
    const walk = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory())
                walk(full);
            else if (/\.(json|ya?ml)$/i.test(entry.name)) {
                if (entry.name.startsWith(cardNo) || entry.name.includes(cardNo)) {
                    found.push(full);
                    continue;
                }
                try {
                    const s = loadScenarioFile(full);
                    if (s.cardNo === cardNo)
                        found.push(full);
                }
                catch {
                    /* skip invalid */
                }
            }
        }
    };
    walk(scenariosDir);
    return found;
}
function listAllScenarioFiles(scenariosDir) {
    if (!fs.existsSync(scenariosDir))
        return [];
    const files = [];
    const walk = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory())
                walk(full);
            else if (/\.(json|ya?ml)$/i.test(entry.name))
                files.push(full);
        }
    };
    walk(scenariosDir);
    return files;
}
