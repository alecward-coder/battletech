// ─────────────────────────────────────────────────────────────
// SYS-014: Star System View — schema bootstrap + Sol seed
//
// One-time setup: from the Apps Script editor, select
// `bootstrapSystemView` from the function dropdown and click Run.
// Idempotent — running again is a no-op once everything's in place.
//
// Tables:
//   Systems                  (extended in place — new columns added to right)
//   Celestial_Bodies         (new tab)
//   Orbital_Infrastructure   (new tab)
//   Jump_Points              (new tab)
//   In_System_Routes         (new tab)
//   Local_Comm_Networks      (new tab)
//   System_Data_Sources      (new tab)
//
// Sol system seeded with canon entities (Terra / Mars / Venus / Luna /
// Titan shipyards / ComStar HQ at Hilton Head, Terra HPG, etc.) plus
// generated/inferred rows for the rest of the planets, major moons,
// asteroid belt, jump points, and local routes. All rows have
// canonical_status set so generated data is never confused for canon.
//
// Era: 2786 TC (post-Star-League collapse). Titan shipyards marked as
// contested/operational but unstable.
// ─────────────────────────────────────────────────────────────

var SOL_SYSTEM_ID = 2371;

// ─── Schema definitions ──────────────────────────────────────

var SYSTEMS_NEW_COLUMNS = [
  'primary_star_name',
  'star_type',
  'canonical_status',
  'has_system_view',
  'default_arrival_point',
  'primary_inhabited_body_id',
  'capital_body_id',
  'hpg_present',
  'hpg_body_id',
  'system_security_level',
  'traffic_level',
  'strategic_value',
  'system_view_notes'
];

var CELESTIAL_BODIES_HEADERS = [
  'body_id', 'system_id', 'body_name', 'scientific_name', 'body_type',
  'orbit_parent_id', 'orbit_order', 'orbit_band',
  'is_inhabited', 'population_level', 'habitability_class',
  'atmosphere_type', 'gravity_level', 'temperature_profile',
  'water_presence', 'terrain_profile', 'industrial_value',
  'military_value', 'political_owner', 'canonical_status',
  'source_note', 'notes',
  // SYS-014b: real orbital + physical parameters
  'body_radius_km',
  'axial_rotation_period_hours',
  'semi_major_axis_au',
  'orbital_period_days',
  'orbital_l0_deg'
];

var ORBITAL_INFRASTRUCTURE_HEADERS = [
  'facility_id', 'system_id', 'facility_name', 'facility_type',
  'orbiting_body_id', 'location_type', 'owner', 'operator',
  'operational_status', 'security_level', 'traffic_level',
  'repair_capacity', 'dock_capacity', 'shipyard_capacity',
  'military_presence', 'hpg_capable', 'black_box_capable',
  'canonical_status', 'source_note', 'notes',
  // SYS-014b: positional placement for orbital and surface views
  'altitude_km',
  'surface_lat',
  'surface_lon'
];

var JUMP_POINTS_HEADERS = [
  'jump_point_id', 'system_id', 'jump_point_name', 'jump_point_type',
  'associated_body_id', 'location_description',
  'distance_from_primary_world', 'risk_level', 'navigation_difficulty',
  'recharge_quality', 'is_standard', 'is_pirate_point', 'is_known',
  'canonical_status', 'source_note', 'notes',
  // SYS-014b: explicit scope for system-view vs orbital-view placement
  'scope'
];

var IN_SYSTEM_ROUTES_HEADERS = [
  'route_id', 'system_id',
  'origin_location_id', 'origin_location_type',
  'destination_location_id', 'destination_location_type',
  'route_type',
  'estimated_travel_time_hours', 'estimated_travel_time_days',
  'risk_level', 'traffic_level', 'patrol_level', 'piracy_risk',
  'sensor_coverage', 'notes'
];

var LOCAL_COMM_NETWORKS_HEADERS = [
  'comm_id', 'system_id', 'comm_name', 'comm_type',
  'coverage_scope', 'linked_body_id', 'linked_facility_id',
  'owner', 'operator', 'operational_status',
  'security_level', 'bandwidth_level', 'military_priority', 'notes'
];

var SYSTEM_DATA_SOURCES_HEADERS = [
  'source_id', 'system_id', 'entity_type', 'entity_id',
  'source_name', 'source_type', 'canon_confidence',
  'data_status', 'notes'
];

// ─── Public entry point ──────────────────────────────────────

function bootstrapSystemView() {
  addSystemsColumns_();
  ensureSheetWithHeaders_('Celestial_Bodies',       CELESTIAL_BODIES_HEADERS);
  ensureSheetWithHeaders_('Orbital_Infrastructure', ORBITAL_INFRASTRUCTURE_HEADERS);
  ensureSheetWithHeaders_('Jump_Points',            JUMP_POINTS_HEADERS);
  ensureSheetWithHeaders_('In_System_Routes',       IN_SYSTEM_ROUTES_HEADERS);
  ensureSheetWithHeaders_('Local_Comm_Networks',    LOCAL_COMM_NETWORKS_HEADERS);
  ensureSheetWithHeaders_('System_Data_Sources',    SYSTEM_DATA_SOURCES_HEADERS);
  seedSolSystem_();
  return 'SYS-014 bootstrap complete. Sol system seeded.';
}

// ─── Schema helpers ──────────────────────────────────────────

function addSystemsColumns_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Systems');
  if (!sheet) throw new Error('Systems sheet not found.');
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  for (var i = 0; i < SYSTEMS_NEW_COLUMNS.length; i++) {
    var name = SYSTEMS_NEW_COLUMNS[i];
    if (headers.indexOf(name) === -1) {
      lastCol += 1;
      sheet.getRange(1, lastCol).setValue(name);
      headers.push(name);
    }
  }
}

function ensureSheetWithHeaders_(sheetName, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    return sheet;
  }
  // Rewrite header row only if it doesn't already match.
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

/**
 * Appends rows shaped as objects (keyed by header) to the named
 * sheet, but only if not already present (judged by the value of
 * the first header column = primary id).
 */
function appendRowsIfMissing_(sheetName, headers, rows) {
  if (!rows.length) return;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(sheetName + ' sheet not found; run bootstrap first.');

  // Figure out which IDs already exist (column 1 = primary key by convention).
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

/** Updates a Systems-sheet row in place by system_id, setting only
 *  the columns named in `updates` (keyed by header name). */
function updateSystemRow_(systemId, updates) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Systems');
  var lastCol = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var ids     = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  var rowIndex = -1;
  for (var i = 0; i < ids.length; i++) {
    if (Number(ids[i][0]) === Number(systemId)) {
      rowIndex = i + 2; // sheet row (1-indexed, header on row 1)
      break;
    }
  }
  if (rowIndex === -1) throw new Error('System ' + systemId + ' not found in Systems sheet.');

  for (var key in updates) {
    var col = headers.indexOf(key);
    if (col === -1) continue; // skip unknown headers
    sheet.getRange(rowIndex, col + 1).setValue(updates[key]);
  }
}

// ─── Sol seed data ───────────────────────────────────────────

// ─── SYS-014b: Real Sol orbital + physical parameters ──────────
//
// Periods are sidereal Earth days. L0 is ecliptic mean longitude (deg)
// at J2000.0. Semi-major axes are in AU. Body radii are equatorial km.
// Moons use real distances in AU; their tiny values render sub-pixel
// at default system scale, which is the point — they're correct.
// Axial rotation periods are positive sidereal Earth hours; Venus is
// negative because it rotates retrograde.

var SOL_BODY_PARAMS_ = {
  // body_id : { radius_km, rot_h, a_au, period_d, L0_deg }
  '2371-sol':     { radius_km: 695700,  rot_h: 609.12 },
  '2371-mercury': { radius_km:   2440,  rot_h: 1407.5,  a_au: 0.387,    period_d:    87.969,  L0_deg: 252.25166 },
  '2371-venus':   { radius_km:   6052,  rot_h: -5832.5, a_au: 0.723,    period_d:   224.701,  L0_deg: 181.97970 },
  '2371-terra':   { radius_km:   6371,  rot_h:    23.9344, a_au: 1.000, period_d:   365.256,  L0_deg: 100.46435 },
  '2371-mars':    { radius_km:   3390,  rot_h:    24.6229, a_au: 1.524, period_d:   686.971,  L0_deg: 355.43332 },
  '2371-jupiter': { radius_km:  69911,  rot_h:     9.9259, a_au: 5.203, period_d:  4332.589,  L0_deg:  34.40438 },
  '2371-saturn':  { radius_km:  58232,  rot_h:    10.656,  a_au: 9.537, period_d: 10759.22,   L0_deg:  49.94432 },
  '2371-uranus':  { radius_km:  25362,  rot_h:   -17.24,   a_au: 19.191,period_d: 30688.5,    L0_deg: 313.23218 },
  '2371-neptune': { radius_km:  24622,  rot_h:    16.11,   a_au: 30.069,period_d: 60182,      L0_deg: 304.88003 },
  // Moons: a_au is parent-relative, period is sidereal.
  '2371-luna':     { radius_km: 1737, rot_h:   655.7,   a_au: 0.002570, period_d: 27.3217,  L0_deg:   0 },
  '2371-phobos':   { radius_km:   11, rot_h:     7.6553, a_au: 0.0000627, period_d: 0.31891, L0_deg:  0 },
  '2371-deimos':   { radius_km:    6, rot_h:    30.30,   a_au: 0.0001569, period_d: 1.26244, L0_deg: 90 },
  '2371-io':       { radius_km: 1822, rot_h:    42.46,   a_au: 0.002819,  period_d: 1.76914, L0_deg:  0 },
  '2371-europa':   { radius_km: 1561, rot_h:    85.23,   a_au: 0.004486,  period_d: 3.55118, L0_deg: 60 },
  '2371-ganymede': { radius_km: 2634, rot_h:   171.71,   a_au: 0.007155,  period_d: 7.15455, L0_deg: 120 },
  '2371-callisto': { radius_km: 2410, rot_h:   400.54,   a_au: 0.012587,  period_d: 16.6890, L0_deg: 200 },
  '2371-titan':    { radius_km: 2575, rot_h:   382.69,   a_au: 0.008168,  period_d: 15.9454, L0_deg:  0 }
};

// Real altitudes / surface coords for Sol orbital infrastructure.
// surface_*  for surface installations (lat, lon in decimal degrees).
// altitude_km for orbital installations (above the parent body's surface).
var SOL_INFRASTRUCTURE_PARAMS_ = {
  '2371-fac-comstar-hq':       { surface_lat:  32.20, surface_lon: -80.75 },     // Hilton Head, Terra
  '2371-fac-terra-hpg':        { surface_lat:  32.20, surface_lon: -80.75 },     // colocated with HQ in canon
  '2371-fac-titan-shipyards':  { altitude_km: 1500 },                            // Titan orbit
  '2371-fac-luna-base':        { surface_lat:   0.67, surface_lon:  23.47 },     // generic equatorial Luna site
  '2371-fac-zenith-recharge':  { altitude_km:  0 }                               // colocated with zenith JP, scope-deep_space
};

// Default scope for jump-point types. zenith/nadir/lagrange are system-
// scope; pirate points hang off a planet so they're orbital scope.
function _defaultJpScope_(jpType) {
  var t = String(jpType || '').trim().toLowerCase();
  if (t === 'pirate_point') return 'planet';
  return 'system';
}

function seedSolSystem_() {
  // Update Systems row for Sol with the new in-system metadata.
  updateSystemRow_(SOL_SYSTEM_ID, {
    primary_star_name:         'Sol',
    star_type:                 'G2V',
    canonical_status:          'canon',
    has_system_view:           true,
    default_arrival_point:     '2371-jp-zenith',
    primary_inhabited_body_id: '2371-terra',
    capital_body_id:           '2371-terra',
    hpg_present:               true,
    hpg_body_id:               '2371-terra',
    system_security_level:     'high',
    traffic_level:              'extreme',
    strategic_value:           'capital',
    system_view_notes:
      '2786 TC: post-Star-League collapse. ComStar consolidating ' +
      'control. Titan shipyards contested. Terra HPG operational.'
  });

  // Augment seed rows with the new orbital / physical / placement fields
  // so freshly-appended rows already carry that data.
  var bodies = SOL_BODIES_.map(function(b) {
    var p = SOL_BODY_PARAMS_[b.body_id];
    if (!p) return b;
    var out = {};
    for (var k in b) out[k] = b[k];
    if (p.radius_km !== undefined) out.body_radius_km = p.radius_km;
    if (p.rot_h     !== undefined) out.axial_rotation_period_hours = p.rot_h;
    if (p.a_au      !== undefined) out.semi_major_axis_au = p.a_au;
    if (p.period_d  !== undefined) out.orbital_period_days = p.period_d;
    if (p.L0_deg    !== undefined) out.orbital_l0_deg = p.L0_deg;
    return out;
  });
  var infra = SOL_INFRASTRUCTURE_.map(function(f) {
    var p = SOL_INFRASTRUCTURE_PARAMS_[f.facility_id];
    if (!p) return f;
    var out = {};
    for (var k in f) out[k] = f[k];
    if (p.altitude_km  !== undefined) out.altitude_km  = p.altitude_km;
    if (p.surface_lat  !== undefined) out.surface_lat  = p.surface_lat;
    if (p.surface_lon  !== undefined) out.surface_lon  = p.surface_lon;
    return out;
  });
  var jps = SOL_JUMP_POINTS_.map(function(jp) {
    var out = {};
    for (var k in jp) out[k] = jp[k];
    if (out.scope === undefined || out.scope === '') {
      out.scope = _defaultJpScope_(jp.jump_point_type);
    }
    return out;
  });

  appendRowsIfMissing_('Celestial_Bodies', CELESTIAL_BODIES_HEADERS, bodies);
  appendRowsIfMissing_('Orbital_Infrastructure', ORBITAL_INFRASTRUCTURE_HEADERS, infra);
  appendRowsIfMissing_('Jump_Points', JUMP_POINTS_HEADERS, jps);
  appendRowsIfMissing_('In_System_Routes', IN_SYSTEM_ROUTES_HEADERS, SOL_ROUTES_);
  appendRowsIfMissing_('Local_Comm_Networks', LOCAL_COMM_NETWORKS_HEADERS, SOL_COMMS_);
  appendRowsIfMissing_('System_Data_Sources', SYSTEM_DATA_SOURCES_HEADERS, SOL_SOURCES_);

  // Backfill the new SYS-014b columns on rows that already exist in the
  // sheets (appendRowsIfMissing_ skips them, so they'd otherwise stay
  // empty for the new headers).
  backfillSolOrbitalData_();
}

// Walks Celestial_Bodies, Orbital_Infrastructure, and Jump_Points and
// fills in the SYS-014b parameter columns for any row whose primary id
// matches a Sol seed entry — but only when the cell is currently empty,
// so manual edits aren't clobbered.
function backfillSolOrbitalData_() {
  _backfillByIdInSheet_('Celestial_Bodies', 'body_id', SOL_BODY_PARAMS_, {
    body_radius_km:               'radius_km',
    axial_rotation_period_hours:  'rot_h',
    semi_major_axis_au:           'a_au',
    orbital_period_days:          'period_d',
    orbital_l0_deg:               'L0_deg'
  });
  _backfillByIdInSheet_('Orbital_Infrastructure', 'facility_id', SOL_INFRASTRUCTURE_PARAMS_, {
    altitude_km: 'altitude_km',
    surface_lat: 'surface_lat',
    surface_lon: 'surface_lon'
  });
  _backfillJpScope_();
}

function _backfillByIdInSheet_(sheetName, idCol, lookup, fieldMap) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return;
  var lastRow = sheet.getLastRow(), lastCol = sheet.getLastColumn();
  if (lastRow < 2) return;
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var idIdx   = headers.indexOf(idCol);
  if (idIdx === -1) return;
  var data    = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  var dirty   = false;
  for (var r = 0; r < data.length; r++) {
    var key = String(data[r][idIdx] || '').trim();
    if (!key) continue;
    var params = lookup[key];
    if (!params) continue;
    for (var col in fieldMap) {
      var src = fieldMap[col];
      if (params[src] === undefined) continue;
      var ci = headers.indexOf(col);
      if (ci === -1) continue;
      var existing = data[r][ci];
      if (existing === '' || existing === null || existing === undefined) {
        data[r][ci] = params[src];
        dirty = true;
      }
    }
  }
  if (dirty) sheet.getRange(2, 1, data.length, lastCol).setValues(data);
}

function _backfillJpScope_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Jump_Points');
  if (!sheet) return;
  var lastRow = sheet.getLastRow(), lastCol = sheet.getLastColumn();
  if (lastRow < 2) return;
  var headers   = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var typeIdx   = headers.indexOf('jump_point_type');
  var scopeIdx  = headers.indexOf('scope');
  if (typeIdx === -1 || scopeIdx === -1) return;
  var data  = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  var dirty = false;
  for (var r = 0; r < data.length; r++) {
    var existing = data[r][scopeIdx];
    if (existing !== '' && existing !== null && existing !== undefined) continue;
    data[r][scopeIdx] = _defaultJpScope_(data[r][typeIdx]);
    dirty = true;
  }
  if (dirty) sheet.getRange(2, 1, data.length, lastCol).setValues(data);
}

// Convention for IDs in Sol:
//   <system_id>-<short>          for celestial bodies      (e.g. 2371-terra, 2371-luna)
//   <system_id>-fac-<short>      for orbital infrastructure (e.g. 2371-fac-titan-shipyards)
//   <system_id>-jp-<short>       for jump points            (e.g. 2371-jp-zenith)
//   <system_id>-rt-<short>       for in-system routes
//   <system_id>-cm-<short>       for comm networks
//   <system_id>-src-<n>          for source provenance entries

var SOL_BODIES_ = [
  // Sol primary star
  { body_id: '2371-sol', system_id: SOL_SYSTEM_ID, body_name: 'Sol',
    scientific_name: 'Sol', body_type: 'star',
    orbit_parent_id: '', orbit_order: 0, orbit_band: '',
    is_inhabited: false, population_level: '', habitability_class: '',
    atmosphere_type: '', gravity_level: '', temperature_profile: '',
    water_presence: '', terrain_profile: '', industrial_value: '',
    military_value: '', political_owner: '',
    canonical_status: 'canon',
    source_note: 'Real-world astronomy; canonical in BattleTech.',
    notes: 'G-type main-sequence star. Center of the Sol system.' },

  // Mercury — Sol I
  { body_id: '2371-mercury', system_id: SOL_SYSTEM_ID, body_name: 'Mercury',
    scientific_name: 'Sol I', body_type: 'planet',
    orbit_parent_id: '2371-sol', orbit_order: 1, orbit_band: 'inner',
    is_inhabited: false, population_level: 'minimal',
    habitability_class: 'hostile',
    atmosphere_type: 'none', gravity_level: 'low',
    temperature_profile: 'extreme',
    water_presence: 'trace_polar_ice',
    terrain_profile: 'cratered_rocky',
    industrial_value: 'low_mining',
    military_value: 'low', political_owner: 'Terran Hegemony residual',
    canonical_status: 'canon',
    source_note: 'Real-world astronomy; minor canon presence.',
    notes: 'Some mining outposts; otherwise uninhabited.' },

  // Venus — Sol II, terraformed in BT canon
  { body_id: '2371-venus', system_id: SOL_SYSTEM_ID, body_name: 'Venus',
    scientific_name: 'Sol II', body_type: 'planet',
    orbit_parent_id: '2371-sol', orbit_order: 2, orbit_band: 'inner',
    is_inhabited: true, population_level: 'moderate',
    habitability_class: 'terraformed',
    atmosphere_type: 'breathable_thick',
    gravity_level: 'standard',
    temperature_profile: 'warm',
    water_presence: 'limited',
    terrain_profile: 'volcanic_lowlands',
    industrial_value: 'high', military_value: 'medium',
    political_owner: 'Terran Hegemony residual',
    canonical_status: 'canon',
    source_note: 'BT canon: Venus partially terraformed during Star League era.',
    notes: 'Terraforming partially successful; warm but inhabitable.' },

  // Terra — Sol III, capital of humanity
  { body_id: '2371-terra', system_id: SOL_SYSTEM_ID, body_name: 'Terra',
    scientific_name: 'Sol III', body_type: 'planet',
    orbit_parent_id: '2371-sol', orbit_order: 3, orbit_band: 'habitable',
    is_inhabited: true, population_level: 'extreme',
    habitability_class: 'optimal',
    atmosphere_type: 'breathable_standard',
    gravity_level: 'standard',
    temperature_profile: 'temperate',
    water_presence: 'abundant_oceans',
    terrain_profile: 'continental_mixed',
    industrial_value: 'extreme',
    military_value: 'extreme',
    political_owner: 'ComStar (administrative) / contested',
    canonical_status: 'canon',
    source_note: 'BT canon: birthplace of humanity, capital of the Star League, ComStar HQ.',
    notes: 'Hilton Head Island hosts ComStar HQ. Terra HPG is the central hub of the network.' },

  // Luna — moon of Terra
  { body_id: '2371-luna', system_id: SOL_SYSTEM_ID, body_name: 'Luna',
    scientific_name: 'Earth I', body_type: 'moon',
    orbit_parent_id: '2371-terra', orbit_order: 1, orbit_band: 'habitable',
    is_inhabited: true, population_level: 'moderate',
    habitability_class: 'enclosed_settlement',
    atmosphere_type: 'none',
    gravity_level: 'low',
    temperature_profile: 'extreme_diurnal',
    water_presence: 'trace_polar_ice',
    terrain_profile: 'cratered_regolith',
    industrial_value: 'high', military_value: 'high',
    political_owner: 'Terran Hegemony residual',
    canonical_status: 'canon',
    source_note: 'BT canon: Luna long settled, hosts industry and lunar bases.',
    notes: 'Multiple cities and military installations under domes / lunar surface.' },

  // Mars — Sol IV, terraformed inhabited world
  { body_id: '2371-mars', system_id: SOL_SYSTEM_ID, body_name: 'Mars',
    scientific_name: 'Sol IV', body_type: 'planet',
    orbit_parent_id: '2371-sol', orbit_order: 4, orbit_band: 'habitable',
    is_inhabited: true, population_level: 'high',
    habitability_class: 'terraformed',
    atmosphere_type: 'breathable_thin',
    gravity_level: 'low_standard',
    temperature_profile: 'cool',
    water_presence: 'engineered_seas',
    terrain_profile: 'red_continents',
    industrial_value: 'high', military_value: 'high',
    political_owner: 'Terran Hegemony residual',
    canonical_status: 'canon',
    source_note: 'BT canon: Mars terraformed and settled during early interstellar era.',
    notes: 'Major industrial and population world.' },

  // Phobos — moon of Mars
  { body_id: '2371-phobos', system_id: SOL_SYSTEM_ID, body_name: 'Phobos',
    scientific_name: 'Mars I', body_type: 'moon',
    orbit_parent_id: '2371-mars', orbit_order: 1, orbit_band: 'habitable',
    is_inhabited: false, population_level: 'minimal',
    habitability_class: 'hostile',
    atmosphere_type: 'none', gravity_level: 'micro',
    temperature_profile: 'cold',
    water_presence: 'trace',
    terrain_profile: 'cratered_rocky',
    industrial_value: 'low', military_value: 'medium',
    political_owner: 'Terran Hegemony residual',
    canonical_status: 'inferred',
    source_note: 'Real-world astronomy; presence in BT lore implied via Mars proximity.',
    notes: 'Likely sensor / transit installations.' },

  // Deimos — moon of Mars
  { body_id: '2371-deimos', system_id: SOL_SYSTEM_ID, body_name: 'Deimos',
    scientific_name: 'Mars II', body_type: 'moon',
    orbit_parent_id: '2371-mars', orbit_order: 2, orbit_band: 'habitable',
    is_inhabited: false, population_level: 'minimal',
    habitability_class: 'hostile',
    atmosphere_type: 'none', gravity_level: 'micro',
    temperature_profile: 'cold',
    water_presence: 'trace', terrain_profile: 'cratered_rocky',
    industrial_value: 'low', military_value: 'low',
    political_owner: 'Terran Hegemony residual',
    canonical_status: 'inferred',
    source_note: 'Real-world astronomy; no explicit BT lore.', notes: '' },

  // Asteroid belt
  { body_id: '2371-asteroid-belt', system_id: SOL_SYSTEM_ID,
    body_name: 'Sol Asteroid Belt', scientific_name: 'Main Belt',
    body_type: 'asteroid_belt',
    orbit_parent_id: '2371-sol', orbit_order: 5, orbit_band: 'outer',
    is_inhabited: false, population_level: 'minimal',
    habitability_class: 'hostile',
    atmosphere_type: 'none', gravity_level: 'micro',
    temperature_profile: 'cold',
    water_presence: 'variable_ice',
    terrain_profile: 'rubble_field',
    industrial_value: 'medium_mining', military_value: 'low_concealment',
    political_owner: 'contested',
    canonical_status: 'generated',
    source_note: 'Real-world astronomy; generated for gameplay (mining + pirate cover).',
    notes: 'Mining stations; potential pirate hideouts.' },

  // Jupiter — Sol V (BT scheme; some sources skip the asteroid belt as a "planet")
  { body_id: '2371-jupiter', system_id: SOL_SYSTEM_ID, body_name: 'Jupiter',
    scientific_name: 'Sol V', body_type: 'planet',
    orbit_parent_id: '2371-sol', orbit_order: 6, orbit_band: 'outer',
    is_inhabited: false, population_level: 'minimal',
    habitability_class: 'gas_giant',
    atmosphere_type: 'hydrogen_helium_dense',
    gravity_level: 'extreme',
    temperature_profile: 'very_cold',
    water_presence: 'cloud_layer',
    terrain_profile: 'gas_clouds',
    industrial_value: 'medium_he3', military_value: 'low',
    political_owner: 'Terran Hegemony residual',
    canonical_status: 'generated',
    source_note: 'Real-world astronomy; gas giant with He-3 mining potential.',
    notes: 'Helium-3 atmospheric mining stations possible.' },

  // Galilean moons of Jupiter
  { body_id: '2371-io',       system_id: SOL_SYSTEM_ID, body_name: 'Io',
    scientific_name: 'Jupiter I', body_type: 'moon',
    orbit_parent_id: '2371-jupiter', orbit_order: 1, orbit_band: 'outer',
    is_inhabited: false, population_level: 'minimal', habitability_class: 'hostile',
    atmosphere_type: 'sulfuric_thin', gravity_level: 'low',
    temperature_profile: 'cold_volcanic', water_presence: 'none',
    terrain_profile: 'volcanic', industrial_value: 'medium', military_value: 'low',
    political_owner: 'Terran Hegemony residual',
    canonical_status: 'generated',
    source_note: 'Real-world astronomy; generated for completeness.',
    notes: '' },
  { body_id: '2371-europa', system_id: SOL_SYSTEM_ID, body_name: 'Europa',
    scientific_name: 'Jupiter II', body_type: 'moon',
    orbit_parent_id: '2371-jupiter', orbit_order: 2, orbit_band: 'outer',
    is_inhabited: false, population_level: 'minimal', habitability_class: 'hostile',
    atmosphere_type: 'thin', gravity_level: 'low',
    temperature_profile: 'very_cold', water_presence: 'subsurface_ocean',
    terrain_profile: 'icy_crust', industrial_value: 'medium_water', military_value: 'low',
    political_owner: 'Terran Hegemony residual',
    canonical_status: 'generated',
    source_note: 'Real-world astronomy; ice / water mining potential.',
    notes: '' },
  { body_id: '2371-ganymede', system_id: SOL_SYSTEM_ID, body_name: 'Ganymede',
    scientific_name: 'Jupiter III', body_type: 'moon',
    orbit_parent_id: '2371-jupiter', orbit_order: 3, orbit_band: 'outer',
    is_inhabited: false, population_level: 'minimal', habitability_class: 'hostile',
    atmosphere_type: 'thin', gravity_level: 'low',
    temperature_profile: 'very_cold', water_presence: 'subsurface_ice',
    terrain_profile: 'icy_cratered', industrial_value: 'medium', military_value: 'low',
    political_owner: 'Terran Hegemony residual',
    canonical_status: 'generated',
    source_note: 'Real-world astronomy; largest moon in Sol.',
    notes: '' },
  { body_id: '2371-callisto', system_id: SOL_SYSTEM_ID, body_name: 'Callisto',
    scientific_name: 'Jupiter IV', body_type: 'moon',
    orbit_parent_id: '2371-jupiter', orbit_order: 4, orbit_band: 'outer',
    is_inhabited: false, population_level: 'minimal', habitability_class: 'hostile',
    atmosphere_type: 'none', gravity_level: 'low',
    temperature_profile: 'very_cold', water_presence: 'subsurface_ice',
    terrain_profile: 'cratered', industrial_value: 'low', military_value: 'low',
    political_owner: 'Terran Hegemony residual',
    canonical_status: 'generated',
    source_note: 'Real-world astronomy; outermost Galilean moon.',
    notes: '' },

  // Saturn
  { body_id: '2371-saturn', system_id: SOL_SYSTEM_ID, body_name: 'Saturn',
    scientific_name: 'Sol VI', body_type: 'planet',
    orbit_parent_id: '2371-sol', orbit_order: 7, orbit_band: 'outer',
    is_inhabited: false, population_level: 'minimal', habitability_class: 'gas_giant',
    atmosphere_type: 'hydrogen_helium_dense', gravity_level: 'high',
    temperature_profile: 'very_cold', water_presence: 'ring_ice',
    terrain_profile: 'ringed_gas_clouds',
    industrial_value: 'medium_he3', military_value: 'medium',
    political_owner: 'contested',
    canonical_status: 'partial_canon',
    source_note: 'Real-world astronomy; canon presence via Titan shipyards.',
    notes: 'Hosts Titan shipyards in orbit of its largest moon.' },

  // Titan — moon of Saturn, hosts SHIPYARDS
  { body_id: '2371-titan', system_id: SOL_SYSTEM_ID, body_name: 'Titan',
    scientific_name: 'Saturn VI', body_type: 'moon',
    orbit_parent_id: '2371-saturn', orbit_order: 6, orbit_band: 'outer',
    is_inhabited: true, population_level: 'low_industrial',
    habitability_class: 'enclosed_industrial',
    atmosphere_type: 'methane_nitrogen_thick',
    gravity_level: 'low',
    temperature_profile: 'extreme_cold',
    water_presence: 'methane_lakes',
    terrain_profile: 'icy_methane',
    industrial_value: 'extreme_shipyards',
    military_value: 'extreme',
    political_owner: 'contested',
    canonical_status: 'canon',
    source_note: 'BT canon: Titan shipyards — major Star League / SLDF naval shipbuilding facility.',
    notes: '2786 TC: post-Star-League collapse. Yards still operational but under contested control.' },

  // Uranus — generated
  { body_id: '2371-uranus', system_id: SOL_SYSTEM_ID, body_name: 'Uranus',
    scientific_name: 'Sol VII', body_type: 'planet',
    orbit_parent_id: '2371-sol', orbit_order: 8, orbit_band: 'deep_outer',
    is_inhabited: false, population_level: 'minimal', habitability_class: 'ice_giant',
    atmosphere_type: 'hydrogen_methane', gravity_level: 'high',
    temperature_profile: 'extreme_cold', water_presence: 'frozen',
    terrain_profile: 'gas_ice',
    industrial_value: 'low', military_value: 'low',
    political_owner: 'Terran Hegemony residual',
    canonical_status: 'generated',
    source_note: 'Real-world astronomy; minimal BT presence.',
    notes: '' },

  // Neptune — generated
  { body_id: '2371-neptune', system_id: SOL_SYSTEM_ID, body_name: 'Neptune',
    scientific_name: 'Sol VIII', body_type: 'planet',
    orbit_parent_id: '2371-sol', orbit_order: 9, orbit_band: 'deep_outer',
    is_inhabited: false, population_level: 'minimal', habitability_class: 'ice_giant',
    atmosphere_type: 'hydrogen_methane', gravity_level: 'high',
    temperature_profile: 'extreme_cold', water_presence: 'frozen',
    terrain_profile: 'gas_ice',
    industrial_value: 'low', military_value: 'low',
    political_owner: 'Terran Hegemony residual',
    canonical_status: 'generated',
    source_note: 'Real-world astronomy; minimal BT presence.',
    notes: '' }
];

var SOL_INFRASTRUCTURE_ = [
  { facility_id: '2371-fac-comstar-hq', system_id: SOL_SYSTEM_ID,
    facility_name: 'ComStar Headquarters (Hilton Head)',
    facility_type: 'comm_array', orbiting_body_id: '2371-terra',
    location_type: 'surface', owner: 'ComStar', operator: 'ComStar',
    operational_status: 'operational', security_level: 'maximum',
    traffic_level: 'high',
    repair_capacity: '', dock_capacity: '', shipyard_capacity: '',
    military_presence: 'comstar_guard',
    hpg_capable: true, black_box_capable: true,
    canonical_status: 'canon',
    source_note: 'BT canon: ComStar HQ at Hilton Head Island, Terra.',
    notes: 'Central authority of the HPG network.' },

  { facility_id: '2371-fac-terra-hpg', system_id: SOL_SYSTEM_ID,
    facility_name: 'Terra HPG Class A',
    facility_type: 'comm_array', orbiting_body_id: '2371-terra',
    location_type: 'surface', owner: 'ComStar', operator: 'ComStar',
    operational_status: 'operational', security_level: 'maximum',
    traffic_level: 'extreme',
    repair_capacity: '', dock_capacity: '', shipyard_capacity: '',
    military_presence: 'comstar_guard',
    hpg_capable: true, black_box_capable: true,
    canonical_status: 'canon',
    source_note: 'BT canon: Terra hosts the central Class A HPG.',
    notes: 'Hub of interstellar communication.' },

  { facility_id: '2371-fac-titan-shipyards', system_id: SOL_SYSTEM_ID,
    facility_name: 'Titan Shipyards',
    facility_type: 'shipyard', orbiting_body_id: '2371-titan',
    location_type: 'lunar_orbit', owner: 'contested', operator: 'remnant_sldf',
    operational_status: 'partial', security_level: 'high',
    traffic_level: 'medium',
    repair_capacity: 'extreme', dock_capacity: 'extreme', shipyard_capacity: 'extreme',
    military_presence: 'remnant_sldf',
    hpg_capable: false, black_box_capable: false,
    canonical_status: 'canon',
    source_note: 'BT canon: Titan shipyards, major Star League shipbuilding asset.',
    notes: '2786 TC: post-collapse, operational but under contested control. Major strategic prize.' },

  { facility_id: '2371-fac-luna-base', system_id: SOL_SYSTEM_ID,
    facility_name: 'Luna Surface Bases',
    facility_type: 'naval_base', orbiting_body_id: '2371-luna',
    location_type: 'surface', owner: 'Terran Hegemony residual',
    operator: 'remnant_sldf',
    operational_status: 'operational', security_level: 'high',
    traffic_level: 'medium',
    repair_capacity: 'medium', dock_capacity: 'medium', shipyard_capacity: '',
    military_presence: 'remnant_sldf',
    hpg_capable: false, black_box_capable: false,
    canonical_status: 'partial_canon',
    source_note: 'BT canon: Luna long settled with military and industrial sites.',
    notes: 'Cluster of bases and habitats on the Lunar surface.' },

  { facility_id: '2371-fac-zenith-recharge', system_id: SOL_SYSTEM_ID,
    facility_name: 'Sol Zenith Recharge Station',
    facility_type: 'recharge_station', orbiting_body_id: '',
    location_type: 'deep_space', owner: 'ComStar', operator: 'ComStar',
    operational_status: 'operational', security_level: 'medium',
    traffic_level: 'high',
    repair_capacity: 'low', dock_capacity: 'medium', shipyard_capacity: '',
    military_presence: 'comstar_guard',
    hpg_capable: false, black_box_capable: false,
    canonical_status: 'generated',
    source_note: 'Generated for gameplay; standard ComStar recharge presence at major jump points.',
    notes: 'Dedicated recharge facility colocated with the zenith jump point.' }
];

var SOL_JUMP_POINTS_ = [
  { jump_point_id: '2371-jp-zenith', system_id: SOL_SYSTEM_ID,
    jump_point_name: 'Sol Zenith',
    jump_point_type: 'zenith',
    associated_body_id: '2371-sol',
    location_description: 'Standard zenith point above Sol system plane.',
    distance_from_primary_world: '~7 days under 1G',
    risk_level: 'low', navigation_difficulty: 'standard',
    recharge_quality: 'standard',
    is_standard: true, is_pirate_point: false, is_known: true,
    canonical_status: 'canon',
    source_note: 'BT canon: standard zenith jump point convention applies to all systems.',
    notes: '' },

  { jump_point_id: '2371-jp-nadir', system_id: SOL_SYSTEM_ID,
    jump_point_name: 'Sol Nadir',
    jump_point_type: 'nadir',
    associated_body_id: '2371-sol',
    location_description: 'Standard nadir point below Sol system plane.',
    distance_from_primary_world: '~7 days under 1G',
    risk_level: 'low', navigation_difficulty: 'standard',
    recharge_quality: 'standard',
    is_standard: true, is_pirate_point: false, is_known: true,
    canonical_status: 'canon',
    source_note: 'BT canon: standard nadir jump point convention applies to all systems.',
    notes: '' },

  { jump_point_id: '2371-jp-lagrange-em', system_id: SOL_SYSTEM_ID,
    jump_point_name: 'Earth-Moon L1 (pirate)',
    jump_point_type: 'pirate_point',
    associated_body_id: '2371-terra',
    location_description: 'Lagrange-derived pirate point near Terra-Luna system.',
    distance_from_primary_world: 'hours from Terra',
    risk_level: 'extreme', navigation_difficulty: 'high',
    recharge_quality: 'poor',
    is_standard: false, is_pirate_point: true, is_known: false,
    canonical_status: 'generated',
    source_note: 'Generated for gameplay; pirate-point candidate near Terra. Heavily defended if discovered.',
    notes: 'High-risk fast-arrival vector. ComStar would respond aggressively.' }
];

var SOL_ROUTES_ = [
  { route_id: '2371-rt-zenith-terra', system_id: SOL_SYSTEM_ID,
    origin_location_id: '2371-jp-zenith', origin_location_type: 'jump_point',
    destination_location_id: '2371-terra', destination_location_type: 'planet',
    route_type: 'jump_point_to_planet',
    estimated_travel_time_hours: 168, estimated_travel_time_days: 7,
    risk_level: 'low', traffic_level: 'extreme',
    patrol_level: 'high', piracy_risk: 'low',
    sensor_coverage: 'full', notes: 'Standard zenith approach.' },
  { route_id: '2371-rt-nadir-terra', system_id: SOL_SYSTEM_ID,
    origin_location_id: '2371-jp-nadir', origin_location_type: 'jump_point',
    destination_location_id: '2371-terra', destination_location_type: 'planet',
    route_type: 'jump_point_to_planet',
    estimated_travel_time_hours: 168, estimated_travel_time_days: 7,
    risk_level: 'low', traffic_level: 'extreme',
    patrol_level: 'high', piracy_risk: 'low',
    sensor_coverage: 'full', notes: 'Standard nadir approach.' },
  { route_id: '2371-rt-terra-luna', system_id: SOL_SYSTEM_ID,
    origin_location_id: '2371-terra', origin_location_type: 'planet',
    destination_location_id: '2371-luna', destination_location_type: 'moon',
    route_type: 'planet_to_moon',
    estimated_travel_time_hours: 18, estimated_travel_time_days: 1,
    risk_level: 'low', traffic_level: 'extreme',
    patrol_level: 'high', piracy_risk: 'low',
    sensor_coverage: 'full', notes: 'Heavy traffic Terra-Luna shuttle lane.' },
  { route_id: '2371-rt-terra-mars', system_id: SOL_SYSTEM_ID,
    origin_location_id: '2371-terra', origin_location_type: 'planet',
    destination_location_id: '2371-mars', destination_location_type: 'planet',
    route_type: 'planet_to_planet',
    estimated_travel_time_hours: 96, estimated_travel_time_days: 4,
    risk_level: 'low', traffic_level: 'high',
    patrol_level: 'medium', piracy_risk: 'low',
    sensor_coverage: 'full', notes: 'Variable depending on relative positions; this is a nominal estimate.' },
  { route_id: '2371-rt-terra-venus', system_id: SOL_SYSTEM_ID,
    origin_location_id: '2371-terra', origin_location_type: 'planet',
    destination_location_id: '2371-venus', destination_location_type: 'planet',
    route_type: 'planet_to_planet',
    estimated_travel_time_hours: 72, estimated_travel_time_days: 3,
    risk_level: 'low', traffic_level: 'high',
    patrol_level: 'medium', piracy_risk: 'low',
    sensor_coverage: 'full', notes: 'Inner-system route.' },
  { route_id: '2371-rt-mars-titan', system_id: SOL_SYSTEM_ID,
    origin_location_id: '2371-mars', origin_location_type: 'planet',
    destination_location_id: '2371-fac-titan-shipyards', destination_location_type: 'station',
    route_type: 'planet_to_station',
    estimated_travel_time_hours: 336, estimated_travel_time_days: 14,
    risk_level: 'medium', traffic_level: 'medium',
    patrol_level: 'medium', piracy_risk: 'medium',
    sensor_coverage: 'partial', notes: 'Long outer-system transit. Pirate ambush risk in the asteroid belt.' },
  { route_id: '2371-rt-zenith-titan', system_id: SOL_SYSTEM_ID,
    origin_location_id: '2371-jp-zenith', origin_location_type: 'jump_point',
    destination_location_id: '2371-fac-titan-shipyards', destination_location_type: 'station',
    route_type: 'jump_point_to_station',
    estimated_travel_time_hours: 168, estimated_travel_time_days: 7,
    risk_level: 'medium', traffic_level: 'medium',
    patrol_level: 'medium', piracy_risk: 'medium',
    sensor_coverage: 'partial', notes: 'Direct approach for visiting shipyards from zenith.' },
  { route_id: '2371-rt-asteroid-patrol', system_id: SOL_SYSTEM_ID,
    origin_location_id: '2371-mars', origin_location_type: 'planet',
    destination_location_id: '2371-asteroid-belt', destination_location_type: 'asteroid_belt',
    route_type: 'patrol_lane',
    estimated_travel_time_hours: 72, estimated_travel_time_days: 3,
    risk_level: 'medium', traffic_level: 'low',
    patrol_level: 'medium', piracy_risk: 'high',
    sensor_coverage: 'partial', notes: 'Anti-piracy patrol coverage.' },
  { route_id: '2371-rt-pirate-em-terra', system_id: SOL_SYSTEM_ID,
    origin_location_id: '2371-jp-lagrange-em', origin_location_type: 'jump_point',
    destination_location_id: '2371-terra', destination_location_type: 'planet',
    route_type: 'pirate_point_to_target',
    estimated_travel_time_hours: 12, estimated_travel_time_days: 0,
    risk_level: 'extreme', traffic_level: 'low',
    patrol_level: 'extreme', piracy_risk: 'extreme',
    sensor_coverage: 'partial', notes: 'Pirate-point fast strike on Terra. Suicide if detected.' }
];

var SOL_COMMS_ = [
  { comm_id: '2371-cm-hpg-terra', system_id: SOL_SYSTEM_ID,
    comm_name: 'Terra HPG (Class A)', comm_type: 'HPG_station',
    coverage_scope: 'interstellar',
    linked_body_id: '2371-terra', linked_facility_id: '2371-fac-terra-hpg',
    owner: 'ComStar', operator: 'ComStar',
    operational_status: 'operational',
    security_level: 'maximum', bandwidth_level: 'extreme',
    military_priority: 'maximum',
    notes: 'Central hub of the HPG network.' },
  { comm_id: '2371-cm-terra-planetary', system_id: SOL_SYSTEM_ID,
    comm_name: 'Terra Planetary Comm', comm_type: 'planetary_comm_array',
    coverage_scope: 'planetwide',
    linked_body_id: '2371-terra', linked_facility_id: '',
    owner: 'Terran Hegemony residual', operator: 'civilian',
    operational_status: 'operational',
    security_level: 'medium', bandwidth_level: 'high',
    military_priority: 'high',
    notes: 'Extensive planetary comm network on Terra.' },
  { comm_id: '2371-cm-luna-relay', system_id: SOL_SYSTEM_ID,
    comm_name: 'Luna Comm Relay', comm_type: 'moon_relay',
    coverage_scope: 'moon_system',
    linked_body_id: '2371-luna', linked_facility_id: '2371-fac-luna-base',
    owner: 'Terran Hegemony residual', operator: 'remnant_sldf',
    operational_status: 'operational',
    security_level: 'high', bandwidth_level: 'medium',
    military_priority: 'high',
    notes: 'Lunar relay supporting Earth-Luna traffic and outer-system links.' },
  { comm_id: '2371-cm-titan-mil', system_id: SOL_SYSTEM_ID,
    comm_name: 'Titan Shipyards Military Net', comm_type: 'military_command_net',
    coverage_scope: 'local_region',
    linked_body_id: '2371-titan', linked_facility_id: '2371-fac-titan-shipyards',
    owner: 'remnant_sldf', operator: 'remnant_sldf',
    operational_status: 'operational',
    security_level: 'maximum', bandwidth_level: 'high',
    military_priority: 'maximum',
    notes: 'Encrypted command net at Titan; security posture high.' },
  { comm_id: '2371-cm-system-sensor', system_id: SOL_SYSTEM_ID,
    comm_name: 'Sol System Sensor Net', comm_type: 'sensor_net',
    coverage_scope: 'full_system',
    linked_body_id: '', linked_facility_id: '',
    owner: 'multiple', operator: 'multiple',
    operational_status: 'operational',
    security_level: 'medium', bandwidth_level: 'medium',
    military_priority: 'high',
    notes: 'Distributed sensor coverage across Sol system. Coordinated by ComStar in 2786.' }
];

var SOL_SOURCES_ = [
  { source_id: '2371-src-001', system_id: SOL_SYSTEM_ID,
    entity_type: 'system', entity_id: SOL_SYSTEM_ID,
    source_name: 'Sarna BattleTech wiki', source_type: 'Sarna',
    canon_confidence: 'strong', data_status: 'active',
    notes: 'Sol system core entries.' },
  { source_id: '2371-src-002', system_id: SOL_SYSTEM_ID,
    entity_type: 'celestial_body', entity_id: '2371-terra',
    source_name: 'Sarna Terra page', source_type: 'Sarna',
    canon_confidence: 'exact', data_status: 'active',
    notes: 'Terra: capital of humanity, ComStar HQ.' },
  { source_id: '2371-src-003', system_id: SOL_SYSTEM_ID,
    entity_type: 'orbital_infrastructure', entity_id: '2371-fac-titan-shipyards',
    source_name: 'BattleTech sourcebooks (Star League era)',
    source_type: 'sourcebook',
    canon_confidence: 'strong', data_status: 'active',
    notes: 'Titan shipyards: major Star League naval asset.' },
  { source_id: '2371-src-004', system_id: SOL_SYSTEM_ID,
    entity_type: 'celestial_body', entity_id: '2371-mars',
    source_name: 'Sarna Mars page', source_type: 'Sarna',
    canon_confidence: 'strong', data_status: 'active',
    notes: 'Mars: terraformed, inhabited, industrial.' },
  { source_id: '2371-src-005', system_id: SOL_SYSTEM_ID,
    entity_type: 'celestial_body', entity_id: '2371-venus',
    source_name: 'Sarna Venus page', source_type: 'Sarna',
    canon_confidence: 'partial', data_status: 'active',
    notes: 'Venus: partially terraformed during Star League era; details vary by source.' },
  { source_id: '2371-src-006', system_id: SOL_SYSTEM_ID,
    entity_type: 'celestial_body', entity_id: '2371-luna',
    source_name: 'Sarna Luna page', source_type: 'Sarna',
    canon_confidence: 'strong', data_status: 'active',
    notes: 'Luna: long-settled moon of Terra.' },
  { source_id: '2371-src-007', system_id: SOL_SYSTEM_ID,
    entity_type: 'orbital_infrastructure', entity_id: '2371-fac-comstar-hq',
    source_name: 'BattleTech ComStar lore', source_type: 'sourcebook',
    canon_confidence: 'exact', data_status: 'active',
    notes: 'Hilton Head Island, North America, Terra. ComStar HQ.' },
  { source_id: '2371-src-008', system_id: SOL_SYSTEM_ID,
    entity_type: 'celestial_body', entity_id: '2371-asteroid-belt',
    source_name: 'Generated for gameplay', source_type: 'generated',
    canon_confidence: 'generated', data_status: 'active',
    notes: 'Real-world astronomy basis; generated for in-system play.' },
  { source_id: '2371-src-009', system_id: SOL_SYSTEM_ID,
    entity_type: 'jump_point', entity_id: '2371-jp-lagrange-em',
    source_name: 'Generated for gameplay', source_type: 'generated',
    canon_confidence: 'generated', data_status: 'active',
    notes: 'Pirate-point candidate generated to support sneak-attack scenarios.' },
  { source_id: '2371-src-010', system_id: SOL_SYSTEM_ID,
    entity_type: 'orbital_infrastructure', entity_id: '2371-fac-zenith-recharge',
    source_name: 'Generated for gameplay', source_type: 'generated',
    canon_confidence: 'generated', data_status: 'active',
    notes: 'Standard ComStar recharge station.' }
];

// ─── Read endpoint for client ────────────────────────────────

/**
 * Returns the in-system view bundle for one system. Future client
 * code (in-system map UI) calls this when the player drills into a
 * specific star system.
 *
 * Returns:
 *   {
 *     system: <Systems row as object>,
 *     bodies, infrastructure, jumpPoints, routes, comms, sources
 *   }
 */
function getStarSystemView(systemId) {
  var sid = Number(systemId);
  return {
    system:         _systemRowAsObject_(sid),
    bodies:         _readSheetByColumn_('Celestial_Bodies',       'system_id', sid),
    infrastructure: _readSheetByColumn_('Orbital_Infrastructure', 'system_id', sid),
    jumpPoints:     _readSheetByColumn_('Jump_Points',            'system_id', sid),
    routes:         _readSheetByColumn_('In_System_Routes',       'system_id', sid),
    comms:          _readSheetByColumn_('Local_Comm_Networks',    'system_id', sid),
    sources:        _readSheetByColumn_('System_Data_Sources',    'system_id', sid)
  };
}

function _systemRowAsObject_(systemId) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Systems');
  if (!sheet) return null;
  var lastRow = sheet.getLastRow(), lastCol = sheet.getLastColumn();
  if (lastRow < 2) return null;
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var data    = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  for (var r = 0; r < data.length; r++) {
    if (Number(data[r][0]) === Number(systemId)) {
      var obj = {};
      for (var c = 0; c < headers.length; c++) obj[headers[c]] = data[r][c];
      return obj;
    }
  }
  return null;
}

function _readSheetByColumn_(sheetName, filterCol, filterValue) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return [];
  var lastRow = sheet.getLastRow(), lastCol = sheet.getLastColumn();
  if (lastRow < 2) return [];
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var data    = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  var col = headers.indexOf(filterCol);
  if (col === -1) return [];
  var out = [];
  for (var r = 0; r < data.length; r++) {
    var v = data[r][col];
    if (v === '' || v === null) continue;
    if (Number(v) === Number(filterValue) || String(v) === String(filterValue)) {
      var obj = {};
      for (var c = 0; c < headers.length; c++) obj[headers[c]] = data[r][c];
      out.push(obj);
    }
  }
  return out;
}
