#!/usr/bin/env node
/**
 * Coverage dashboard for card definition pipeline.
 * Usage: node src/scripts/card-coverage.js
 */
const { execSync } = require("child_process");
const path = require("path");

const script = path.join(__dirname, "mergecards.js");
console.log(execSync(`node "${script}" --report`, { encoding: "utf8" }));
