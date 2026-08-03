import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const root = String.raw`C:\Users\Haroon\Desktop\JM car wash`;
const inputPath = path.join(root, "JM Car Wash  Greens & Views Contracts 1.xlsx");
const previewDir = path.join(root, "tmp", "spreadsheet_read", "previews");
await fs.mkdir(previewDir, { recursive: true });

const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);

const summary = await workbook.inspect({
  kind: "workbook,sheet,table",
  maxChars: 12000,
  tableMaxRows: 12,
  tableMaxCols: 16,
  tableMaxCellChars: 100,
});
console.log("===SUMMARY===");
console.log(summary.ndjson);

const sheets = workbook.worksheets.items;
console.log("===SHEETS===");
for (let index = 0; index < sheets.length; index += 1) {
  const sheet = sheets[index];
  const used = sheet.getUsedRange();
  const address = used?.address ?? null;
  console.log(JSON.stringify({ index, name: sheet.name, usedRange: address }));

  if (used) {
    const safeName = sheet.name.replace(/[<>:"/\\|?*]+/g, "_");
    const preview = await workbook.render({
      sheetName: sheet.name,
      autoCrop: "all",
      scale: 1.2,
      format: "png",
    });
    await fs.writeFile(
      path.join(previewDir, `${String(index + 1).padStart(2, "0")}-${safeName}.png`),
      new Uint8Array(await preview.arrayBuffer()),
    );
  }
}

const formulas = await workbook.inspect({
  kind: "formula",
  maxChars: 10000,
  options: { maxResults: 250 },
});
console.log("===FORMULAS===");
console.log(formulas.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "formula error scan",
});
console.log("===ERRORS===");
console.log(errors.ndjson);
