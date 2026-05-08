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
 * Each system: { id, name, x, y, revealYear }
 * 
 * Sheet columns:
 *   A: system_id
 *   B: system_name
 *   C: system_x
 *   D: system_y
 *   E: reveal_year
 */
function getSystems() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Systems');
  var data = sheet.getDataRange().getValues();
  var systems = [];

  for (var i = 1; i < data.length; i++) {
    systems.push({
      id:         data[i][0],
      name:       data[i][1],
      x:          data[i][2],
      y:          data[i][3],
      revealYear: String(data[i][4])
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
// Player ship state, jump validation, K-F drive recharge tracking.
//
// SaveData keys used:
//   PLAYER_SHIP_SYSTEM_ID   | <system_id of current location>
//   PLAYER_SHIP_LAST_JUMP   | <SIM_TIME tick of last jump>
//
// Jump rules (Tier 1):
//   - Distance check: Euclidean (system_x, system_y) <= JUMP_RANGE_LY
//   - Recharge: lastJumpTick + RECHARGE_TICKS <= currentTick
//   - Translation is instantaneous; recharge gates the next jump only.
//   - No misjumps in this pass (see docs/discussions/jump-operations.md).
// ─────────────────────────────────────────────────────────────

var JUMP_RANGE_LY           = 30;
var RECHARGE_TICKS          = 7 * 86400;   // 7 days at 1 tick/sec = 604800
var DEFAULT_START_SYSTEM_ID = 2371;        // Terra

/**
 * Returns the player's ship state. Idempotently ensures both required
 * SaveData rows exist; on first call seeds the player at Terra with
 * the drive fully charged (lastJumpTick = -RECHARGE_TICKS).
 */
function getPlayerShip() {
  var sheet   = getSaveDataSheet();
  var sysRow  = findSaveRow(sheet, 'PLAYER_SHIP_SYSTEM_ID');
  if (sysRow === -1) {
    sysRow = sheet.getLastRow() + 1;
    sheet.getRange(sysRow, 1).setValue('PLAYER_SHIP_SYSTEM_ID');
    sheet.getRange(sysRow, 2).setValue(DEFAULT_START_SYSTEM_ID);
  }
  var jumpRow = findSaveRow(sheet, 'PLAYER_SHIP_LAST_JUMP');
  if (jumpRow === -1) {
    jumpRow = sheet.getLastRow() + 1;
    // Seed so the drive is "just charged" at the current sim time, not
    // 7 in-game days into the FTL-epoch's future (which would mark the
    // drive as recharging for ~26 in-game years).
    var seedTick = getSimTime();
    if (seedTick === null) seedTick = 0;
    sheet.getRange(jumpRow, 1).setValue('PLAYER_SHIP_LAST_JUMP');
    sheet.getRange(jumpRow, 2).setValue(seedTick - RECHARGE_TICKS - 1);
  }
  return {
    systemId:      Number(sheet.getRange(sysRow,  2).getValue()),
    lastJumpTick:  Number(sheet.getRange(jumpRow, 2).getValue()),
    jumpRangeLy:   JUMP_RANGE_LY,
    rechargeTicks: RECHARGE_TICKS
  };
}

/**
 * Sets the player's current system without consuming charge or
 * affecting the jump cooldown. Dev / testing helper.
 */
function setPlayerLocation(systemId) {
  getPlayerShip();   // ensures both ship rows exist
  var sheet  = getSaveDataSheet();
  var sysRow = findSaveRow(sheet, 'PLAYER_SHIP_SYSTEM_ID');
  sheet.getRange(sysRow, 2).setValue(Number(systemId));
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

/**
 * Attempts a jump to targetSystemId.
 *
 * currentTick is supplied by the client (single-player; trust the
 * client's clock). The server uses it for the recharge check and
 * also persists it via saveSimTime so the saved tick stays current.
 *
 * Returns:
 *   { ok: true,  ship: <updated ship state> }
 *   { ok: false, reason: 'unknown_system' }
 *   { ok: false, reason: 'out_of_range', distance, range }
 *   { ok: false, reason: 'recharging', ticksRemaining }
 */
function executeJump(targetSystemId, currentTick) {
  var ship    = getPlayerShip();
  var current = getSystemById_(ship.systemId);
  var target  = getSystemById_(targetSystemId);

  if (!target || !current) {
    return { ok: false, reason: 'unknown_system' };
  }

  var dx       = target.x - current.x;
  var dy       = target.y - current.y;
  var distance = Math.sqrt(dx * dx + dy * dy);
  if (distance > JUMP_RANGE_LY) {
    return { ok: false, reason: 'out_of_range', distance: distance, range: JUMP_RANGE_LY };
  }

  var nowTick        = Number(currentTick);
  var ticksRemaining = (ship.lastJumpTick + RECHARGE_TICKS) - nowTick;
  if (ticksRemaining > 0) {
    return { ok: false, reason: 'recharging', ticksRemaining: ticksRemaining };
  }

  // Commit. Both rows exist by construction (getPlayerShip seeds them).
  var sheet   = getSaveDataSheet();
  var sysRow  = findSaveRow(sheet, 'PLAYER_SHIP_SYSTEM_ID');
  var jumpRow = findSaveRow(sheet, 'PLAYER_SHIP_LAST_JUMP');
  sheet.getRange(sysRow,  2).setValue(Number(targetSystemId));
  sheet.getRange(jumpRow, 2).setValue(nowTick);
  saveSimTime(nowTick);

  return {
    ok: true,
    ship: {
      systemId:      Number(targetSystemId),
      lastJumpTick:  nowTick,
      jumpRangeLy:   JUMP_RANGE_LY,
      rechargeTicks: RECHARGE_TICKS
    }
  };
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
  const payload = assemblePayload_(character, relationship, goals, workingMemory, playerInput);
  return callAnthropic_(payload.systemPrompt, payload.userMessage);
}