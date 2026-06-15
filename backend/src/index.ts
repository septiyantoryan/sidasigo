import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "..", ".env") });

import { createApp } from "./app";

const port = Number(process.env.PORT || 3000);
const app = createApp();

app.listen(port, "0.0.0.0", () => {
  console.log(`SIDASI-GO server listening on port ${port}`);
});
