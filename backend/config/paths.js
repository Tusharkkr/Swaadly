import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

const backendDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configuredUploadsDirectory = process.env.UPLOADS_DIR?.trim();

export const uploadsDirectory = configuredUploadsDirectory
    ? path.resolve(backendDirectory, configuredUploadsDirectory)
    : path.join(backendDirectory, "uploads");