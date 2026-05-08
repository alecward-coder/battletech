// ────────────────────────────────────────────────────────────
// SYS-004: Map & Navigation — server-side
// Serves the map page and provides star system data
// ─────────────────────────────────────────────────────────────

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Phase 0 Starmap')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Returns all star systems from the Systems sheet.
 * Each system: { id, name, x, y, revealYear, hasSystemView }
 *
 * Reads has_system_view by header lookup so it tolerates new columns
 * being added to the Systems sheet (per SYS-014 bootstrap).
 */
function getSystems() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Systems');
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  var headers    = data[0];
  var hasViewCol = headers.indexOf('has_system_view');   // -1 if column not yet added
  var systems    = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var hsv = false;
    if (hasViewCol !== -1) {
      var raw = row[hasViewCol];
      hsv = (raw === true) || (raw === 1) || (String(raw).toUpperCase() === 'TRUE');
    }
    systems.push({
      id:            row[0],
      name:          row[1],
      x:             row[2],
      y:             row[3],
      revealYear:    String(row[4]),
      hasSystemView: hsv
    });
  }
  return systems;
}

// ─────────────────────────────────────────────────────────────
// SYS-001: Time Service — server-side save/load
// Reads and writes SIM_TIME_TICKS to the SaveData sheet.
//
// SaveData sheet layout:
//   Column A        |  Column B
//   Key             |  Value
//   ─────────────────────────────
//   SIM_TIME_TICKS  |  -831801600
//
// Add more keys in future rows as the save system grows.
// ─────────────────────────────────────────────────────────────

function getCurrentTick() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('SaveData');
  var data = sheet.getDataRange().getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === 'SIM_TIME_TICKS') return Number(data[i][1]);
  }
  return 0;
}
/**
 * Returns the SaveData sheet, creating it if it doesn't exist.
 * On first creation, seeds the header row and default time value.
 */
function getSaveDataSheet() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('SaveData');

  if (!sheet) {
    sheet = ss.insertSheet('SaveData');
    sheet.getRange(1, 1).setValue('Key');
    sheet.getRange(1, 2).setValue('Value');
    sheet.getRange(2, 1).setValue('SIM_TIME_TICKS');
    sheet.getRange(2, 2).setValue(-831801600);
  }

  return sheet;
}

/**
 * Finds the row number for a given key in the SaveData sheet.
 * Returns -1 if not found.
 */
function findSaveRow(sheet, key) {
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === key) return i + 1;
  }
  return -1;
}

/**
 * Returns the saved sim tick.
 * Returns null if the key doesn't exist.
 */
function getSimTime() {
  var sheet = getSaveDataSheet();
  var row   = findSaveRow(sheet, 'SIM_TIME_TICKS');
  if (row === -1) return null;
  return Number(sheet.getRange(row, 2).getValue());
}

/**
 * Persists the current sim tick to the SaveData sheet.
 */
function saveSimTime(tick) {
  var sheet = getSaveDataSheet();
  var row   = findSaveRow(sheet, 'SIM_TIME_TICKS');

  if (row === -1) {
    var lastRow = sheet.getLastRow() + 1;
    sheet.getRange(lastRow, 1).setValue('SIM_TIME_TICKS');
    sheet.getRange(lastRow, 2).setValue(tick);
  } else {
    sheet.getRange(row, 2).setValue(tick);
  }
}

// ─────────────────────────────────────────────────────────────
// SYS-013: Movement & Jump — server-side
// Player ship state, jump validation, K-F drive recharge tracking,
// jump preparation sequence, and emergency-jump override.
//
// SaveData keys used:
//   PLAYER_SHIP_SYSTEM_ID       | <system_id of current location>
//   PLAYER_SHIP_LAST_JUMP       | <SIM_TIME tick of last jump>
//   PLAYER_SHIP_PENDING_TARGET  | <system_id of pending jump target, 0 = none>
//   PLAYER_SHIP_PREP_END        | <SIM_TIME tick when prep completes, 0 = none>
//
// State machine (kfDriveState, derived from data):
//   READY          drive charged, no pending target
//   PREPPING       pending target set, currentTick <  prepEnd
//   READY_TO_JUMP  pending target set, currentTick >= prepEnd
//   RECHARGING     currentTick < lastJump + RECHARGE_TICKS
//
// Jump rules (Tier 2):
//   - Distance check: Euclidean (system_x, system_y) <= JUMP_RANGE_LY
//   - Normal jump: beginJumpPrep -> wait JUMP_PREP_TICKS -> commitJump
//   - Emergency jump: bypass prep, immediate translate, log risk warning
//   - Recharge: lastJumpTick + RECHARGE_TICKS <= currentTick before next prep
//   - No misjumps yet (see docs/discussions/jump-operations.md);
//     calculateEmergencyJumpRisk_ + resolveEmergencyJumpConsequences_
//     stubbed for the future damage / misjump model.
// ─────────────────────────────────────────────────────────────

var JUMP_RANGE_LY           = 30;
var RECHARGE_TICKS          = 7 * 86400;   // 7 days at 1 tick/sec = 604800
var JUMP_PREP_TICKS         = 2 * 3600;    // 2 hours = 7200
var DEFAULT_START_SYSTEM_ID = 2371;        // Terra

/**
 * Derives the ship's K-F drive state from raw fields + currentTick.
 * Same logic mirrored on the client; keep them in sync.
 */
function deriveKfDriveState_(ship, currentTick) {
  var isRecharging = currentTick < (ship.lastJumpTick + RECHARGE_TICKS);
  var hasPrep      = ship.pendingJumpTargetId && ship.pendingJumpTargetId !== 0;

  if (hasPrep) {
    if (isRecharging) return 'RECHARGING';   // shouldn't normally happen
    if (currentTick < ship.jumpPrepEndTime) return 'PREPPING';
    return 'READY_TO_JUMP';
  }
  if (isRecharging) return 'RECHARGING';
  return 'READY';
}

/**
 * Reads or seeds a SaveData row. If missing, creates a row with the
 * given seed value. Returns the (possibly newly-written) numeric value.
 */
function ensureSaveRow_(sheet, key, seedValue) {
  var row = findSaveRow(sheet, key);
  if (row === -1) {
    row = sheet.getLastRow() + 1;
    sheet.getRange(row, 1).setValue(key);
    sheet.getRange(row, 2).setValue(seedValue);
    return seedValue;
  }
  return Number(sheet.getRange(row, 2).getValue());
}

/**
 * Returns the player's ship state. Idempotently ensures all required
 * SaveData rows exist; on first call seeds the player at Terra with
 * the drive fully charged.
 *
 * Returns:
 *   {
 *     systemId, lastJumpTick,
 *     pendingJumpTargetId, jumpPrepEndTime,
 *     kfDriveState,
 *     jumpRangeLy, rechargeTicks, jumpPrepTicks
 *   }
 */
function getPlayerShip() {
  var sheet = getSaveDataSheet();

  var systemId    = ensureSaveRow_(sheet, 'PLAYER_SHIP_SYSTEM_ID', DEFAULT_START_SYSTEM_ID);
  // Seed lastJumpTick relative to the current saved sim time so the
  // drive is "just charged" at the start, not 7 in-game days into the
  // FTL-epoch's future.
  var seedSimTick = getSimTime();
  if (seedSimTick === null) seedSimTick = 0;
  var lastJumpTick = ensureSaveRow_(sheet, 'PLAYER_SHIP_LAST_JUMP', seedSimTick - RECHARGE_TICKS - 1);
  var pendingJumpTargetId = ensureSaveRow_(sheet, 'PLAYER_SHIP_PENDING_TARGET', 0);
  var jumpPrepEndTime     = ensureSaveRow_(sheet, 'PLAYER_SHIP_PREP_END',       0);

  var ship = {
    systemId:            Number(systemId),
    lastJumpTick:        Number(lastJumpTick),
    pendingJumpTargetId: Number(pendingJumpTargetId),
    jumpPrepEndTime:     Number(jumpPrepEndTime),
    jumpRangeLy:         JUMP_RANGE_LY,
    rechargeTicks:       RECHARGE_TICKS,
    jumpPrepTicks:       JUMP_PREP_TICKS
  };
  // kfDriveState is stamped relative to seedSimTick (the saved tick).
  // Client should re-derive against its current simTick for live UI.
  ship.kfDriveState = deriveKfDriveState_(ship, seedSimTick);
  return ship;
}

/** Writes a single SaveData key. Assumes the row already exists. */
function writeSaveKey_(sheet, key, value) {
  var row = findSaveRow(sheet, key);
  if (row === -1) {
    row = sheet.getLastRow() + 1;
    sheet.getRange(row, 1).setValue(key);
  }
  sheet.getRange(row, 2).setValue(value);
}

/**
 * Sets the player's current system without consuming charge.
 * Also clears any pending prep so the dev "set as starting position"
 * is a clean reset. Dev / testing helper.
 */
function setPlayerLocation(systemId) {
  getPlayerShip();   // ensures all rows exist
  var sheet = getSaveDataSheet();
  writeSaveKey_(sheet, 'PLAYER_SHIP_SYSTEM_ID',      Number(systemId));
  writeSaveKey_(sheet, 'PLAYER_SHIP_PENDING_TARGET', 0);
  writeSaveKey_(sheet, 'PLAYER_SHIP_PREP_END',       0);
  return getPlayerShip();
}

/**
 * Looks up a system by id. Returns { id, name, x, y } or null.
 */
function getSystemById_(systemId) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Systems');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (Number(data[i][0]) === Number(systemId)) {
      return {
        id:   data[i][0],
        name: data[i][1],
        x:    Number(data[i][2]),
        y:    Number(data[i][3])
      };
    }
  }
  return null;
}

function distanceLy_(a, b) {
  var dx = a.x - b.x, dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Begin a normal jump: validates range + drive ready (READY only),
 * stores pending target, sets prep-end tick.
 *
 * Returns { ok, ship } or { ok:false, reason, ... }.
 *   reason: 'unknown_system' | 'out_of_range' | 'recharging' |
 *           'already_prepping' | 'invalid_state'
 */
function beginJumpPrep(targetSystemId, currentTick) {
  var nowTick = Number(currentTick);
  var ship    = getPlayerShip();
  var state   = deriveKfDriveState_(ship, nowTick);

  if (state === 'RECHARGING') {
    return {
      ok: false, reason: 'recharging',
      ticksRemaining: (ship.lastJumpTick + RECHARGE_TICKS) - nowTick
    };
  }
  if (state === 'PREPPING' || state === 'READY_TO_JUMP') {
    return { ok: false, reason: 'already_prepping' };
  }
  if (state !== 'READY') {
    return { ok: false, reason: 'invalid_state', state: state };
  }

  var current = getSystemById_(ship.systemId);
  var target  = getSystemById_(targetSystemId);
  if (!target || !current) return { ok: false, reason: 'unknown_system' };

  var distance = distanceLy_(current, target);
  if (distance > JUMP_RANGE_LY) {
    return { ok: false, reason: 'out_of_range', distance: distance, range: JUMP_RANGE_LY };
  }

  var sheet   = getSaveDataSheet();
  var prepEnd = nowTick + JUMP_PREP_TICKS;
  writeSaveKey_(sheet, 'PLAYER_SHIP_PENDING_TARGET', Number(targetSystemId));
  writeSaveKey_(sheet, 'PLAYER_SHIP_PREP_END',       prepEnd);
  saveSimTime(nowTick);

  return { ok: true, ship: getPlayerShip() };
}

/**
 * Commit a prepared jump. Requires state == READY_TO_JUMP.
 *
 * On success: ship's systemId becomes pendingJumpTargetId,
 * lastJumpTick = nowTick, prep is cleared, drive enters recharge.
 */
function commitJump(currentTick) {
  var nowTick = Number(currentTick);
  var ship    = getPlayerShip();
  var state   = deriveKfDriveState_(ship, nowTick);

  if (state !== 'READY_TO_JUMP') {
    return { ok: false, reason: 'invalid_state', state: state };
  }

  var target = getSystemById_(ship.pendingJumpTargetId);
  if (!target) return { ok: false, reason: 'unknown_system' };

  var sheet = getSaveDataSheet();
  writeSaveKey_(sheet, 'PLAYER_SHIP_SYSTEM_ID',      Number(ship.pendingJumpTargetId));
  writeSaveKey_(sheet, 'PLAYER_SHIP_LAST_JUMP',      nowTick);
  writeSaveKey_(sheet, 'PLAYER_SHIP_PENDING_TARGET', 0);
  writeSaveKey_(sheet, 'PLAYER_SHIP_PREP_END',       0);
  saveSimTime(nowTick);

  return { ok: true, ship: getPlayerShip() };
}

/**
 * Emergency jump: bypass prep, translate immediately. Allowed from
 * any non-RECHARGING state. Clears any in-progress prep. Logs a
 * risk warning via the stub but doesn't apply consequences yet.
 */
function emergencyJump(targetSystemId, currentTick) {
  var nowTick = Number(currentTick);
  var ship    = getPlayerShip();
  var state   = deriveKfDriveState_(ship, nowTick);

  if (state === 'RECHARGING') {
    return {
      ok: false, reason: 'recharging',
      ticksRemaining: (ship.lastJumpTick + RECHARGE_TICKS) - nowTick
    };
  }

  var current = getSystemById_(ship.systemId);
  var target  = getSystemById_(targetSystemId);
  if (!target || !current) return { ok: false, reason: 'unknown_system' };

  var distance = distanceLy_(current, target);
  if (distance > JUMP_RANGE_LY) {
    return { ok: false, reason: 'out_of_range', distance: distance, range: JUMP_RANGE_LY };
  }

  var risk = calculateEmergencyJumpRisk_(ship, target, nowTick);
  resolveEmergencyJumpConsequences_(ship, risk);   // no-op stub for now

  var sheet = getSaveDataSheet();
  writeSaveKey_(sheet, 'PLAYER_SHIP_SYSTEM_ID',      Number(targetSystemId));
  writeSaveKey_(sheet, 'PLAYER_SHIP_LAST_JUMP',      nowTick);
  writeSaveKey_(sheet, 'PLAYER_SHIP_PENDING_TARGET', 0);
  writeSaveKey_(sheet, 'PLAYER_SHIP_PREP_END',       0);
  saveSimTime(nowTick);

  return {
    ok: true,
    ship: getPlayerShip(),
    warning: 'Emergency jump performed. Shipwide disruption risk logged.',
    risk: risk
  };
}

/**
 * Cancels in-progress jump prep. Allowed from PREPPING or
 * READY_TO_JUMP states. Drive remains at its prior recharge state.
 */
function abortJumpPrep(currentTick) {
  var nowTick = Number(currentTick);
  var ship    = getPlayerShip();
  var state   = deriveKfDriveState_(ship, nowTick);

  if (state !== 'PREPPING' && state !== 'READY_TO_JUMP') {
    return { ok: false, reason: 'invalid_state', state: state };
  }

  var sheet = getSaveDataSheet();
  writeSaveKey_(sheet, 'PLAYER_SHIP_PENDING_TARGET', 0);
  writeSaveKey_(sheet, 'PLAYER_SHIP_PREP_END',       0);
  saveSimTime(nowTick);

  return { ok: true, ship: getPlayerShip() };
}

// Stubs for the future damage / misjump model. See
// docs/discussions/jump-operations.md for the design.
function calculateEmergencyJumpRisk_(ship, target, currentTick) {
  // TODO: incorporate distance, drive maintenance, crew skill, etc.
  return {
    distance:        distanceLy_(getSystemById_(ship.systemId), target),
    severityModel:  'placeholder',
    rolledOutcome:  'nominal'
  };
}
function resolveEmergencyJumpConsequences_(ship, risk) {
  // TODO: apply drive damage / crew injuries / extended recharge.
  // No-op for now; risk object is logged client-side as a warning.
}

// ==============================================================
// SYS-012  Character Behavior — Prompt Assembly & AI Interface
// ============================================================

// --- Sheet reader utility ---
function sheetToObjects_(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  return data.slice(1)
    .filter(row => row[0] !== '')
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
}

// --- Data fetchers ---
function getCharacter_(characterId) {
  return sheetToObjects_('Characters').find(c => c.character_id === characterId);
}

function getRelationship_(sourceId, targetId) {
  return sheetToObjects_('Relationships').find(r =>
    r.source_character_id === sourceId && r.target_entity_id === targetId
  );
}

function getGoals_(characterId) {
  return sheetToObjects_('Goals').filter(g =>
    g.character_id === characterId && g.status === 'active'
  );
}

function getMemories_(characterId) {
  return sheetToObjects_('Memory').filter(m => m.character_id === characterId);
}

// --- Working memory selection (Section 12) ---
function selectWorkingMemory_(memories, goals, relationship, n) {
  n = n || 7;
  const now = getCurrentTick();

  const scored = memories.map(function(mem) {
    let score = 0;

    const age = now - Number(mem.created_time);
    score += Math.max(0, 100 - (age / 1e8)) * 0.25;

    score += (Number(mem.importance) || 0) * 0.35;

    if (mem.long_term_flag === true || mem.long_term_flag === 'TRUE') score += 20;

    const goalEntities = goals.flatMap(g => (g.related_entities || '').split('|'));
    if (goalEntities.some(e => e.includes(mem.related_entity_id))) score += 20;

    if (relationship && mem.related_entity_id === relationship.target_entity_id) score += 25;

    return Object.assign({}, mem, { _score: score });
  });

  scored.sort(function(a, b) { return b._score - a._score; });
  return scored.slice(0, n);
}

// --- Payload assembly (Section 11) ---
function assemblePayload_(character, relationship, goals, workingMemory, playerInput) {

  const systemPrompt = [
    'You are roleplaying as ' + character.character_name + ', a ' + character.role + '.',
    '',
    'PERSONALITY & EXPRESSION:',
    '- Directness: ' + character.directness,
    '- Emotional openness: ' + character.emotional_openness,
    '- Confidence style: ' + character.confidence_style,
    '- Humor usage: ' + character.humor_usage,
    '- Sarcasm: ' + character.sarcasm_usage,
    '- Preferred sentence length: ' + character.preferred_sentence_length,
    '- Talkativeness (0-100): ' + character.talkativeness,
    '',
    'VOICE:',
    '- Formality: ' + character.formality,
    '- Cadence: ' + character.cadence,
    '- Radio effect: ' + character.radio_effect,
    '',
    'ROLE BOUNDARIES:',
    character.role_boundaries || 'No specific role boundaries defined.',
    '',
    'KNOWLEDGE CONSTRAINTS:',
    character.knowledge_constraints || 'No specific knowledge constraints defined.'
  ].join('\n');

  const stateBlock = [
    'CURRENT STATE:',
    'Mood: ' + character.mood,
    'Stress: ' + character.stress + '/100',
    'Condition: ' + character.condition
  ].join('\n');

  const relBlock = relationship ? [
    'RELATIONSHIP TO INTERLOCUTOR:',
    'Trust: '     + relationship.trust      + '/100',
    'Respect: '   + relationship.respect    + '/100',
    'Affection: ' + relationship.affection  + '/100',
    'Suspicion: ' + relationship.suspicion  + '/100',
    'Fear: '      + relationship.fear       + '/100',
    'Loyalty: '   + relationship.loyalty    + '/100'
  ].join('\n') : 'RELATIONSHIP: No prior relationship data.';

  const memBlock = [
    'WORKING MEMORY (most relevant to this interaction):',
    workingMemory.map(function(m, i) {
      return (i + 1) + '. [' + m.emotion_tag + '] ' + m.event_summary;
    }).join('\n')
  ].join('\n');

  const secretGoals = goals.filter(function(g) { return g.visibility === 'secret'; });
  const publicGoals = goals.filter(function(g) { return g.visibility === 'public'; });

  const goalsBlock = [
    'YOUR GOALS (secret — pursue these but never state them directly):',
    secretGoals.map(function(g) {
      return '- [Priority ' + g.priority + '] ' + g.goal_text;
    }).join('\n'),
    '',
    'STATED GOALS (may acknowledge if pressed):',
    publicGoals.map(function(g) { return '- ' + g.goal_text; }).join('\n')
  ].join('\n');

  const userMessage = [
    stateBlock, '', relBlock, '', memBlock, '', goalsBlock,
    '',
    'PLAYER SAYS: "' + playerInput + '"'
  ].join('\n');

  return { systemPrompt: systemPrompt, userMessage: userMessage };
}

// --- OpenAI API call ---
function callAnthropic_(systemPrompt, userMessage) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY not set in Script Properties.');

  const payload = {
    model: 'gpt-4o',
    max_tokens: 1024,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': 'Bearer ' + apiKey },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', options);
  const json = JSON.parse(response.getContentText());

  if (json.error) throw new Error('OpenAI API error: ' + json.error.message);
  return json.choices[0].message.content;
}

// --- Main entry point (called from frontend) ---
function talkToCharacter(characterId, targetId, playerInput) {
  const character = getCharacter_(characterId);
  if (!character) throw new Error('Character not found: ' + characterId);

  const relationship  = getRelationship_(characterId, targetId);
  const goals         = getGoals_(characterId);
  const memories      = getMemories_(characterId);
  const workingMemory = selectWorkingMemory_(memories, goals, relationship);

  const payload = assemblePayload_(character, relationship, goals, workingMemory, playerInput);
  return callAnthropic_(payload.systemPrompt, payload.userMessage);
}