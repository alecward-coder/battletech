# Parcel — Code-Based Data Orders in Apps Script + Google Sheets

**Origin repo:** `alecward-coder/battletech`
**Audience:** another Apps Script / Sheets-backed repo that believes sheet data can only be updated via the spreadsheet UI.
**Claim being rebutted:** "You can't update the canonical data without opening the sheet and editing it by hand."
**Reality:** This repo updates canonical sheet data routinely from code, via named functions ("orders") run from the Apps Script editor. No UI edits, no CSV round-trips, no manual cell entry.

---

## 1. The execution model

An Apps Script project bound to a spreadsheet can call `SpreadsheetApp.getActiveSpreadsheet()` and mutate any sheet in it. A public, zero-arg, top-level function shows up in the editor's **function dropdown** next to the ▶ Run button. Running it executes server-side against the live sheet.

That is the entire mechanism. A function that mutates the sheet is a **data order**. The dropdown is the order interface — no UI required, no menu items required, no triggers required.

**Operator workflow:**

1. Edit / push the `.gs` file.
2. Open the Apps Script editor for the bound project.
3. Select the order function from the dropdown.
4. Click Run. Authorize the scopes on first run.

That's it. The function runs to completion and the sheet is updated.

---

## 2. The contract that makes this safe

The pattern only works because every order is **idempotent and conservative**:

- **Idempotent** — running it twice produces the same end state as running it once. No duplicate rows, no double-applied updates.
- **Conservative** — it never overwrites a cell a human edited manually unless that's the explicit intent.

This is enforced by routing every sheet mutation through a small set of helpers. Direct `getRange().setValues()` calls outside these helpers are the exception, not the rule.

---

## 3. The four primitives

All four exist in `apps-script/SystemView.gs` in the origin repo and are reproduced below verbatim so you can drop them in.

### 3.1 `ensureSheetWithHeaders_(sheetName, headers)`

Creates the sheet if missing; rewrites the header row only if it doesn't already match. Safe to call every run.

```js
function ensureSheetWithHeaders_(sheetName, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    return sheet;
  }
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var existing = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var same = lastCol === headers.length;
  for (var i = 0; same && i < headers.length; i++) {
    if (existing[i] !== headers[i]) same = false;
  }
  if (!same) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}
```

### 3.2 `appendRowsIfMissing_(sheetName, headers, rows)`

Upsert-by-primary-key. Rows are objects keyed by header name. The **first header column is the primary key by convention.** Rows whose PK already exists in the sheet are skipped, so re-running an order doesn't duplicate.

```js
function appendRowsIfMissing_(sheetName, headers, rows) {
  if (!rows.length) return;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(sheetName + ' sheet not found; run bootstrap first.');

  var existingIds = {};
  if (sheet.getLastRow() > 1) {
    var idValues = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    for (var i = 0; i < idValues.length; i++) {
      var id = idValues[i][0];
      if (id !== '' && id !== null) existingIds[String(id)] = true;
    }
  }

  var toWrite = [];
  for (var r = 0; r < rows.length; r++) {
    var row = rows[r];
    var pk = String(row[headers[0]]);
    if (existingIds[pk]) continue;
    var rowArray = [];
    for (var c = 0; c < headers.length; c++) {
      var v = row[headers[c]];
      rowArray.push(v === undefined ? '' : v);
    }
    toWrite.push(rowArray);
  }
  if (!toWrite.length) return;
  var startRow = sheet.getLastRow() + 1;
  sheet.getRange(startRow, 1, toWrite.length, headers.length).setValues(toWrite);
}
```

### 3.3 `updateRowById_(sheetName, idCol, id, updates)`

Surgical update: find the row by id, set only the named columns. Unknown header keys in `updates` are skipped (forward-compatible with schemas that haven't grown the column yet).

The origin repo has this specialized to one sheet as `updateSystemRow_` (`SystemView.gs:203`); the generalized form:

```js
function updateRowById_(sheetName, idCol, id, updates) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error(sheetName + ' sheet not found.');
  var lastCol = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var idIdx = headers.indexOf(idCol);
  if (idIdx === -1) throw new Error(idCol + ' column not found in ' + sheetName);
  var ids = sheet.getRange(2, idIdx + 1, sheet.getLastRow() - 1, 1).getValues();
  var rowIndex = -1;
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) { rowIndex = i + 2; break; }
  }
  if (rowIndex === -1) throw new Error(id + ' not found in ' + sheetName);

  for (var key in updates) {
    var col = headers.indexOf(key);
    if (col === -1) continue;
    sheet.getRange(rowIndex, col + 1).setValue(updates[key]);
  }
}
```

### 3.4 `_backfillByIdInSheet_(sheetName, idCol, lookup, fieldMap)`

Fills columns that exist in the schema but are empty for some rows. **Only writes when the target cell is currently empty** — manual operator edits are never clobbered. This is the primitive that makes "add a new column and populate it from code" safe.

```js
function _backfillByIdInSheet_(sheetName, idCol, lookup, fieldMap) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return;
  var lastRow = sheet.getLastRow(), lastCol = sheet.getLastColumn();
  if (lastRow < 2) return;
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var idIdx   = headers.indexOf(idCol);
  if (idIdx === -1) return;
  var data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  var dirty = false;
  for (var r = 0; r < data.length; r++) {
    var entry = lookup[String(data[r][idIdx])];
    if (!entry) continue;
    for (var headerName in fieldMap) {
      var srcKey = fieldMap[headerName];
      if (entry[srcKey] === undefined) continue;
      var col = headers.indexOf(headerName);
      if (col === -1) continue;
      if (data[r][col] === '' || data[r][col] === null) {
        data[r][col] = entry[srcKey];
        dirty = true;
      }
    }
  }
  if (dirty) sheet.getRange(2, 1, data.length, lastCol).setValues(data);
}
```

---

## 4. The order pattern

A **data order** is a top-level function that composes these primitives into a complete operation. It does one thing, names it clearly, and is safe to re-run.

Origin-repo examples in `apps-script/SystemView.gs`:

| Order function | Lines | What it does |
|---|---|---|
| `bootstrapSystemView` | 111 | Creates all required sheets with current headers. |
| `seedSolSystem_` | 276 | Updates the Sol row, appends Sol-system bodies/infra/JPs, then runs the backfill. |
| `backfillSolOrbitalData_` | 346 | Fills new schema columns on existing rows without clobbering manual edits. |

Pattern for a new order (worked example):

```js
// Order: add a new "system_view_notes" column and populate from canon.
function addSystemViewNotes_() {
  ensureSheetWithHeaders_('Systems', SYSTEMS_HEADERS); // headers now include the new column
  _backfillByIdInSheet_('Systems', 'system_id', CANON_NOTES_, {
    system_view_notes: 'notes'
  });
}
```

To execute: push the file, open Apps Script, select `addSystemViewNotes_` from the dropdown, click Run.

---

## 5. Conventions

- **Trailing underscore** marks a helper or a non-operator-facing order. Apps Script doesn't enforce visibility; the convention is a signal.
- **First header column = primary key.** `appendRowsIfMissing_` relies on this. If your schema needs a different PK column, use `updateRowById_` style with an explicit `idCol`.
- **Backfill is opt-in, additive, never destructive.** If you need to overwrite a populated cell, do it with an explicit `updateRowById_` call, not a backfill.
- **All sheet writes route through helpers.** Direct `getRange().setValues()` in an order is a smell — it means the operation isn't using the idempotency contract.
- **Orders are zero-arg.** Anything parameterized goes in module-level constants (see `SOL_BODY_PARAMS_` at `SystemView.gs:235` for the shape).
- **Authorization scope:** the first run of any order against a fresh project prompts the operator for Sheets scope. Subsequent runs are silent.

---

## 6. Failure modes and how the contract handles them

| Concern | Why the pattern handles it |
|---|---|
| "Re-running the order will duplicate data." | `appendRowsIfMissing_` skips existing PKs. |
| "Running the order will overwrite my manual fixes." | `_backfillByIdInSheet_` only writes empty cells. `updateRowById_` is explicit and scoped to named columns. |
| "Adding a column means a destructive migration." | `ensureSheetWithHeaders_` rewrites only the header row, never data rows. Backfill is a separate, opt-in step. |
| "I don't want to expose every helper as a runnable order." | Trailing-underscore naming + keeping helpers as `function name_(...)` keeps the dropdown clean (Apps Script still lists them, but the convention scopes operator attention to the unsuffixed orders). |
| "What about concurrent edits while the order runs?" | Apps Script serializes script execution against a given spreadsheet for the same user. For shared sheets with concurrent operators, wrap critical sections in `LockService.getDocumentLock()`. The origin repo has not needed this yet. |

---

## 7. Minimum viable adoption

To bring the pattern into a new repo:

1. Copy the four primitives in §3 into a `.gs` file in the Apps Script project bound to the target spreadsheet.
2. For each piece of data you currently edit by hand, write one zero-arg order function that produces that state from code, composed of the primitives.
3. Run it once from the editor dropdown. Verify the sheet matches. Run it again — nothing should change.
4. From then on, the order function — committed to git — is the source of truth for that data shape. Sheet edits are operator overrides, not the system of record.

That last step is the cultural shift the parcel is meant to land: **the code is the canon, the sheet is the rendered state.**
