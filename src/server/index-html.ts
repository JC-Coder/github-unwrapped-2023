import type { Request, Response } from "express";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "path";
import type { ViteDevServer } from "vite";
import { backendCredentials } from "../helpers/domain.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const rootDir = path.join(__dirname, "..", "..");
export const viteDir = path.join(rootDir, "vite");
export const publicDir = path.join(rootDir, "public");
export const viteDistDir = path.join(viteDir, "dist");

export const nodeEnv = backendCredentials().NODE_ENV;

export const viteIndexHtml =
  nodeEnv === "development"
    ? path.join(viteDir, "index.html")
    : path.join(viteDistDir, "index.html");

export const handleIndexHtmlDev = (vite: ViteDevServer) => {
  const index = viteIndexHtml;

  return async (req: Request, response: Response) => {
    const template = readFileSync(index, "utf-8");
    try {
      const transformed = await vite.transformIndexHtml(req.url, template);
      response.status(200);
      response.send(transformed);
    } catch (err) {
      vite.ssrFixStacktrace(err as Error);
      console.error(err);
      response.status(500).end((err as Error).message);
    }
  };
};

export const handleIndexHtmlProduction = () => {
  const template = readFileSync(viteIndexHtml, "utf-8");

  return (req: Request, response: Response) => {
    response.status(200);
    response.send(template);
    response.end();
  };
};