import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const source = await FileBlob.load(
  "C:/Users/Haroon/Desktop/JM car wash/JM Car Wash  Greens & Views Contracts 1.xlsx",
);
const workbook = await SpreadsheetFile.importXlsx(source);
const sheets = await workbook.inspect({
  kind: "sheet",
  include: "id,name",
  maxChars: 12000,
});
console.log(sheets.ndjson);

for (const name of [
  "Al Dhafra",
  "Al Samar",
  "AL Thayyal",
  "Al Ghozlan",
  "Al Arta",
  "Al Alka 1 & 3",
  "Mosela",
]) {
  try {
    const preview = await workbook.inspect({
      kind: "table",
      sheetId: name,
      range: "A1:L80",
      include: "values",
      tableMaxRows: 80,
      tableMaxCols: 12,
      maxChars: 30000,
    });
    console.log(`SHEET:${name}`);
    console.log(preview.ndjson);
  } catch {
    // Some historic tabs use slightly different casing; the sheet list remains authoritative.
  }
}
