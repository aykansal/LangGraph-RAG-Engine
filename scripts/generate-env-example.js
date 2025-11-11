import fs from "fs";

const envFile = ".env";
const exampleFile = ".env.example";

if (!fs.existsSync(envFile)) {
  console.error("⚠️  No .env file found. Skipping .env.example generation.");
  process.exit(0);
}

const env = fs.readFileSync(envFile, "utf-8");

const example = env
  .split("\n")
  .filter(line => line.trim() && !line.startsWith("#"))
  .map(line => {
    const [key] = line.split("=");
    return `${key}=`;
  })
  .join("\n");

fs.writeFileSync(exampleFile, example);
console.log("✅  .env.example updated successfully!");