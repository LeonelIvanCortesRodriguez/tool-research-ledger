(function () {
  "use strict";

  const catalog = window.CATALOG;
  if (!catalog) throw new Error("Catalog failed to load");

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const byId = new Map(catalog.tools.map((tool) => [tool.id, tool]));
  const groupById = new Map(catalog.capabilityGroups.map((group) => [group.id, group]));
  const evidenceById = new Map(catalog.evidenceLevels.map((level) => [level.id, level]));
  const categoryById = new Map(catalog.categories.map((category) => [category.id, category]));
  const uses = Array.isArray(catalog.uses) ? catalog.uses : [];
  const packs = Array.isArray(catalog.packs) ? catalog.packs : [];
  const lessons = Array.isArray(catalog.lessons) ? catalog.lessons : [];
  const decisionOrder = { IMPLEMENT: 7, PILOT: 6, CONDITIONAL: 5, REFERENCE: 4, WATCH: 3, HOLD: 1, REJECT: 0 };
  const fitOrder = { A: 4, B: 3, C: 2, D: 1, UNPROVEN: 0 };
  const evidenceOrder = { E0: 0, E1: 1, E2: 2, E3: 3, E4: 4, E5: 5 };
  // Plain words shown beside every code, for a first-time visitor.
  const decisionPlain = {
    IMPLEMENT: "Use it",
    CONDITIONAL: "Use within limits",
    PILOT: "Trying it",
    REFERENCE: "Read only, not installed",
    WATCH: "Watching",
    HOLD: "On hold",
    REJECT: "Not for us"
  };
  const evidencePlain = {
    E0: "Only read about",
    E1: "Did real work",
    E2: "Checked against a known answer",
    E3: "Checked on many cases",
    E4: "Checked by a second reviewer",
    E5: "Watched in daily use"
  };
  const nextEvidencePlain = {
    E0: "Use it on one real task in a named project and record the task, the result, the errors and the fixes.",
    E1: "Write the expected result down first, then compare the tool's output with it.",
    E2: "Repeat the check across many cases, including the ones known to fail.",
    E3: "Have a separate reviewer confirm the results.",
    E4: "Watch it in daily use for drift and incidents.",
    E5: "Keep watching and check again after any big change."
  };
  const safetyPlain = {
    PASS: "Scan passed",
    REVIEW: "Needs a read before trying",
    BLOCK: "Blocked: read only",
    WRITTEN: "Scanned, written report",
    NOT_SCANNED: "Not scanned yet"
  };
  const safetyMeaning = {
    BLOCK: "Read only until a person reads each flagged line.",
    REVIEW: "Nothing blocks it, but read the scan before trying it.",
    PASS: "The scanners found nothing.",
    WRITTEN: "Scanned before scan reports were kept as data; the report is a written note.",
    NOT_SCANNED: "Unknown. Mostly tools that were only read about."
  };
  const outcomePlain = { PASS: "Worked", PARTIAL: "Partly worked", FAIL: "Failed", BLOCKED: "Blocked", REFERENCE: "Read for ideas" };
  const releaseChecks = [
    { state: "executed", title: "Catalog integrity", note: `Checks ${catalog.tools.length} tools, ${catalog.capabilityGroups.length} job families and ${uses.length} recorded uses, and that every grade, decision and safety note matches the owner's export.`, result: "Automated · current build", proof: "scripts/verify.mjs", href: "scripts/verify.mjs" },
    { state: "executed", title: "Negative mutation", note: "Breaks the grade scale, removes a source, raises a grade without its basis and points a use at a missing tool; the validator must reject all four.", result: "Automated · expected failures detected", proof: "scripts/mutation-test.mjs", href: "scripts/mutation-test.mjs" },
    { state: "executed", title: "Browser workflow", note: "Exercises search, filters, comparison, details, the safety section, themes, keyboard focus, phone width and reduced motion.", result: "Desktop and mobile", proof: "scripts/browser-qa.mjs", href: "scripts/browser-qa.mjs" },
    { state: "executed", title: "Privacy and package", note: "Scans public files, builds an allowlisted deterministic ZIP, and hashes every delivered source file.", result: "Automated · public files only", proof: "scripts/privacy-scan.mjs", href: "scripts/privacy-scan.mjs" },
    { state: "reference", title: "Where grades come from", note: catalog.meta.gradeSource, result: "Documented · owner's export", proof: "docs/EVIDENCE_MODEL.md", href: "docs/EVIDENCE_MODEL.md" }
  ];

  const tasks = [
    { group: "document-intelligence", label: "Read a scanned document", detail: "OCR, scans and PDFs" },
    { group: "video-voice", label: "Make a video or a voice-over", detail: "Render, narrate and caption" },
    { group: "design-quality", label: "Improve a page", detail: "Design, copy and motion" },
    { group: "skill-governance", label: "Check an AI skill", detail: "Scan it before you install it" },
    { group: "repo-intelligence", label: "Understand a codebase", detail: "Map an unfamiliar repository" },
    { group: "development-control", label: "Plan and test a build", detail: "Specs, browser tests, clean changes" },
    { group: "office-data", label: "Work with files and data", detail: "Spreadsheets, transfers and media" },
    { group: "knowledge-research", label: "Organize research", detail: "Notes, sources and search" }
  ];

  const state = {
    group: null,
    query: "",
    selected: new Set(),
    activeTools: [],
    ledgerLimit: 16
  };

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  function array(value) { return Array.isArray(value) ? value : []; }
  function first(value, fallback = "Not documented") { return array(value)[0] || fallback; }
  function plural(count, one, many) { return `${count} ${count === 1 ? one : many}`; }
  function usesOf(id) { return uses.filter((use) => use.toolId === id); }
  function projectsOf(id) { return [...new Set(usesOf(id).map((use) => use.project))]; }
  function formatDate(value) {
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? String(value || "") : date.toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" });
  }

  function scoreTool(tool, group) {
    const fit = Math.max(0, ...Object.values(tool.projectFit || {}).map((grade) => fitOrder[grade] ?? 0));
    const curatedIndex = group ? group.toolIds.indexOf(tool.id) : -1;
    const memberBoost = curatedIndex >= 0 ? Math.max(2, 20 - curatedIndex * 2) : 0;
    const risk = tool.riskLevel === "LOW" ? 2 : tool.riskLevel === "MEDIUM" ? 1 : tool.riskLevel === "HIGH" ? -1 : -2;
    // Recorded use counts for more than fit: a tool that did real work here leads its family.
    return memberBoost + fit + (decisionOrder[tool.decision] ?? 0) + (evidenceOrder[tool.evidenceLevel] ?? 0) * 6 + risk;
  }

  // ---------- Search in everyday words ----------
  // A newcomer searches by the job, not the jargon: these phrases add the words the catalog uses.
  const SYNONYMS = [
    [/text (in|from) (images?|screenshots?|pictures?|photos?|scans?)|read(ing)? text|scanned|scans? of|receipts?|statements?/, "ocr pdf"],
    [/speech (to|into) text|transcri|dictat|subtitl|captions?/, "transcription whisper captions"],
    [/voice|narrat|speak|read aloud|text to speech/, "tts voice speech"],
    [/safe|malware|virus|security|risk|trust|harm/, "security scan"],
    [/video|film|movie|animation|motion|explainer/, "video motion render"],
    [/write|writing|copy|prose|sound human|wording/, "writing copy"],
    [/website|web page|landing|layout|looks?|ugly|design/, "design interface"],
    [/test|check (my|the|a) (site|page)|screenshot/, "browser test"],
    [/codebase|repo|repository|unfamiliar code/, "repository graph"],
    [/spreadsheet|excel|csv/, "spreadsheet data"]
  ];
  const STOP = new Set(["a", "an", "the", "to", "for", "of", "in", "on", "and", "or", "my", "i", "want", "need", "tool", "tools", "that", "can", "with", "from", "how", "do", "is", "it", "turn", "into", "make", "find", "get", "use", "me", "help", "some", "something", "what", "which", "are", "any"]);
  // Words under four letters match whole words only, so "it" does not match "edit".
  function matches(text, word) { return word.length < 4 ? new RegExp(`\\b${word.replace(/[^a-z0-9]/g, "")}\\b`).test(text) : text.includes(word); }
  function searchWords(query) {
    const lower = query.toLowerCase();
    const extra = SYNONYMS.filter(([pattern]) => pattern.test(lower)).map(([, words]) => words).join(" ");
    return { plain: [...new Set(lower.split(/[^\p{L}\p{N}-]+/u).filter((word) => word && !STOP.has(word)))], extra: extra.split(" ").filter(Boolean) };
  }
  function searchText(tool) {
    const groups = catalog.capabilityGroups.filter((group) => group.toolIds.includes(tool.id)).map((group) => `${group.label} ${group.purpose}`);
    return [tool.name, tool.id, tool.kind, tool.summary, tool.license, tool.gradeBasis, categoryById.get(tool.primaryCategory)?.label, ...groups, ...array(tool.bestFor), ...array(tool.weaknesses), ...array(tool.tags)].join(" ").toLowerCase();
  }
  // Every plain word must match, or, when the phrase brought in catalog words, one of those must match instead.
  function queryMatches(tool, query) {
    const { plain, extra } = searchWords(query);
    if (!plain.length && !extra.length) return true;
    const text = searchText(tool);
    if (plain.length && plain.every((word) => matches(text, word))) return true;
    return extra.length > 0 && extra.some((word) => matches(text, word));
  }

  function toolsFor(groupId, query) {
    const group = groupId ? groupById.get(groupId) : null;
    return catalog.tools
      .filter((tool) => !group || group.toolIds.includes(tool.id))
      .filter((tool) => !query.trim() || queryMatches(tool, query))
      .sort((a, b) => scoreTool(b, group) - scoreTool(a, group) || a.name.localeCompare(b.name));
  }

  function renderTasks() {
    $("#taskGrid").innerHTML = tasks.map((task) => `
      <button class="task-button" type="button" data-group="${task.group}" aria-pressed="false">
        <strong>${escapeHtml(task.label)}</strong><span>${escapeHtml(task.detail)}</span>
      </button>`).join("");
    $("#toolNames").innerHTML = [...catalog.tools].sort((a, b) => a.name.localeCompare(b.name)).map((tool) => `<option value="${escapeHtml(tool.name)}"></option>`).join("");
  }

  function count(test) { return catalog.tools.filter(test).length; }

  function renderStart() {
    const graded = count((tool) => tool.evidenceLevel !== "E0");
    const projects = new Set(uses.map((use) => use.project));
    $("#startLede").textContent = `${catalog.tools.length} open-source AI tools: skills, models, scanners and apps. ${graded} of them have done real work in the owner's projects and carry a grade above E0. The other ${catalog.tools.length - graded} are E0: only read about so far.`;
    $("#portfolioPulse").innerHTML = `<span><strong>${graded}</strong> did real work</span><span><strong>${uses.length}</strong> recorded uses in ${projects.size} projects</span><span><strong>${count((tool) => tool.safety?.status === "BLOCK")}</strong> blocked by a scan</span><a href="#grades">How grades work</a>`;
    const ladder = catalog.evidenceLevels.map((level) => {
      const n = count((tool) => tool.evidenceLevel === level.id);
      return `<li class="${n ? "" : "is-empty"}"><span class="grade-code">${escapeHtml(level.id)}</span><span class="grade-name">${escapeHtml(evidencePlain[level.id])}</span><span class="grade-count">${n ? plural(n, "tool", "tools") : "none yet"}</span></li>`;
    }).join("");
    $("#catalogFacts").innerHTML = `<figcaption class="path-title">Where the grades come from</figcaption>
      <p class="source-note">${escapeHtml(catalog.meta.gradeSource)}</p>
      <ol class="grade-ladder">${ladder}</ol>
      <p class="path-ceiling">${escapeHtml(catalog.meta.belowE1)}</p>`;
  }

  function renderJourney() {
    const items = [
      { title: "Find a tool for a job", text: "Describe the job in everyday words, or pick one below. You get up to three tools, each with its grade and what you may do with it.", href: "#start-search", action: "Search" },
      { title: "Check whether a tool is safe", text: "Every tool has an “Is it safe?” section: what the scanners found, in plain words.", href: "#safety", action: "See the scan results" },
      { title: "Get the tool set for a kind of work", text: `${plural(packs.length, "pack", "packs")} of tools that work together, and ${plural(count((tool) => tool.origin === "built-here"), "skill", "skills")} built here from what other tools taught.`, href: "#packs", action: "See packs and skills" },
      { title: "See what did real work", text: `The ${count((tool) => tool.evidenceLevel !== "E0")} tools with a grade above E0, with the projects they worked in.`, href: "#proven", action: "See the graded tools" }
    ];
    $("#journeyList").innerHTML = items.map((item) => `<li><a class="journey" href="${item.href}"><span class="journey-title">${escapeHtml(item.title)}</span><span class="journey-text">${escapeHtml(item.text)}</span><span class="journey-action">${escapeHtml(item.action)} <span aria-hidden="true">→</span></span></a></li>`).join("");
  }

  function renderProven() {
    const proven = catalog.tools.filter((tool) => tool.evidenceLevel !== "E0").sort((a, b) => b.evidenceLevel.localeCompare(a.evidenceLevel) || usesOf(b.id).length - usesOf(a.id).length || a.name.localeCompare(b.name));
    $("#provenIntro").textContent = `The ${proven.length} tools at E1 or higher, best proven first. Each grade came from recorded use in a named project and a person's approval.`;
    $("#provenList").innerHTML = proven.map((tool) => {
      const own = usesOf(tool.id);
      const worked = own.filter((use) => use.outcome === "PASS").length;
      const where = projectsOf(tool.id);
      return `<li><button class="proven" type="button" data-open-tool="${escapeHtml(tool.id)}">
        <span class="proven-grade">${evidenceMark(tool.evidenceLevel)}</span>
        <span class="proven-name">${escapeHtml(tool.name)}</span>
        <span class="proven-best">${escapeHtml(first(tool.bestFor, tool.summary))}</span>
        <span class="proven-uses">${own.length ? `${plural(own.length, "recorded use", "recorded uses")}, ${worked} worked · ${escapeHtml(where.join(", "))}` : "Graded from a controlled benchmark kept in the owner's ledger"}</span>
        <span class="proven-decision">${decisionMark(tool.decision)}</span>
      </button></li>`;
    }).join("");
  }

  function renderSafety() {
    const order = ["BLOCK", "REVIEW", "PASS", "WRITTEN", "NOT_SCANNED"];
    $("#safetyCounts").innerHTML = order.map((status) => `<div data-safety="${status}"><dt>${escapeHtml(safetyPlain[status])}</dt><dd><span class="safety-n">${count((tool) => tool.safety?.status === status)}</span> ${escapeHtml(safetyMeaning[status])}</dd></div>`).join("");
    const blocked = catalog.tools.filter((tool) => tool.safety?.status === "BLOCK" || tool.safety?.status === "REVIEW").sort((a, b) => a.safety.status.localeCompare(b.safety.status) || a.name.localeCompare(b.name));
    $("#safetyList").innerHTML = blocked.map((tool) => `<li><button class="row-open" type="button" data-open-tool="${escapeHtml(tool.id)}">${escapeHtml(tool.name)}</button> <span class="verdict" data-safety="${tool.safety.status}">${escapeHtml(safetyPlain[tool.safety.status])}</span></li>`).join("");
  }

  function renderPacks() {
    $("#packList").innerHTML = packs.map((pack) => `<article class="pack-card">
      <h3>${escapeHtml(pack.title)}</h3><p>${escapeHtml(pack.forWork)}</p>
      <ul class="pack-members">${array(pack.members).map((member) => {
        const tool = byId.get(member.toolId);
        return `<li><button class="pack-member" type="button" data-open-tool="${escapeHtml(member.toolId)}"><strong>${escapeHtml(tool?.name || member.toolId)}</strong><span>${escapeHtml(member.role)}</span></button>${tool ? `<span class="pack-grade">${escapeHtml(tool.evidenceLevel)} · ${escapeHtml(evidencePlain[tool.evidenceLevel])}</span>` : ""}</li>`;
      }).join("")}</ul>
    </article>`).join("");
    $("#lessonList").innerHTML = lessons.map((lesson) => {
      const ours = lesson.ours ? byId.get(lesson.ours) : null;
      const from = array(lesson.from).map((id) => `<button class="text-button" type="button" data-open-tool="${escapeHtml(id)}">${escapeHtml(byId.get(id)?.name || id)}</button>`).join(" and ");
      return `<li class="lesson">
        <div class="lesson-head">${ours ? `<button class="lesson-name" type="button" data-open-tool="${escapeHtml(ours.id)}">${escapeHtml(ours.name)}</button>` : `<strong class="lesson-name">Not built yet</strong>`}<span class="lesson-status">${escapeHtml(lesson.status === "built" ? "Built here" : "To read")}</span></div>
        <p><strong>Learned from</strong> ${from}: ${escapeHtml(lesson.idea)}</p>
        <p class="lesson-why"><strong>Why not install the original:</strong> ${escapeHtml(lesson.whyNotInstall)}</p>
      </li>`;
    }).join("");
  }

  function renderCapabilityMap() {
    const families = catalog.capabilityGroups.map((group) => {
      const members = group.toolIds.map((id) => byId.get(id)).filter(Boolean);
      const lead = byId.get(group.leadToolId);
      const graded = members.filter((tool) => tool.evidenceLevel !== "E0").length;
      return { group, members, lead, graded };
    });
    const thin = families.filter(({ members }) => members.length <= 2).length;
    const sourceOnly = count((tool) => tool.evidenceLevel === "E0");
    $("#mapSummary").innerHTML = `<strong>${families.length} families · ${catalog.tools.length} tools</strong><span>${thin} families have two or fewer tools; ${sourceOnly} tools are still E0.</span>`;
    $("#capabilityMapRows").innerHTML = families.map(({ group, members, lead, graded }) => `<li class="map-row">
        <div class="map-family"><button type="button" class="map-family-link" data-map-group="${escapeHtml(group.id)}">${escapeHtml(group.label)}<span aria-hidden="true">↗</span></button><p>${plural(members.length, "tool", "tools")}${members.length <= 2 ? " · thin coverage" : ""}</p></div>
        <div class="map-lead"><strong>${escapeHtml(lead.name)}</strong><div class="map-states">${decisionMark(lead.decision)}<span class="map-evidence" data-level="${escapeHtml(lead.evidenceLevel)}">${escapeHtml(lead.evidenceLevel)} · ${escapeHtml(evidencePlain[lead.evidenceLevel])}</span></div></div>
        <div class="map-risk"><strong class="map-risk-count" data-risk="${graded ? "none" : "elevated"}">${graded ? `${graded} of ${members.length} did real work` : "None graded yet"}</strong><p><span>Next:</span> ${escapeHtml(nextProof(lead))}</p></div>
      </li>`).join("");
  }

  function selectGroup(groupId, options = {}) {
    const group = groupById.get(groupId);
    if (!group) return;
    state.group = groupId;
    state.query = options.query ?? "";
    state.activeTools = toolsFor(groupId, state.query);
    state.selected.clear();
    $$(".task-button").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.group === groupId)));
    $("#recommendationState").hidden = true;
    $("#activeContext").textContent = group.label;
    $("#workspaceTitle").textContent = state.query ? `Best matches for “${state.query}”` : `A starting point for ${group.label.toLowerCase()}`;
    $("#workspaceSummary").textContent = group.useWhen;
    renderRecommendations();
    updateCompare();
    updateUrl();
    if (options.scroll !== false) $("#workspace").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }

  const decisionGlyph = {
    IMPLEMENT: '<circle cx="8" cy="8" r="6" class="g-fill"/>',
    PILOT: '<circle cx="8" cy="8" r="6" class="g-line"/><path d="M8 2a6 6 0 0 0 0 12z" class="g-fill"/>',
    CONDITIONAL: '<circle cx="8" cy="8" r="6" class="g-line"/><path d="M3.5 8h9" class="g-line"/>',
    REFERENCE: '<circle cx="8" cy="8" r="6" class="g-line"/>',
    WATCH: '<circle cx="8" cy="8" r="6" class="g-line g-dash"/>',
    HOLD: '<rect x="2.5" y="2.5" width="11" height="11" class="g-stop-fill"/>',
    REJECT: '<path d="M3 3l10 10M13 3L3 13" class="g-stop-line"/>'
  };
  const riskSteps = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  function decisionMark(decision, options = {}) {
    const key = decisionGlyph[decision] ? decision : "WATCH";
    const words = options.plain === false ? "" : `<span class="decision-words">${escapeHtml(decisionPlain[key])}</span>`;
    return `<span class="decision-badge" data-decision="${escapeHtml(key)}"><svg class="glyph" viewBox="0 0 16 16" aria-hidden="true">${decisionGlyph[key]}</svg>${escapeHtml(key)}${words}</span>`;
  }
  function riskMark(level, suffix = "") {
    const key = riskSteps[level] ? level : "MEDIUM";
    const bars = [1, 2, 3, 4].map((step) => `<rect x="${step * 4 - 3}" y="${14 - step * 3}" width="3" height="${step * 3}" class="${step <= riskSteps[key] ? "filled" : ""}"/>`).join("");
    return `<span class="risk-badge ${key.toLowerCase()}" data-risk="${key}"><svg class="glyph risk-bars" viewBox="0 0 16 16" aria-hidden="true">${bars}</svg>${escapeHtml(level || "UNKNOWN")}${escapeHtml(suffix)}</span>`;
  }
  function safetyMark(tool) {
    const status = tool.safety?.status || "NOT_SCANNED";
    const words = tool.safety?.allCleared ? "Flagged lines read and cleared" : safetyPlain[status];
    return `<span class="verdict" data-safety="${escapeHtml(status)}">${escapeHtml(words)}</span>`;
  }
  function decisionClass(tool) { return String(tool.decision || "WATCH").toLowerCase(); }
  function nextProof(tool) { return nextEvidencePlain[tool.evidenceLevel] || nextEvidencePlain.E0; }
  function evidenceMark(levelId, options = {}) {
    const index = evidenceOrder[levelId] ?? 0;
    const level = evidenceById.get(levelId) || { label: levelId };
    const segments = catalog.evidenceLevels.map((_, segmentIndex) => `<i class="${segmentIndex <= index ? "filled" : ""}"></i>`).join("");
    const name = options.label === false ? "" : `<span class="evidence-name">${escapeHtml(evidencePlain[levelId] || level.label)}</span>`;
    return `<span class="evidence-mark evidence-${String(levelId).toLowerCase()}${options.large ? " is-large" : ""}" data-evidence-level="${escapeHtml(levelId)}" data-evidence-index="${index}">
      <span class="evidence-code">${escapeHtml(levelId)}</span><span class="evidence-verb">${escapeHtml(level.verb || level.label)}</span>
      <span class="evidence-meter" aria-hidden="true">${segments}</span>${name}
    </span>`;
  }
  function decisionBasis(tool) {
    const own = usesOf(tool.id);
    const parts = [tool.evidenceLevel === "E0" ? "E0, only read about" : `${tool.evidenceLevel}, ${plural(own.length, "recorded use", "recorded uses")}`];
    parts.push(safetyPlain[tool.safety?.status] || "Not scanned yet");
    parts.push(`${String(tool.riskLevel || "unknown").toLowerCase()} risk`);
    return parts.join(" · ");
  }
  function decisionReason(tool) {
    return catalog.grading.decisionScale[tool.decision] || "The recorded fit, evidence, and risk require review.";
  }

  function leadRecommendation(tool) {
    const selected = state.selected.has(tool.id);
    return `<article class="recommendation-card lead-brief decision-${decisionClass(tool)}" data-tool="${tool.id}">
      <div class="lead-command">
        <div><span class="rec-rank">Lead for this job</span><h3>${escapeHtml(tool.name)}</h3><p>${escapeHtml(tool.summary)}</p></div>
        <div class="permission-block"><span>What you may do</span>${decisionMark(tool.decision)}<small>${escapeHtml(decisionBasis(tool))}</small></div>
      </div>
      <div class="lead-evidence">
        <div class="proof-stamp">${evidenceMark(tool.evidenceLevel, { large: true })}</div>
        <dl>
          <div><dt>Why this leads</dt><dd>${escapeHtml(first(tool.bestFor, tool.summary))}</dd></div>
          <div><dt>What the decision means</dt><dd>${escapeHtml(decisionReason(tool))}</dd></div>
          <div><dt>What still holds it back</dt><dd>${escapeHtml(first(tool.weaknesses))}</dd></div>
          <div class="next-proof"><dt>To earn the next grade</dt><dd>${escapeHtml(nextProof(tool))}</dd></div>
        </dl>
      </div>
      <div class="rec-actions">
        <button class="primary-button" type="button" data-open-tool="${tool.id}">Open the tool</button>
        <button class="secondary-button compare-choice" type="button" data-compare-tool="${tool.id}" aria-pressed="${selected}">${selected ? "Selected" : "Compare this lead"}</button>
      </div>
    </article>`;
  }

  function alternativeRecommendation(tool, index) {
    const selected = state.selected.has(tool.id);
    return `<article class="recommendation-card alternative decision-${decisionClass(tool)}" data-tool="${tool.id}">
      <div class="alternative-top"><span class="alternative-index">0${index}</span><div><h3>${escapeHtml(tool.name)}</h3><p>${escapeHtml(first(tool.bestFor, tool.summary))}</p></div>${decisionMark(tool.decision)}</div>
      <div class="alternative-proof">${evidenceMark(tool.evidenceLevel)}<span>${escapeHtml(decisionBasis(tool))}</span></div>
      <p class="alternative-delta"><strong>Why it is not the lead:</strong> ${escapeHtml(first(tool.weaknesses))}</p>
      <p class="alternative-next"><strong>To earn the next grade:</strong> ${escapeHtml(nextProof(tool))}</p>
      <div class="alternative-actions"><button class="row-open" type="button" data-open-tool="${tool.id}">Open the tool</button><button class="secondary-button compare-choice" type="button" data-compare-tool="${tool.id}" aria-pressed="${selected}">${selected ? "Selected" : "Compare"}</button></div>
    </article>`;
  }

  function renderRecommendations() {
    const visible = state.activeTools.slice(0, 3);
    $("#recommendationGrid").innerHTML = visible.length ? `${leadRecommendation(visible[0])}<div class="alternative-list">${visible.slice(1).map((tool, index) => alternativeRecommendation(tool, index + 2)).join("")}</div>` : "";
    $("#showMore").hidden = state.activeTools.length <= 3;
    if (!visible.length) {
      $("#recommendationState").hidden = false;
      $("#recommendationState").innerHTML = `<h3>No tool matches that yet.</h3><p>Try other words, or browse the full list. No weak match is shown just to fill the space.</p>`;
    } else $("#recommendationState").hidden = true;
    window.FinalMotion?.revealRecommendations($$(".recommendation-card"));
  }

  function renderProjectTrials() {
    const labels = { executed: "Verified", reference: "Boundary" };
    $("#trialRegister").innerHTML = releaseChecks.map((entry) => `<article class="trial-row trial-${entry.state}">
        <div class="trial-main"><h3>${escapeHtml(entry.title)}</h3><p>${escapeHtml(entry.note)}</p></div>
        <div class="trial-observation"><div class="trial-observation-top"><span class="trial-state-label" data-state="${entry.state}">${escapeHtml(labels[entry.state])}</span></div><small>${escapeHtml(entry.result)}</small></div>
        <div class="trial-decision"><strong>${escapeHtml(entry.proof)}</strong><a class="row-open" href="${escapeHtml(entry.href)}">Inspect check</a></div>
      </article>`).join("");
  }

  function closestGroupForQuery(query) {
    const { plain, extra } = searchWords(query);
    const terms = [...plain, ...extra];
    if (!terms.length) return null;
    let best = null;
    let bestScore = 0;
    for (const group of catalog.capabilityGroups) {
      const groupTools = group.toolIds.map((id) => byId.get(id)).filter(Boolean);
      const haystack = [group.label, group.purpose, group.useWhen, ...groupTools.map(searchText)].join(" ").toLowerCase();
      const score = terms.reduce((sum, term) => sum + (matches(haystack, term) ? 1 : 0), 0) + groupTools.filter((tool) => queryMatches(tool, query)).length / 10;
      if (score > bestScore) { best = group; bestScore = score; }
    }
    return best;
  }

  function handleSearch(event) {
    event.preventDefault();
    const query = $("#jobSearch").value.trim();
    if (!query) { toast("Describe a job or choose one below."); return; }
    const exact = catalog.tools.find((tool) => tool.name.toLowerCase() === query.toLowerCase() || tool.id === query.toLowerCase());
    if (exact) { openTool(exact.id); return; }
    const group = closestGroupForQuery(query);
    if (!group) { toast("No job matched those words. The full list below is filtered by them."); $("#ledgerSearch").value = query; renderLedger(); $("#all-tools").scrollIntoView(); return; }
    const found = toolsFor(group.id, query);
    selectGroup(group.id, { query, scroll: false });
    if (!found.length) { state.activeTools = toolsFor(group.id, ""); renderRecommendations(); }
    $("#workspace").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  function safetySection(tool) {
    const safety = tool.safety || { status: "NOT_SCANNED", headline: "Not scanned yet. Treat it as unknown.", lines: [] };
    const lines = array(safety.lines);
    const lesson = lessons.find((item) => array(item.from).includes(tool.id));
    return `<section class="detail-section safety-section" data-safety="${escapeHtml(safety.status)}" aria-labelledby="safetyTitle-${escapeHtml(tool.id)}">
      <h3 id="safetyTitle-${escapeHtml(tool.id)}">Is it safe?</h3>
      <p class="safety-headline">${safetyMark(tool)} ${escapeHtml(safety.headline)}</p>
      ${lines.length ? `<h4>What the scanners flagged</h4><ul class="flag-list">${lines.map((line) => `<li><code>${escapeHtml(line.where)}</code>: ${escapeHtml(line.means)}</li>`).join("")}</ul>` : ""}
      ${lesson ? `<p>What it taught: ${escapeHtml(lesson.idea)}${lesson.ours && byId.has(lesson.ours) ? ` The ledger built <button class="text-button" type="button" data-open-tool="${escapeHtml(lesson.ours)}">${escapeHtml(byId.get(lesson.ours).name)}</button> from it instead.` : ""}</p>` : ""}
    </section>`;
  }

  function usesSection(tool) {
    const own = usesOf(tool.id);
    const changes = array(tool.changes).filter((change) => change.field === "evidenceLevel");
    if (!own.length && !changes.length) {
      return `<section class="detail-section"><h3>Recorded use</h3><p>${tool.evidenceLevel === "E0" ? "No recorded use yet. " + escapeHtml(catalog.meta.belowE1) : "The grade comes from a controlled benchmark kept in the owner's ledger; its basis is below."}</p></section>`;
    }
    const rows = own.map((use) => `<li class="use-row">
      <div class="use-top"><strong>${escapeHtml(use.project)}</strong><span class="use-outcome" data-outcome="${escapeHtml(use.outcome)}">${escapeHtml(outcomePlain[use.outcome] || use.outcome)}</span><small>${escapeHtml(formatDate(use.date))}</small></div>
      <p>${escapeHtml(use.task)}</p>
      ${use.baseline ? `<p class="use-check"><strong>Expected first:</strong> ${escapeHtml(use.baseline)}</p>` : ""}
      ${use.checkedResult ? `<p class="use-check"><strong>What it got:</strong> ${escapeHtml(use.checkedResult)}</p>` : ""}
      ${array(use.errors).length ? `<p class="use-check"><strong>What went wrong:</strong> ${escapeHtml(array(use.errors).join("; "))}</p>` : ""}
    </li>`).join("");
    const moves = changes.map((change) => `<li>${escapeHtml(formatDate(change.date))}: ${escapeHtml(change.from)} to ${escapeHtml(change.to)}</li>`).join("");
    return `<section class="detail-section"><h3>Recorded use</h3>
      ${moves ? `<p class="use-moves-label">Grade changes, each approved by a person:</p><ul class="use-moves">${moves}</ul>` : ""}
      ${rows ? `<ol class="use-list">${rows}</ol>` : ""}
    </section>`;
  }

  function toolDetail(tool) {
    const currentIndex = evidenceOrder[tool.evidenceLevel] ?? 0;
    const runway = catalog.evidenceLevels.map((level, index) => `<li class="${index < currentIndex ? "complete" : index === currentIndex ? "current" : "future"}" data-evidence-level="${level.id}">${evidenceMark(level.id, { label: false })}<strong>${escapeHtml(evidencePlain[level.id])}</strong>${index < currentIndex ? "<small>Earned</small>" : index === currentIndex ? "<small>Current grade</small>" : "<small>Not yet earned</small>"}</li>`).join("");
    const inPacks = packs.filter((pack) => array(pack.members).some((member) => member.toolId === tool.id));
    return `<p class="detail-summary">${escapeHtml(tool.summary)}</p>
      <div class="detail-meta">${evidenceMark(tool.evidenceLevel)}${decisionMark(tool.decision)}${riskMark(tool.riskLevel, " risk")}</div>
      <section class="detail-section decision-explainer"><h3>What you may do</h3><p><strong>${escapeHtml(decisionPlain[tool.decision] || "Review required")}</strong> (${escapeHtml(tool.decision)}): ${escapeHtml(decisionReason(tool))}</p><small>${escapeHtml(decisionBasis(tool))}</small></section>
      ${safetySection(tool)}
      <section class="detail-section"><h3>Why this grade</h3><p>${escapeHtml(tool.gradeBasis || evidenceById.get(tool.evidenceLevel)?.description || "Basis not recorded.")}</p></section>
      ${usesSection(tool)}
      <section class="detail-section"><h3>Grade ladder</h3><ol class="evidence-runway">${runway}</ol><p class="promotion-callout"><strong>To earn the next grade:</strong> ${escapeHtml(nextProof(tool))}</p></section>
      <section class="detail-section"><h3>Good fit when</h3><ul>${array(tool.bestFor).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
      <section class="detail-section"><h3>Weaknesses and limits</h3><ul>${array(tool.weaknesses).map((item) => `<li>${escapeHtml(item)}</li>`).join("") || "<li>No weaknesses were recorded.</li>"}</ul></section>
      ${inPacks.length ? `<section class="detail-section"><h3>Part of a pack</h3><ul>${inPacks.map((pack) => `<li><strong>${escapeHtml(pack.title)}:</strong> ${escapeHtml(pack.members.find((member) => member.toolId === tool.id).role)}</li>`).join("")}</ul></section>` : ""}
      ${tool.repoUrl ? `<a class="repo-link" href="${escapeHtml(tool.repoUrl)}" target="_blank" rel="noreferrer">Open repository</a>` : `<p class="muted-note">${tool.origin === "built-here" ? "Built in the owner's private ledger; its code is not published here." : "No public repository: this is a design recorded in the ledger."}</p>`}`;
  }

  function openTool(id) {
    const tool = byId.get(id);
    if (!tool) return;
    $("#detailTitle").textContent = tool.name;
    $("#detailMeta").textContent = `${tool.kind} | ${tool.license || "License not recorded"}`;
    $("#detailBody").innerHTML = toolDetail(tool);
    const dialog = $("#detailDialog");
    if (!dialog.open) openDialog(dialog); else $("#detailBody").scrollTop = 0;
    const url = new URL(location.href); url.searchParams.set("tool", id); history.replaceState(null, "", url);
  }

  function toggleCompare(id) {
    if (state.selected.has(id)) state.selected.delete(id);
    else if (state.selected.size < 4) state.selected.add(id);
    else { toast("Compare up to four tools at a time."); return; }
    renderRecommendations();
    updateCompare();
  }

  function updateCompare() {
    const count = state.selected.size;
    $("#compareCount").textContent = count;
    $("#compareSelected").disabled = count < 2;
  }

  function openCompare() {
    const tools = [...state.selected].map((id) => byId.get(id)).filter(Boolean);
    if (tools.length < 2) return;
    $("#compareBody").innerHTML = tools.map((tool) => `<article class="compare-column"><h3>${escapeHtml(tool.name)}</h3><p>${escapeHtml(tool.summary)}</p><dl>
      <div><dt>Grade</dt><dd>${evidenceMark(tool.evidenceLevel)}</dd></div>
      <div><dt>What you may do</dt><dd>${decisionMark(tool.decision)}</dd></div>
      <div><dt>Is it safe?</dt><dd>${safetyMark(tool)}</dd></div>
      <div><dt>Main strength</dt><dd>${escapeHtml(first(tool.bestFor))}</dd></div>
      <div><dt>Main weakness</dt><dd>${escapeHtml(first(tool.weaknesses))}</dd></div>
      <div><dt>Recorded uses</dt><dd>${usesOf(tool.id).length}</dd></div>
      <div><dt>Risk</dt><dd>${riskMark(tool.riskLevel)}</dd></div>
    </dl></article>`).join("");
    openDialog($("#compareDialog"));
  }

  function renderEvidence() {
    $("#evidenceScale").innerHTML = catalog.evidenceLevels.map((level, index) => {
      const n = count((tool) => tool.evidenceLevel === level.id);
      return `<li data-evidence-level="${level.id}" style="--evidence-index:${index}">${evidenceMark(level.id)}<strong class="evidence-proof">Proof: ${escapeHtml(level.proof || level.label)}</strong><p>${escapeHtml(level.description)}</p><p class="evidence-count">${n ? plural(n, "tool", "tools") : "No tool yet"}</p></li>`;
    }).join("");
    $("#gradeSource").textContent = `${catalog.meta.gradeSource} ${catalog.meta.belowE1}`;
    const used = Object.keys(decisionPlain).filter((key) => catalog.tools.some((tool) => tool.decision === key));
    $("#decisionWords").innerHTML = `Beside the grade, each tool has a decision about what you may do with it: ${used.map((key) => `<strong>${escapeHtml(decisionPlain[key])}</strong> (${escapeHtml(key)}, ${count((tool) => tool.decision === key)})`).join(", ")}.`;
  }

  function renderMethod() {
    const decisionItems = Object.entries(catalog.grading.decisionScale).map(([key, value]) => `<div class="method-item"><strong>${escapeHtml(decisionPlain[key] || key)} (${escapeHtml(key)})</strong><p>${escapeHtml(value)}</p></div>`).join("");
    $("#methodBody").innerHTML = `<p>The grade says how much proof stands behind a tool. The decision says what you may do with it now. Risk names what can still stop the work. ${escapeHtml(catalog.meta.gradeSource)}</p><div class="method-list">${decisionItems}</div>`;
  }

  function populateFilters() {
    $("#groupFilter").insertAdjacentHTML("beforeend", catalog.capabilityGroups.map((group) => `<option value="${group.id}">${escapeHtml(group.label)}</option>`).join(""));
    $("#decisionFilter").insertAdjacentHTML("beforeend", Object.keys(decisionPlain).map((key) => `<option value="${key}">${escapeHtml(decisionPlain[key])} (${key})</option>`).join(""));
    $("#evidenceFilter").insertAdjacentHTML("beforeend", catalog.evidenceLevels.map((level) => `<option value="${level.id}">${level.id} ${escapeHtml(evidencePlain[level.id])}</option>`).join(""));
    $("#safetyFilter").insertAdjacentHTML("beforeend", Object.keys(safetyPlain).map((key) => `<option value="${key}">${escapeHtml(safetyPlain[key])}</option>`).join(""));
  }

  function ledgerTools() {
    const query = $("#ledgerSearch").value.trim();
    const group = $("#groupFilter").value;
    const decision = $("#decisionFilter").value;
    const evidence = $("#evidenceFilter").value;
    const safety = $("#safetyFilter").value;
    const sort = $("#sortFilter").value;
    const riskOrder = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
    const filtered = catalog.tools.filter((tool) => {
      if (query && !queryMatches(tool, query)) return false;
      if (group !== "all" && !groupById.get(group)?.toolIds.includes(tool.id)) return false;
      if (decision !== "all" && tool.decision !== decision) return false;
      if (evidence !== "all" && tool.evidenceLevel !== evidence) return false;
      if (safety !== "all" && tool.safety?.status !== safety) return false;
      return true;
    });
    return filtered.sort((a, b) => {
      if (sort === "decision") return (decisionOrder[b.decision] ?? -1) - (decisionOrder[a.decision] ?? -1) || a.name.localeCompare(b.name);
      if (sort === "risk") return (riskOrder[a.riskLevel] ?? 9) - (riskOrder[b.riskLevel] ?? 9) || a.name.localeCompare(b.name);
      if (sort === "evidence") return (evidenceOrder[b.evidenceLevel] ?? -1) - (evidenceOrder[a.evidenceLevel] ?? -1) || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    });
  }

  function renderLedger() {
    const filtered = ledgerTools();
    const shown = filtered.slice(0, state.ledgerLimit);
    $("#allCount").textContent = plural(filtered.length, "tool", "tools");
    $("#ledgerRows").innerHTML = shown.map((tool) => `<tr>
      <td data-label="Tool"><strong>${escapeHtml(tool.name)}</strong><span>${escapeHtml(tool.kind)}</span></td>
      <td data-label="Best for">${escapeHtml(tool.summary)}</td>
      <td data-label="Grade">${evidenceMark(tool.evidenceLevel)}</td>
      <td data-label="What you may do">${decisionMark(tool.decision)}</td>
      <td data-label="Is it safe?">${safetyMark(tool)}</td>
      <td data-label="Details"><button class="row-open" type="button" data-open-tool="${tool.id}">Open the tool</button></td>
    </tr>`).join("");
    $("#ledgerEmpty").hidden = filtered.length > 0;
    $("#loadMore").hidden = filtered.length <= state.ledgerLimit;
  }

  function clearFilters() {
    $("#ledgerSearch").value = "";
    for (const id of ["groupFilter", "decisionFilter", "evidenceFilter", "safetyFilter"]) $("#" + id).value = "all";
    $("#sortFilter").value = "name";
    state.ledgerLimit = 16;
    renderLedger();
  }

  // ---------- The story video, in either language ----------
  function renderStory() {
    const script = window.STORY_SCRIPT;
    const video = $("#storyVideo");
    if (!script || !video) { $("#story").hidden = true; return; }
    const clock = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
    const trackUrls = {};
    const show = (lang) => {
      const data = script[lang];
      $("#filmScript").lang = lang;
      $("#filmScript").innerHTML = data.lines.map((line) => `<li><span class="script-time">${clock(line.start)}</span> ${escapeHtml(line.text)}</li>`).join("");
      $("#filmCaption").lang = lang;
      $("#filmCaption").textContent = data.caption;
      const track = video.querySelector("track");
      // Captions load from the data file, so they also work when the page is opened straight from disk.
      trackUrls[lang] ??= URL.createObjectURL(new Blob([data.vtt], { type: "text/vtt" }));
      track.src = trackUrls[lang];
      track.srclang = lang;
      track.label = lang === "es" ? "Español" : "English";
      video.querySelector("source").src = data.video;
      video.poster = data.poster;
      video.load();
    };
    $$(".film-switch [data-lang]").forEach((button) => button.addEventListener("click", () => {
      $$(".film-switch [data-lang]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      show(button.dataset.lang);
    }));
    show("en");
  }

  function openDialog(dialog) {
    dialog.showModal();
    window.FinalMotion?.openDialog(dialog);
  }

  function closeDialog(dialog) {
    window.FinalMotion?.closeDialog(dialog, () => {
      dialog.close();
      if (dialog.id === "detailDialog") { const url = new URL(location.href); url.searchParams.delete("tool"); history.replaceState(null, "", url); }
    });
  }

  function openShare() {
    const group = state.group ? groupById.get(state.group) : null;
    $("#shareContext").textContent = group ? `This view will keep “${group.label}” and ${state.activeTools.length} matching tools.` : "This view opens the complete public ledger.";
    openDialog($("#shareDialog"));
  }

  function updateUrl() {
    const url = new URL(location.href);
    if (state.group) url.searchParams.set("job", state.group); else url.searchParams.delete("job");
    if (state.query) url.searchParams.set("q", state.query); else url.searchParams.delete("q");
    history.replaceState(null, "", url);
  }

  async function copyLink() {
    updateUrl();
    try { await navigator.clipboard.writeText(location.href); toast(location.protocol === "file:" ? "Local file address copied. Send the project folder or ZIP with it." : "Share link copied."); }
    catch { toast("Copy was blocked. Use the browser address bar instead."); }
  }

  function downloadJson() {
    const payload = {
      exportedAt: new Date().toISOString(),
      source: "Tool Research Ledger guided decision workspace",
      privacy: catalog.meta.privacy,
      gradeSource: catalog.meta.gradeSource,
      job: state.group ? groupById.get(state.group) : null,
      query: state.query,
      recommendations: (state.activeTools.length ? state.activeTools.slice(0, 12) : catalog.tools).map((tool) => ({
        id: tool.id, name: tool.name, repository: tool.repoUrl, summary: tool.summary, evidenceLevel: tool.evidenceLevel,
        decision: tool.decision, riskLevel: tool.riskLevel, bestFor: tool.bestFor, weaknesses: tool.weaknesses,
        gradeBasis: tool.gradeBasis, safety: tool.safety?.status, recordedUses: usesOf(tool.id).length
      }))
    };
    const json = JSON.stringify(payload, null, 2);
    if (location.protocol === "file:") {
      $("#packetText").value = json;
      $("#packetFallback").hidden = false;
      $("#packetText").focus(); $("#packetText").select();
      toast("Packet ready to copy or save.");
      return;
    }
    const blob = new Blob([json], { type: "application/json" });
    const link = document.createElement("a");
    const objectUrl = URL.createObjectURL(blob);
    link.href = objectUrl;
    link.download = "tool-research-view.json"; link.hidden = true;
    document.body.append(link); link.click();
    setTimeout(() => { URL.revokeObjectURL(objectUrl); link.remove(); }, 1500);
    toast("Research packet downloaded.");
  }

  async function copyPacket() {
    const text = $("#packetText").value;
    try { await navigator.clipboard.writeText(text); toast("Research packet copied."); }
    catch { $("#packetText").focus(); $("#packetText").select(); toast("Copy was blocked. The packet is selected for manual copy."); }
  }

  let toastTimer;
  function toast(message) {
    const element = $("#toast"); element.textContent = message; element.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => element.classList.remove("show"), 3200);
  }

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("ledger-final-theme", next); } catch { /* private window: the theme still applies */ }
    $("#themeToggle").setAttribute("aria-label", `Switch to ${next === "dark" ? "light" : "dark"} theme`);
  }

  function restoreState() {
    let savedTheme = null;
    try { savedTheme = localStorage.getItem("ledger-final-theme"); } catch { /* storage blocked */ }
    if (savedTheme === "dark" || savedTheme === "light") document.documentElement.dataset.theme = savedTheme;
    else if (matchMedia("(prefers-color-scheme: dark)").matches) document.documentElement.dataset.theme = "dark";
    $("#themeToggle").setAttribute("aria-label", `Switch to ${document.documentElement.dataset.theme === "dark" ? "light" : "dark"} theme`);
    const params = new URL(location.href).searchParams;
    const group = params.get("job");
    const query = params.get("q") || "";
    if (groupById.has(group)) { $("#jobSearch").value = query; selectGroup(group, { query, scroll: false }); }
    const tool = params.get("tool"); if (byId.has(tool)) setTimeout(() => openTool(tool), 0);
  }

  function bindEvents() {
    $("#jobSearchForm").addEventListener("submit", handleSearch);
    $("#taskGrid").addEventListener("click", (event) => { const button = event.target.closest("[data-group]"); if (button) selectGroup(button.dataset.group); });
    $("#capabilityMapRows").addEventListener("click", (event) => { const button = event.target.closest("[data-map-group]"); if (button) selectGroup(button.dataset.mapGroup); });
    document.addEventListener("click", (event) => {
      const open = event.target.closest("[data-open-tool]"); if (open) openTool(open.dataset.openTool);
      const compare = event.target.closest("[data-compare-tool]"); if (compare) toggleCompare(compare.dataset.compareTool);
      const close = event.target.closest("[data-close]"); if (close) closeDialog(document.getElementById(close.dataset.close));
    });
    ["detailDialog", "compareDialog", "methodDialog", "shareDialog"].forEach((id) => {
      const dialog = document.getElementById(id);
      dialog.addEventListener("click", (event) => { if (event.target === dialog) closeDialog(dialog); });
    });
    $("#compareSelected").addEventListener("click", openCompare);
    $("#showMore").addEventListener("click", () => { $("#groupFilter").value = state.group || "all"; renderLedger(); $("#all-tools").scrollIntoView({ behavior: "smooth" }); });
    $("#openMethod").addEventListener("click", () => openDialog($("#methodDialog")));
    $("#themeToggle").addEventListener("click", toggleTheme);
    ["shareTop", "shareResults"].forEach((id) => $("#" + id).addEventListener("click", openShare));
    $("#copyLink").addEventListener("click", copyLink);
    $("#downloadJson").addEventListener("click", downloadJson);
    $("#copyPacket").addEventListener("click", copyPacket);
    ["ledgerSearch", "groupFilter", "decisionFilter", "evidenceFilter", "safetyFilter", "sortFilter"].forEach((id) => $("#" + id).addEventListener(id === "ledgerSearch" ? "input" : "change", () => { state.ledgerLimit = 16; renderLedger(); }));
    $("#clearFilters").addEventListener("click", clearFilters);
    $("#loadMore").addEventListener("click", () => { state.ledgerLimit += 16; renderLedger(); });
    document.addEventListener("keydown", (event) => {
      if (event.key === "/" && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) { event.preventDefault(); $("#jobSearch").focus(); }
    });
  }

  renderTasks();
  renderStart();
  renderJourney();
  renderProven();
  renderSafety();
  renderPacks();
  renderCapabilityMap();
  renderEvidence();
  renderMethod();
  renderProjectTrials();
  populateFilters();
  renderLedger();
  renderStory();
  bindEvents();
  restoreState();
})();
