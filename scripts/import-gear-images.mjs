import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const root = process.cwd();
const manifestPath = path.join(root, "data", "gear-catalog.json");
const reportPath = path.join(root, "data", "gear-import-report.json");
const outputDir = path.join(root, "public", "gear");
const allowedCategories = new Set(["mouse", "mousepad", "keyboard", "monitor", "headset", "skates"]);
const inputMimeTypes = new Set(["image/png", "image/webp", "image/jpeg"]);
const maxInputBytes = 12 * 1024 * 1024;

function fail(message) {
  throw new Error(message);
}

function catalogKey(item) {
  return `${item.category}\u0000${item.brand}\u0000${item.model}`.toLowerCase();
}

function expectedFilename(item) {
  return `${item.brand}-${item.model}`
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") + ".webp";
}

function validateManifest(catalog) {
  const errors = [];
  const seen = new Set();
  const targetPaths = new Set();

  for (const [index, item] of catalog.entries()) {
    const label = `catalog[${index}] ${item.brand ?? "?"} ${item.model ?? "?"}`;
    const key = catalogKey(item);
    if (seen.has(key)) errors.push(`${label}: duplicate category/brand/model`);
    seen.add(key);

    if (!allowedCategories.has(item.category)) errors.push(`${label}: invalid category`);
    if (!item.specs || Array.isArray(item.specs) || typeof item.specs !== "object") errors.push(`${label}: specs must be an object`);
    if (item.source_url && !item.source_url.startsWith("https://")) errors.push(`${label}: source_url must use HTTPS`);
    if (item.image_source_url && !item.image_source_url.startsWith("https://")) errors.push(`${label}: image_source_url must use HTTPS`);

    const filename = expectedFilename(item);
    const expectedPath = `/gear/${filename}`;
    if (item.target_path !== expectedPath) errors.push(`${label}: target_path must be ${expectedPath}`);
    if (item.image_url !== null && item.image_url !== expectedPath) errors.push(`${label}: image_url must be null or ${expectedPath}`);
    if (item.image_url && item.audit_status !== "approved") errors.push(`${label}: non-approved item cannot expose image_url`);
    if (item.audit_status === "approved" && (!item.image_source_url || !item.allowed_image_hosts?.length)) {
      errors.push(`${label}: approved image requires a source URL and host allowlist`);
    }
    if (targetPaths.has(item.target_path)) errors.push(`${label}: duplicate target_path`);
    targetPaths.add(item.target_path);
  }

  if (errors.length) fail(errors.join("\n"));
}

async function loadCatalog() {
  const catalog = JSON.parse(await readFile(manifestPath, "utf8"));
  if (!Array.isArray(catalog)) fail("Gear catalog must be an array.");
  validateManifest(catalog);
  return catalog;
}

async function fetchOfficialImage(item) {
  const response = await fetch(item.image_source_url, {
    redirect: "follow",
    headers: { "User-Agent": "NYKE-Gear-Importer/1.0" },
  });

  if (!response.ok) fail(`HTTP ${response.status}`);

  const finalUrl = new URL(response.url);
  if (!item.allowed_image_hosts.includes(finalUrl.hostname.toLowerCase())) {
    fail(`redirected to unapproved host ${finalUrl.hostname}`);
  }

  const contentType = response.headers.get("content-type")?.split(";")[0].toLowerCase();
  if (!contentType || !inputMimeTypes.has(contentType)) fail(`unsupported MIME type ${contentType || "unknown"}`);

  const declaredLength = Number(response.headers.get("content-length") ?? 0);
  if (declaredLength > maxInputBytes) fail("source exceeds 12 MB");

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > maxInputBytes) fail("source exceeds 12 MB");

  return { buffer, finalUrl: finalUrl.toString(), contentType };
}

async function importImages(catalog) {
  await mkdir(outputDir, { recursive: true });
  const entries = [];

  for (const item of catalog) {
    const base = {
      category: item.category,
      brand: item.brand,
      model: item.model,
      target_path: item.target_path,
      source_url: item.source_url,
      image_source_url: item.image_source_url,
    };

    if (item.audit_status !== "approved") {
      entries.push({ ...base, status: item.audit_status === "missing" ? "image_missing" : "needs_review" });
      continue;
    }

    try {
      const fetched = await fetchOfficialImage(item);
      const image = sharp(fetched.buffer, { limitInputPixels: 40_000_000 });
      const metadata = await image.metadata();
      const width = metadata.width ?? 0;
      const height = metadata.height ?? 0;
      const longestEdge = Math.max(width, height);

      if (longestEdge < 500) {
        entries.push({ ...base, status: "needs_review", reason: `source is only ${width}x${height}` });
        continue;
      }

      const filename = path.basename(item.target_path);
      const destination = path.join(outputDir, filename);
      const output = await image
        .rotate()
        .resize({ width: 1000, height: 1000, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 88, alphaQuality: 100 })
        .toFile(destination);

      entries.push({
        ...base,
        status: "imported",
        resolved_image_url: fetched.finalUrl,
        input_mime: fetched.contentType,
        input_dimensions: `${width}x${height}`,
        output_dimensions: `${output.width}x${output.height}`,
        output_bytes: output.size,
        has_alpha: Boolean(output.channels === 4),
      });
    } catch (error) {
      entries.push({ ...base, status: "failed", reason: error instanceof Error ? error.message : "Unknown import error" });
    }
  }

  const counts = entries.reduce((acc, entry) => {
    acc[entry.status] = (acc[entry.status] ?? 0) + 1;
    return acc;
  }, {});
  const report = {
    generated_at: new Date().toISOString(),
    summary: {
      catalog_items: catalog.length,
      imported: counts.imported ?? 0,
      image_found: counts.imported ?? 0,
      image_missing: counts.image_missing ?? 0,
      failed: counts.failed ?? 0,
      needs_review: counts.needs_review ?? 0,
    },
    items: entries,
  };

  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify(report.summary, null, 2)}\n`);
}

async function checkCatalog(catalog) {
  const errors = [];
  const referenced = new Set(catalog.filter((item) => item.image_url).map((item) => path.basename(item.image_url)));
  const files = (await readdir(outputDir, { withFileTypes: true })).filter((entry) => entry.isFile()).map((entry) => entry.name);

  for (const item of catalog) {
    if (!item.image_url) continue;
    const filename = path.basename(item.image_url);
    const filePath = path.join(outputDir, filename);
    try {
      const fileStats = await stat(filePath);
      const metadata = await sharp(filePath).metadata();
      if (fileStats.size === 0) errors.push(`${item.image_url}: empty file`);
      if (metadata.format !== "webp") errors.push(`${item.image_url}: expected WebP, got ${metadata.format ?? "unknown"}`);
      if ((metadata.width ?? 0) > 1000 || (metadata.height ?? 0) > 1000) errors.push(`${item.image_url}: exceeds 1000x1000`);
      if ((metadata.width ?? 0) < 1 || (metadata.height ?? 0) < 1) errors.push(`${item.image_url}: invalid dimensions`);
    } catch (error) {
      errors.push(`${item.image_url}: ${error instanceof Error ? error.message : "missing file"}`);
    }
  }

  for (const file of files) {
    if (!referenced.has(file)) errors.push(`/gear/${file}: unreferenced file`);
  }

  if (errors.length) fail(errors.join("\n"));

  const counts = catalog.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + 1;
    return acc;
  }, {});
  process.stdout.write(`Gear catalog OK: ${catalog.length} items, ${referenced.size} local images\n`);
  process.stdout.write(`${JSON.stringify(counts, null, 2)}\n`);
}

const catalog = await loadCatalog();
const command = process.argv[2];

if (command === "import") {
  await importImages(catalog);
} else if (command === "check") {
  await checkCatalog(catalog);
} else {
  fail("Usage: node scripts/import-gear-images.mjs <import|check>");
}
