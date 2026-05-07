/**
 * Sheet → CSV exporter.
 *
 * Run once from the Apps Script editor (or paste into the existing project)
 * to dump every tab of the live "BattleTech (Game)" spreadsheet to CSV files
 * in a Drive folder, then download them and replace the contents of seeds/.
 *
 * Idempotent: re-running overwrites the same files in the target folder.
 */

const SHEET_ID = '1nr-9ln8iWfK_ajDYpi7csVOfvfJKy_5IUxUrgB7EfD4';
const EXPORT_FOLDER_NAME = 'battletech-csv-exports';

function exportAllSheetsToCsv() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const folder = getOrCreateFolder_(EXPORT_FOLDER_NAME);

  const written = [];
  ss.getSheets().forEach(function (sheet) {
    const name = sheet.getName();
    const csv = sheetToCsv_(sheet);
    upsertFile_(folder, slug_(name) + '.csv', csv);
    written.push(name);
  });

  Logger.log('Exported %s tabs to folder: %s', written.length, folder.getUrl());
  Logger.log('Tabs: %s', written.join(', '));
  return folder.getUrl();
}

function sheetToCsv_(sheet) {
  const range = sheet.getDataRange();
  if (range.getNumRows() === 0) return '';
  const values = range.getValues();
  return values.map(function (row) { return row.map(csvCell_).join(','); }).join('\n');
}

function csvCell_(value) {
  if (value === null || value === undefined) return '';
  let s = String(value);
  if (s.indexOf('"') !== -1) s = s.replace(/"/g, '""');
  if (/[",\n\r]/.test(s)) s = '"' + s + '"';
  return s;
}

function slug_(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function getOrCreateFolder_(name) {
  const it = DriveApp.getFoldersByName(name);
  return it.hasNext() ? it.next() : DriveApp.createFolder(name);
}

function upsertFile_(folder, fileName, content) {
  const it = folder.getFilesByName(fileName);
  if (it.hasNext()) {
    const f = it.next();
    f.setContent(content);
    return f;
  }
  return folder.createFile(fileName, content, MimeType.CSV);
}
