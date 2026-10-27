(function () {
  "use strict";

  const catalog = window.CATALOG;
  if (!catalog) throw new Error("Catalog failed to load");

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const byId = new Map(catalog.tools.map((tool) => [tool.id, tool]));
  const groupById = new Map(catalog.capabilityGroups.map((group) => [group.id, group]));
  const evidenceById = new Map(catalog.evidenceLevels.map((level) => [level.id, level]));
  const decisionOrder = { IMPLEMENT: 7, PILOT: 6, CONDITIONAL: 5, REFERENCE: 4, WATCH: 3, HOLD: 1, REJECT: 0 };
  const fitOrder = { A: 4, B: 3, C: 2, D: 1, UNPROVEN: 0 };
  const evidenceOrder = { E0: 0, E1: 1, E2: 2, E3: 3, E4: 4, E5: 5 };
  const decisionPlain = {
    IMPLEMENT: "Ready for bounded use",
    PILOT: "Run a controlled pilot",
    CONDITIONAL: "Use only with named controls",
    REFERENCE: "Study patterns, do not install wholesale",
    WATCH: "Track until a trigger justifies testing",
    HOLD: "Do not use yet",
    REJECT: "Not suitable for this project"
  };
  const evidencePlain = {
    E0: "Source reviewed",
    E1: "Runs on a small test",
    E2: "Checked against real input",
    E3: "Checked across representative cases",
    E4: "Independently confirmed",
    E5: "Proven with ongoing monitoring"
  };
  const nextEvidencePlain = {
    E0: "Run one bounded task and preserve its output, checks, limitations, and rollback.",
    E1: "Compare against a fixed baseline with acceptance criteria and isolated attribution.",
    E2: "Repeat across representative cases and known failure modes.",
    E3: "Obtain confirmation from a separate reviewer or production-like process.",
    E4: "Monitor sustained use, drift, incidents, and rollback behavior.",
    E5: "Maintain monitoring and revalidate after material changes."
  };
  const releaseChecks = [
    { state: "executed", title: "Catalog integrity", note: `Checks ${catalog.tools.length} source-reviewed tools, ${catalog.capabilityGroups.length} capability families, valid relations, and exact JavaScript/JSON agreement.`, result: "Automated · current build", proof: "scripts/verify.mjs", href: "scripts/verify.mjs" },
    { state: "executed", title: "Negative mutation", note: "Corrupts the evidence scale and removes one public source; the validator must reject both.", result: "Automated · expected failures detected", proof: "scripts/mutation-test.mjs", href: "scripts/mutation-test.mjs" },
    { state: "executed", title: "Browser workflow", note: "Exercises search, filters, sorting, comparison, details, themes, keyboard focus, responsive layout, and reduced motion.", result: "Desktop and mobile", proof: "scripts/browser-qa.mjs", href: "scripts/browser-qa.mjs" },
    { state: "executed", title: "Privacy and package", note: "Scans public files, builds an allowlisted deterministic ZIP, and hashes every delivered source file.", result: "Automated · public files only", proof: "scripts/privacy-scan.mjs", href: "scripts/privacy-scan.mjs" },
    { state: "reference", title: "Catalog evidence boundary", note: "Repository summaries are source-reviewed context. Private trials and internal reports are excluded and cannot raise the public evidence level.", result: "Documented · E0 ceiling", proof: "docs/EVIDENCE_MODEL.md", href: "docs/EVIDENCE_MODEL.md" }
  ];

  const tasks = [
    { group: "document-intelligence", label: "Recover a document", detail: "OCR, scan, inspect, or prepare PDFs" },
    { group: "design-quality", label: "Improve an interface", detail: "Design, review, or add useful motion" },
    { group: "repo-intelligence", label: "Understand a codebase", detail: "Map and navigate an unfamiliar repository" },
    { group: "skill-governance", label: "Review an AI skill", detail: "Screen instructions before adoption" },
    { group: "office-data", label: "Work with files and data", detail: "Spreadsheets, transfers, media, or workspace tasks" },
    { group: "development-control", label: "Plan and control a build", detail: "Requirements, task boundaries, and clean changes" },
    { group: "knowledge-research", label: "Organize research", detail: "Compare sources and preserve a useful knowledge base" },
    { group: "agent-platforms", label: "Evaluate an agent", detail: "Test high-agency tools inside safe boundaries" }
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

  function scoreTool(tool, group) {
    const fit = Math.max(0, ...Object.values(tool.projectFit || {}).map((grade) => fitOrder[grade] ?? 0));
    const curatedIndex = group ? group.toolIds.indexOf(tool.id) : -1;
    const memberBoost = curatedIndex >= 0 ? Math.max(2, 20 - curatedIndex * 2) : 0;
    const risk = tool.riskLevel === "LOW" ? 2 : tool.riskLevel === "MEDIUM" ? 1 : tool.riskLevel === "HIGH" ? -1 : -2;
    return memberBoost + fit + (decisionOrder[tool.decision] ?? 0) + (evidenceOrder[tool.evidenceLevel] ?? 0) + risk;
  }

  function searchText(tool) {
    return [tool.name, tool.kind, tool.summary, tool.implementation, tool.license, ...array(tool.bestFor), ...array(tool.weaknesses), ...array(tool.risks), ...array(tool.tags)].join(" ").toLowerCase();
  }

  function toolsFor(groupId, query) {
    const group = groupId ? groupById.get(groupId) : null;
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return catalog.tools
      .filter((tool) => !group || group.toolIds.includes(tool.id))
      .filter((tool) => !terms.length || terms.every((term) => searchText(tool).includes(term)))
      .sort((a, b) => scoreTool(b, group) - scoreTool(a, group) || a.name.localeCompare(b.name));
  }

  function renderTasks() {
    $("#taskGrid").innerHTML = tasks.map((task) => `
      <button class="task-button" type="button" data-group="${task.group}" aria-pressed="false">
        <strong>${escapeHtml(task.label)}</strong><span>${escapeHtml(task.detail)}</span>
      </button>`).join("");
  }

  function renderFacts() {
    const e0 = catalog.tools.filter((tool) => tool.evidenceLevel === "E0").length;
    const step = (label, body) => `<li class="path-step"><span class="path-label">${label}</span>${body}</li>`;
    const ladder = catalog.evidenceLevels.map((level, index) => `<i class="${index === 0 ? "filled" : ""}"></i>`).join("");
    $("#catalogFacts").innerHTML = `<figcaption class="path-title">How a choice is made here</figcaption><ol class="path-steps">
      ${step("1 · Project need", `<strong>Describe the job</strong><span>or pick one of ${tasks.length} common jobs</span>`)}
      ${step("2 · Filtered candidates", `<strong>${catalog.tools.length} to 3</strong><span>matching tools from ${catalog.capabilityGroups.length} families, with alternatives to compare</span>`)}
      ${step("3 · Evidence", `<span class="path-ladder" aria-hidden="true">${ladder}</span><strong>E0 of E5</strong><span>what was checked, and what the next level needs</span>`)}
      ${step("4 · Decision", `${decisionMark("PILOT")}<span>the permitted next action, its controls, and the next test</span>`)}
    </ol><p class="path-ceiling">All ${e0} of ${catalog.tools.length} entries are E0: source reviewed. A project trial that keeps its task, version, input, result, checks, and limits moves an entry up. None has moved yet.</p>`;
  }

  function renderPortfolioPulse() {
    const familyCount = catalog.capabilityGroups.length;
    const thinCount = catalog.capabilityGroups.filter((group) => group.toolIds.length <= 2).length;
    const pilotCount = catalog.tools.filter((tool) => tool.decision === "PILOT").length;
    const elevatedCount = catalog.tools.filter((tool) => ["HIGH", "CRITICAL"].includes(tool.riskLevel)).length;
    $("#portfolioPulse").innerHTML = `<span><strong>${catalog.tools.length}</strong> tools</span><span><strong>${familyCount}</strong> job families, ${thinCount} thin</span><span><strong>${pilotCount}</strong> marked PILOT</span><span><strong>${elevatedCount}</strong> with high or critical risk</span><a href="#capability-map">See the capability map</a>`;
  }

  function renderCapabilityMap() {
    const families = catalog.capabilityGroups.map((group) => {
      const members = group.toolIds.map((id) => byId.get(id)).filter(Boolean);
      const lead = byId.get(group.leadToolId);
      const elevated = members.filter((tool) => ["HIGH", "CRITICAL"].includes(tool.riskLevel)).length;
      return { group, members, lead, elevated };
    });
    const thin = families.filter(({ members }) => members.length <= 2).length;
    const sourceOnly = catalog.tools.filter((tool) => tool.evidenceLevel === "E0").length;
    $("#mapSummary").innerHTML = `<strong>${families.length} families · ${catalog.tools.length} options</strong><span>${thin} families have two or fewer options; ${sourceOnly} options remain at E0.</span>`;
    $("#capabilityMapRows").innerHTML = families.map(({ group, members, lead, elevated }) => {
      const next = first(lead.reentryTriggers, nextProof(lead));
      const concentration = elevated === 0 ? "None elevated" : `${elevated} of ${members.length} elevated`;
      return `<li class="map-row">
        <div class="map-family"><button type="button" class="map-family-link" data-map-group="${escapeHtml(group.id)}">${escapeHtml(group.label)}<span aria-hidden="true">↗</span></button><p>${members.length} ${members.length === 1 ? "option" : "options"}${members.length <= 2 ? " · thin coverage" : ""}</p></div>
        <div class="map-lead"><strong>${escapeHtml(lead.name)}</strong><div class="map-states">${decisionMark(lead.decision)}<span class="map-evidence" data-level="${escapeHtml(lead.evidenceLevel)}">${escapeHtml(lead.evidenceLevel)} · ${escapeHtml(evidencePlain[lead.evidenceLevel] || "Proof recorded")}</span></div></div>
        <div class="map-risk"><strong class="map-risk-count" data-risk="${elevated ? "elevated" : "none"}">${escapeHtml(concentration)}</strong><p><span>Next:</span> ${escapeHtml(next)}</p></div>
      </li>`;
    }).join("");
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
    $("#workspaceTitle").textContent = state.query ? `Best matches for “${state.query}”` : `A clear starting point for ${group.label.toLowerCase()}`;
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
  function decisionMark(decision) {
    const key = decisionGlyph[decision] ? decision : "WATCH";
    return `<span class="decision-badge" data-decision="${escapeHtml(key)}"><svg class="glyph" viewBox="0 0 16 16" aria-hidden="true">${decisionGlyph[key]}</svg>${escapeHtml(key)}</span>`;
  }
  function riskMark(level, suffix = "") {
    const key = riskSteps[level] ? level : "MEDIUM";
    const bars = [1, 2, 3, 4].map((step) => `<rect x="${step * 4 - 3}" y="${14 - step * 3}" width="3" height="${step * 3}" class="${step <= riskSteps[key] ? "filled" : ""}"/>`).join("");
    return `<span class="risk-badge ${key.toLowerCase()}" data-risk="${key}"><svg class="glyph risk-bars" viewBox="0 0 16 16" aria-hidden="true">${bars}</svg>${escapeHtml(level || "UNKNOWN")}${escapeHtml(suffix)}</span>`;
  }
  function decisionClass(tool) { return String(tool.decision || "WATCH").toLowerCase(); }
  function adoption(tool) { return tool.assurance?.adoption || {}; }
  function runtime(tool) { return tool.assurance?.runtimeTrial; }
  function scan(tool) { return tool.assurance?.staticScan; }
  function nextProof(tool) { return adoption(tool).nextEvidence || nextEvidencePlain[tool.evidenceLevel] || nextEvidencePlain.E0; }
  function evidenceMark(levelId, options = {}) {
    const index = evidenceOrder[levelId] ?? 0;
    const level = evidenceById.get(levelId) || { label: levelId, verb: "REVIEW" };
    const segments = catalog.evidenceLevels.map((_, segmentIndex) => `<i class="${segmentIndex <= index ? "filled" : ""}"></i>`).join("");
    const name = options.label === false ? "" : `<span class="evidence-name">${escapeHtml(evidencePlain[levelId] || level.label)}</span>`;
    return `<span class="evidence-mark evidence-${String(levelId).toLowerCase()}${options.large ? " is-large" : ""}" data-evidence-level="${escapeHtml(levelId)}" data-evidence-index="${index}">
      <span class="evidence-code">${escapeHtml(levelId)}</span><span class="evidence-verb">${escapeHtml(level.verb || level.label)}</span>
      <span class="evidence-meter" aria-hidden="true">${segments}</span>${name}
    </span>`;
  }
  function decisionBasis(tool) {
    const bestFit = Math.max(0, ...Object.values(tool.projectFit || {}).map((grade) => fitOrder[grade] ?? 0));
    const parts = [`Fit ${({ 4: "A", 3: "B", 2: "C", 1: "D" })[bestFit] || "unproven"}`, tool.evidenceLevel];
    if (runtime(tool)?.status) parts.push(`runtime ${runtime(tool).status.toLowerCase()}`);
    if (scan(tool)?.status) parts.push(`scan ${scan(tool).status.toLowerCase()}`);
    parts.push(`${String(tool.riskLevel || "unknown").toLowerCase()} risk`);
    return parts.join(" · ");
  }
  function decisionReason(tool) {
    const reasons = {
      IMPLEMENT: "A bounded use is supported by observed evidence. Do not extend it beyond the recorded scope.",
      PILOT: "The fit is promising, but public proof stops at source review. Run a bounded test before routine use.",
      CONDITIONAL: "The job fit is useful only when the named risk controls and scope boundary are enforced.",
      REFERENCE: "Use the ideas as references. Current controls do not justify installation or direct use.",
      WATCH: "No current project need justifies the cost of a trial.",
      HOLD: "A blocking risk or missing control prevents use.",
      REJECT: "Project fit or a hard control fails."
    };
    return reasons[tool.decision] || "The recorded fit, evidence, and risk require review.";
  }

  function leadRecommendation(tool) {
    const selected = state.selected.has(tool.id);
    return `<article class="recommendation-card lead-brief decision-${decisionClass(tool)}" data-tool="${tool.id}">
      <div class="lead-command">
        <div><span class="rec-rank">Lead for this job</span><h3>${escapeHtml(tool.name)}</h3><p>${escapeHtml(tool.summary)}</p></div>
        <div class="permission-block"><span>Permitted action</span>${decisionMark(tool.decision)}<strong>${escapeHtml(decisionPlain[tool.decision] || "Review required")}</strong><small>${escapeHtml(decisionBasis(tool))}</small></div>
      </div>
      <div class="lead-evidence">
        <div class="proof-stamp">${evidenceMark(tool.evidenceLevel, { large: true })}</div>
        <dl>
          <div><dt>Why this leads</dt><dd>${escapeHtml(first(tool.bestFor, tool.summary))}</dd></div>
          <div><dt>Decision basis</dt><dd>${escapeHtml(decisionReason(tool))}</dd></div>
          <div><dt>What still blocks confidence</dt><dd>${escapeHtml(first(tool.risks, first(tool.weaknesses)))}</dd></div>
          <div class="next-proof"><dt>Proof needed next</dt><dd>${escapeHtml(nextProof(tool))}</dd></div>
        </dl>
      </div>
      <div class="rec-actions">
        <button class="primary-button" type="button" data-open-tool="${tool.id}">Inspect evidence</button>
        <button class="secondary-button compare-choice" type="button" data-compare-tool="${tool.id}" aria-pressed="${selected}">${selected ? "Selected" : "Compare this lead"}</button>
      </div>
    </article>`;
  }

  function alternativeRecommendation(tool, index) {
    const selected = state.selected.has(tool.id);
    return `<article class="recommendation-card alternative decision-${decisionClass(tool)}" data-tool="${tool.id}">
      <div class="alternative-top"><span class="alternative-index">0${index}</span><div><h3>${escapeHtml(tool.name)}</h3><p>${escapeHtml(first(tool.bestFor, tool.summary))}</p></div>${decisionMark(tool.decision)}</div>
      <div class="alternative-proof">${evidenceMark(tool.evidenceLevel)}<span>${escapeHtml(decisionBasis(tool))}</span></div>
      <p class="alternative-delta"><strong>Why it is not the lead:</strong> ${escapeHtml(first(tool.risks, first(tool.weaknesses)))}</p>
      <p class="alternative-next"><strong>Move it forward:</strong> ${escapeHtml(nextProof(tool))}</p>
      <div class="alternative-actions"><button class="row-open" type="button" data-open-tool="${tool.id}">Inspect evidence</button><button class="secondary-button compare-choice" type="button" data-compare-tool="${tool.id}" aria-pressed="${selected}">${selected ? "Selected" : "Compare"}</button></div>
    </article>`;
  }

  function renderRecommendations() {
    const visible = state.activeTools.slice(0, 3);
    $("#recommendationGrid").innerHTML = visible.length ? `${leadRecommendation(visible[0])}<div class="alternative-list">${visible.slice(1).map((tool, index) => alternativeRecommendation(tool, index + 2)).join("")}</div>` : "";
    $("#showMore").hidden = state.activeTools.length <= 3;
    if (!visible.length) {
      $("#recommendationState").hidden = false;
      $("#recommendationState").innerHTML = `<h3>No documented match yet.</h3><p>Try a broader description or browse the full ledger. No weak match has been promoted to fill the space.</p>`;
    } else $("#recommendationState").hidden = true;
    window.FinalMotion?.revealRecommendations($$(".recommendation-card"));
  }

  function renderProjectTrials() {
    const labels = { executed: "Verified", reference: "Boundary" };
    $("#trialRegister").innerHTML = releaseChecks.map((entry) => {
      return `<article class="trial-row trial-${entry.state}">
        <div class="trial-main"><h3>${escapeHtml(entry.title)}</h3><p>${escapeHtml(entry.note)}</p></div>
        <div class="trial-observation"><div class="trial-observation-top"><span class="trial-state-label" data-state="${entry.state}">${escapeHtml(labels[entry.state])}</span></div><small>${escapeHtml(entry.result)}</small></div>
        <div class="trial-decision"><strong>${escapeHtml(entry.proof)}</strong><a class="row-open" href="${escapeHtml(entry.href)}">Inspect check</a></div>
      </article>`;
    }).join("");
  }

  function closestGroupForQuery(query) {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!terms.length) return null;
    let best = null;
    let bestScore = 0;
    for (const group of catalog.capabilityGroups) {
      const groupTools = group.toolIds.map((id) => byId.get(id)).filter(Boolean);
      const haystack = [group.label, group.purpose, group.useWhen, ...groupTools.map(searchText)].join(" ").toLowerCase();
      const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
      if (score > bestScore) { best = group; bestScore = score; }
    }
    return best;
  }

  function handleSearch(event) {
    event.preventDefault();
    const query = $("#jobSearch").value.trim();
    if (!query) { toast("Describe a job or choose one below."); return; }
    const group = closestGroupForQuery(query);
    if (!group) { toast("No clear job family matched. Browse the full ledger for a known tool."); $("#ledgerSearch").value = query; renderLedger(); $("#all-tools").scrollIntoView(); return; }
    const matches = toolsFor(group.id, query);
    selectGroup(group.id, { query, scroll: false });
    if (!matches.length) state.activeTools = toolsFor(group.id, "");
    renderRecommendations();
    $("#workspace").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  function toolDetail(tool) {
    const currentIndex = evidenceOrder[tool.evidenceLevel] ?? 0;
    const runway = catalog.evidenceLevels.map((level, index) => `<li class="${index < currentIndex ? "complete" : index === currentIndex ? "current" : "future"}" data-evidence-level="${level.id}">${evidenceMark(level.id, { label: false })}<strong>${escapeHtml(level.proof || evidencePlain[level.id])}</strong>${index < currentIndex ? "<small>Completed</small>" : index === currentIndex ? "<small>Current ceiling</small>" : "<small>Not yet earned</small>"}</li>`).join("");
    return `<p class="detail-summary">${escapeHtml(tool.summary)}</p>
      <div class="detail-meta">${evidenceMark(tool.evidenceLevel)}${decisionMark(tool.decision)}${riskMark(tool.riskLevel, " risk")}</div>
      <section class="detail-section decision-explainer"><h3>What this decision permits</h3><p><strong>${escapeHtml(decisionPlain[tool.decision] || "Review required")}</strong></p><p>${escapeHtml(adoption(tool).rationale || tool.gradeBasis || "No adoption rationale was recorded.")}</p><small>${escapeHtml(decisionBasis(tool))}</small></section>
      <section class="detail-section"><h3>Evidence runway</h3><ol class="evidence-runway">${runway}</ol><p class="promotion-callout"><strong>Next promotion requires:</strong> ${escapeHtml(nextProof(tool))}</p></section>
      <section class="detail-section"><h3>Good fit when</h3><ul>${array(tool.bestFor).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
      <section class="detail-section"><h3>Weaknesses and limits</h3><ul>${array(tool.weaknesses).map((item) => `<li>${escapeHtml(item)}</li>`).join("") || "<li>No weaknesses were recorded.</li>"}</ul></section>
      <section class="detail-section"><h3>Risks to control</h3><ul>${array(tool.risks).map((item) => `<li>${escapeHtml(item)}</li>`).join("") || "<li>No project-specific risk was recorded.</li>"}</ul></section>
      <section class="detail-section"><h3>Recommended use</h3><p>${escapeHtml(tool.implementation || "Define a bounded evaluation before use.")}</p></section>
      <section class="detail-section"><h3>Why this evidence level</h3><p>${escapeHtml(tool.gradeBasis || evidenceById.get(tool.evidenceLevel)?.description || "Evidence basis not documented.")}</p></section>
      ${tool.publicEvidenceNote ? `<section class="detail-section evidence-boundary"><h3>Public evidence boundary</h3><p>${escapeHtml(tool.publicEvidenceNote)}</p></section>` : ""}
      <a class="repo-link" href="${escapeHtml(tool.repoUrl)}" target="_blank" rel="noreferrer">Open repository</a>`;
  }

  function openTool(id) {
    const tool = byId.get(id);
    if (!tool) return;
    $("#detailTitle").textContent = tool.name;
    $("#detailMeta").textContent = `${tool.kind} | ${tool.license || "License not recorded"}`;
    $("#detailBody").innerHTML = toolDetail(tool);
    openDialog($("#detailDialog"));
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
      <div><dt>Evidence</dt><dd>${evidenceMark(tool.evidenceLevel)}</dd></div>
      <div><dt>Decision</dt><dd>${decisionMark(tool.decision)} ${escapeHtml(decisionPlain[tool.decision] || tool.decision)}</dd></div>
      <div><dt>Main strength</dt><dd>${escapeHtml(first(tool.bestFor))}</dd></div>
      <div><dt>Main weakness</dt><dd>${escapeHtml(first(tool.weaknesses))}</dd></div>
      <div><dt>Risk</dt><dd>${riskMark(tool.riskLevel)} ${escapeHtml(first(tool.risks))}</dd></div>
      <div><dt>Next action</dt><dd>${escapeHtml(tool.implementation || "Define a bounded test.")}</dd></div>
    </dl></article>`).join("");
    openDialog($("#compareDialog"));
  }

  function renderEvidence() {
    $("#evidenceScale").innerHTML = catalog.evidenceLevels.map((level, index) => `<li data-evidence-level="${level.id}" style="--evidence-index:${index}">${evidenceMark(level.id)}<strong class="evidence-proof">Proof gained: ${escapeHtml(level.proof || level.label)}</strong><p>${escapeHtml(level.description)}</p></li>`).join("");
  }

  function renderMethod() {
    const decisionItems = Object.entries(catalog.grading.decisionScale).map(([key, value]) => `<div class="method-item"><strong>${escapeHtml(key)}: ${escapeHtml(decisionPlain[key] || "")}</strong><p>${escapeHtml(value)}</p></div>`).join("");
    $("#methodBody").innerHTML = `<p>Fit identifies a candidate. Evidence shows what was checked. Decision status controls what may happen next. Risk names the conditions that can still stop the work.</p><div class="method-list">${decisionItems}</div>`;
  }

  function populateFilters() {
    $("#groupFilter").insertAdjacentHTML("beforeend", catalog.capabilityGroups.map((group) => `<option value="${group.id}">${escapeHtml(group.label)}</option>`).join(""));
  }

  function ledgerTools() {
    const query = $("#ledgerSearch").value.trim().toLowerCase();
    const group = $("#groupFilter").value;
    const decision = $("#decisionFilter").value;
    const evidence = $("#evidenceFilter").value;
    const sort = $("#sortFilter").value;
    const riskOrder = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
    const filtered = catalog.tools.filter((tool) => {
      if (query && !searchText(tool).includes(query)) return false;
      if (group !== "all" && !groupById.get(group)?.toolIds.includes(tool.id)) return false;
      if (decision !== "all" && tool.decision !== decision) return false;
      if (evidence !== "all" && tool.evidenceLevel !== evidence) return false;
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
    $("#allCount").textContent = `${filtered.length} ${filtered.length === 1 ? "tool" : "tools"}`;
    $("#ledgerRows").innerHTML = shown.map((tool) => `<tr>
      <td data-label="Tool"><strong>${escapeHtml(tool.name)}</strong><span>${escapeHtml(tool.kind)}</span></td>
      <td data-label="Best documented use">${escapeHtml(tool.summary)}</td>
      <td data-label="Evidence">${evidenceMark(tool.evidenceLevel, { label: false })}</td>
      <td data-label="Decision">${decisionMark(tool.decision)}</td>
      <td data-label="Risk">${riskMark(tool.riskLevel)}</td>
      <td data-label="Details"><button class="row-open" type="button" data-open-tool="${tool.id}">Open evidence</button></td>
    </tr>`).join("");
    $("#ledgerEmpty").hidden = filtered.length > 0;
    $("#loadMore").hidden = filtered.length <= state.ledgerLimit;
  }

  function clearFilters() {
    $("#ledgerSearch").value = "";
    $("#groupFilter").value = "all";
    $("#decisionFilter").value = "all";
    $("#evidenceFilter").value = "all";
    $("#sortFilter").value = "name";
    state.ledgerLimit = 16;
    renderLedger();
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
    $("#shareContext").textContent = group ? `This view will keep “${group.label}” and ${state.activeTools.length} matching catalog records.` : "This view opens the complete public research ledger.";
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
      privacy: "Public repository research only. Private source documents and extracted rows are excluded.",
      job: state.group ? groupById.get(state.group) : null,
      query: state.query,
      recommendations: (state.activeTools.length ? state.activeTools.slice(0, 12) : catalog.tools).map((tool) => ({
        id: tool.id, name: tool.name, repository: tool.repoUrl, summary: tool.summary, evidenceLevel: tool.evidenceLevel,
        decision: tool.decision, riskLevel: tool.riskLevel, bestFor: tool.bestFor, weaknesses: tool.weaknesses, risks: tool.risks,
        implementation: tool.implementation, gradeBasis: tool.gradeBasis, publicEvidenceNote: tool.publicEvidenceNote || null
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
    localStorage.setItem("ledger-final-theme", next);
    $("#themeToggle").setAttribute("aria-label", `Switch to ${next === "dark" ? "light" : "dark"} theme`);
  }

  function restoreState() {
    const savedTheme = localStorage.getItem("ledger-final-theme");
    if (savedTheme === "dark" || savedTheme === "light") document.documentElement.dataset.theme = savedTheme;
    else if (matchMedia("(prefers-color-scheme: dark)").matches) document.documentElement.dataset.theme = "dark";
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
    ["ledgerSearch", "groupFilter", "decisionFilter", "evidenceFilter", "sortFilter"].forEach((id) => $("#" + id).addEventListener(id === "ledgerSearch" ? "input" : "change", () => { state.ledgerLimit = 16; renderLedger(); }));
    $("#clearFilters").addEventListener("click", clearFilters);
    $("#loadMore").addEventListener("click", () => { state.ledgerLimit += 16; renderLedger(); });
    document.addEventListener("keydown", (event) => {
      if (event.key === "/" && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) { event.preventDefault(); $("#jobSearch").focus(); }
    });
  }

  renderTasks();
  renderFacts();
  renderPortfolioPulse();
  renderCapabilityMap();
  renderEvidence();
  renderMethod();
  renderProjectTrials();
  populateFilters();
  renderLedger();
  bindEvents();
  restoreState();
})();
