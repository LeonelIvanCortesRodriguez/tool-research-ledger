import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jsonPath = path.join(root, "data", "catalog.json");
const jsPath = path.join(root, "data", "catalog.js");
const catalog = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const batch = "2026-10-26-I";

const sourceNote = "Source review at the pinned revision only. No runtime, benchmark, or static-scan artifact is included in this public record.";
const gradeBasis = "Public source review only; no included runtime, static-scan, or benchmark artifact supports promotion beyond E0.";

function record(input) {
  return {
    batch,
    evidenceLevel: "E0",
    findingStatus: "SOURCE_REVIEWED",
    observedGrade: null,
    gradeBasis,
    publicEvidenceNote: sourceNote,
    ...input
  };
}

const additions = [
  record({
    id: "humanizer", name: "Humanizer", kind: "Editorial agent skill", repoUrl: "https://github.com/blader/humanizer", license: "MIT", sourceRevision: "8c307f367c91bd974002f10f2be2965d642c13df", version: "Source reviewed at 8c307f367c91 on 2026-10-26", primaryCategory: "writing-quality", decision: "CONDITIONAL",
    summary: "An instruction skill for finding and removing common AI-writing habits while preserving the intended meaning.",
    bestFor: ["Final editorial passes", "Reducing formulaic project copy"], weaknesses: ["Style edits can flatten a deliberate voice", "It is guidance rather than an objective authorship detector"], tags: ["writing", "editing", "skill", "human-voice"],
    projectFit: { "writing-quality": "A", "skill-governance": "B" }, impact: { workflow: "B", intelligence: "C", automation: "B", quality: "A" }, riskLevel: "MEDIUM", risks: ["Over-editing can remove nuance", "Untrusted text can influence an agent workflow"],
    implementation: "Use on a copy after factual review. Run NVIDIA SkillSpector against the pinned skill before project-local use, then compare meaning and tone line by line.", reentryTriggers: ["A public handoff needs a final prose pass", "A human reviewer owns the final wording"]
  }),
  record({
    id: "local-ai-workcell", name: "Local AI Workcell", kind: "Local AI operations reference", repoUrl: "https://github.com/LeonelIvanCortesRodriguez/local-ai-workcell", license: "MIT", sourceRevision: "74188caf45eb39430475baccb47a32c53b5abf36", version: "Source reviewed at 74188caf45eb on 2026-10-26", primaryCategory: "local-ai-agent", decision: "PILOT",
    summary: "A public, fictional-data reference for local OCR and multi-process AI workcell experiments with explicit proof boundaries.",
    bestFor: ["Studying local OCR workcell structure", "Reusing public-safe proof patterns"], weaknesses: ["Public fixtures do not represent private production inputs", "The published exercises do not establish general OCR quality"], tags: ["local-ai", "ocr", "workcell", "tesseract", "public-evidence"],
    projectFit: { "local-ai-operations": "A", "ocr-document": "B", "developer-workflow": "B" }, impact: { workflow: "B", intelligence: "B", automation: "B", quality: "B" }, riskLevel: "MEDIUM", risks: ["Demo outcomes may be generalized beyond their scope", "Local topology and private inputs remain outside the public proof"],
    implementation: "Use as a public architecture and evidence reference. Any reuse needs a separate controlled corpus, acceptance criteria, and private-data boundary.", reentryTriggers: ["A local OCR pipeline needs a public-safe reference", "A representative controlled corpus is available"]
  }),
  record({
    id: "tool-research-ledger", name: "Tool Research Ledger", kind: "Evidence-aware research catalog", repoUrl: "https://github.com/LeonelIvanCortesRodriguez/tool-research-ledger", license: "MIT", sourceRevision: "3ef9721a762e66c72f0cacf6944e984330b0a8a6", version: "Baseline source reviewed at 3ef9721a762e on 2026-10-26", primaryCategory: "research-intelligence", decision: "REFERENCE",
    summary: "The public repository for this job-first catalog, its E0 evidence contract, decision states, and shareable static interface.",
    bestFor: ["Tracing the catalog's own method", "Reviewing public proof boundaries"], weaknesses: ["Self-reference is not independent evidence", "Public E0 records omit internal and private artifacts"], tags: ["research", "catalog", "evidence", "dashboard", "self-reference"],
    projectFit: { "repo-intelligence": "A", "research-intelligence": "A", "developer-workflow": "B" }, impact: { workflow: "A", intelligence: "B", automation: "C", quality: "A" }, riskLevel: "LOW", risks: ["Catalog assertions can become circular without external sources", "Self-reported coverage needs automated reconciliation"],
    implementation: "Keep as a reference record only. Treat repository checks and independent audits as the proof for the product, not this entry.", reentryTriggers: ["The public method changes", "A new release needs a coverage reconciliation"]
  }),
  record({
    id: "finanzas-familiares-demo", name: "Finanzas Familiares Demo", kind: "Public financial-control demonstration", repoUrl: "https://github.com/LeonelIvanCortesRodriguez/finanzas-familiares-demo", license: "MIT", sourceRevision: "0b4cd49e9b4eeae92709608ceb16691159f7c75d", version: "Source reviewed at 0b4cd49e9b4e on 2026-10-26", primaryCategory: "financial-audit", decision: "REFERENCE",
    summary: "A fictional-data demonstration of transaction intake, duplicate controls, malformed-row handling, reconciliation, and exception reporting.",
    bestFor: ["Explaining financial-control flow", "Testing public-safe reconciliation examples"], weaknesses: ["Synthetic rows do not prove performance on private statements", "A small demo cannot establish broad accounting coverage"], tags: ["finance", "controls", "reconciliation", "fictional-data", "demo"],
    projectFit: { "audit-finance": "A", "financial-audit": "A", "spreadsheet-engineering": "B" }, impact: { workflow: "B", intelligence: "B", automation: "B", quality: "A" }, riskLevel: "MEDIUM", risks: ["Demo metrics may be mistaken for production assurance", "Financial interpretations still require human review"],
    implementation: "Use only as a public control-pattern reference. Keep real statements and transaction rows outside this repository.", reentryTriggers: ["A public financial-control example is needed", "The example remains fictional and clearly labeled"]
  }),
  record({
    id: "react-three-fiber", name: "React Three Fiber", kind: "React renderer for Three.js", repoUrl: "https://github.com/pmndrs/react-three-fiber", license: "MIT", sourceRevision: "d74622ea8ed717f7212d7e19d65ff3e325508389", version: "Source reviewed at d74622ea8ed7 on 2026-10-26", primaryCategory: "ui-visual", decision: "REFERENCE",
    summary: "A React renderer for Three.js that expresses interactive 3D scenes as reusable React components.",
    bestFor: ["Purposeful spatial visualization", "React-based 3D product experiences"], weaknesses: ["Adds substantial rendering and interaction complexity", "3D can obscure a five-second executive read"], tags: ["react", "threejs", "3d", "webgl", "visualization"],
    projectFit: { "design-quality": "B", "ui-visual": "A" }, impact: { workflow: "C", intelligence: "C", automation: "C", quality: "B" }, riskLevel: "MEDIUM", risks: ["GPU and accessibility costs", "Decorative scenes can weaken information hierarchy"],
    implementation: "Keep as a reference unless a spatial relationship cannot be explained more clearly with native diagrams or charts.", reentryTriggers: ["A tested 3D concept improves comprehension", "A non-3D fallback and performance budget exist"]
  }),
  record({
    id: "vercel-skills", name: "Vercel Labs Skills", kind: "Agent skill library and discovery CLI", repoUrl: "https://github.com/vercel-labs/skills", license: "MIT", sourceRevision: "65d20cb6e3d951434bf408215309bb8aa094135a", version: "Source reviewed at 65d20cb6e3d95 on 2026-10-26", primaryCategory: "skill-governance", decision: "CONDITIONAL",
    summary: "An open collection and CLI for finding and adding agent skills across supported coding-agent environments.",
    bestFor: ["Discovering reusable agent instructions", "Studying skill packaging conventions"], weaknesses: ["A registry increases supply-chain scope", "Skill quality and authority vary by package"], tags: ["skills", "agents", "cli", "discovery", "registry"],
    projectFit: { "skill-governance": "A", "developer-workflow": "B" }, impact: { workflow: "A", intelligence: "B", automation: "A", quality: "B" }, riskLevel: "HIGH", risks: ["Third-party instructions can request broad tools or data", "Filesystem and symlink handling needs confinement"],
    implementation: "Use discovery read-only. Pin a selected skill, inspect its files, run NVIDIA SkillSpector, and approve its authority before any project-local copy.", reentryTriggers: ["A named workflow lacks a local skill", "The selected package has a pinned revision and bounded permissions"]
  }),
  record({
    id: "personaplex", name: "PersonaPlex", kind: "Full-duplex speech-to-speech model", repoUrl: "https://github.com/NVIDIA/personaplex", license: "MIT code; NVIDIA Open Model License weights", sourceRevision: "3428dfd95309a7f3c84fd93259ded0f810d1ff91", version: "Source reviewed at 3428dfd95309 on 2026-10-26", primaryCategory: "local-ai-agent", decision: "WATCH",
    summary: "NVIDIA research code and model assets for real-time full-duplex speech interaction with configurable personas.",
    bestFor: ["Researching responsive voice agents", "Studying persona-controlled speech interaction"], weaknesses: ["Requires separate model-license acceptance", "Compute, audio, and latency requirements exceed this static catalog"], tags: ["voice", "speech", "duplex", "persona", "nvidia", "research"],
    projectFit: { "local-ai-operations": "B", "local-ai-agent": "A", "focus-usability": "B" }, impact: { workflow: "B", intelligence: "A", automation: "B", quality: "B" }, riskLevel: "HIGH", risks: ["Microphone and conversation data are sensitive", "Model terms and compute requirements need separate review"],
    implementation: "Watch only. Consider a disposable, consent-based audio experiment if voice interaction becomes a defined product requirement.", reentryTriggers: ["A voice-agent use case has measurable acceptance criteria", "Audio consent, storage, model terms, and GPU capacity are owned"]
  }),
  record({
    id: "mirofish", name: "MiroFish", kind: "Multi-agent simulation and forecasting system", repoUrl: "https://github.com/666ghj/MiroFish", license: "AGPL-3.0", sourceRevision: "7657031ac01184afe2cb220f5ee3545573b5e843", version: "Source reviewed at 7657031ac011 on 2026-10-26", primaryCategory: "research-intelligence", decision: "WATCH",
    summary: "A swarm-style multi-agent system for exploring simulated scenarios and possible future outcomes.",
    bestFor: ["Scenario exploration research", "Studying multi-agent simulation patterns"], weaknesses: ["Simulated consensus is not real-world prediction", "Outputs can look more certain than their assumptions justify"], tags: ["agents", "simulation", "forecasting", "research", "swarm"],
    projectFit: { "agent-platforms": "B", "research-intelligence": "A" }, impact: { workflow: "C", intelligence: "B", automation: "B", quality: "C" }, riskLevel: "HIGH", risks: ["Forecasts may be mistaken for evidence", "Agent count can expand cost and model exposure"],
    implementation: "Keep outside decision workflows. If revisited, use a historical scenario with blinded outcomes and score calibration, cost, and reproducibility.", reentryTriggers: ["A bounded forecasting research question exists", "A baseline and outcome-scoring protocol are ready"]
  }),
  record({
    id: "huashu-motion", name: "Huashu Motion", kind: "Agent-driven motion graphics toolkit", repoUrl: "https://github.com/alchaincyf/huashu-motion", license: "MIT", sourceRevision: "52467f99c602b76ba86d511d37acdfe93fa1e16e", version: "Source reviewed at 52467f99c602 on 2026-10-26", primaryCategory: "generative-media", decision: "PILOT",
    summary: "A skill, CLI, runtime, studio, and templates for generating motion graphics and narrated video from structured instructions.",
    bestFor: ["Short explanatory motion pieces", "Testing diagram-to-video communication"], weaknesses: ["Requires a recent Node runtime, browser engine, and FFmpeg", "Media pipelines add large dependencies and rendering variability"], tags: ["motion", "video", "animation", "skill", "ffmpeg", "studio"],
    projectFit: { "design-quality": "A", "generative-media": "A", "skill-governance": "B" }, impact: { workflow: "B", intelligence: "C", automation: "A", quality: "A" }, riskLevel: "HIGH", risks: ["Executable skill and media dependencies expand the attack surface", "Generated narration and motion still need factual and accessibility review"],
    implementation: "Run NVIDIA SkillSpector first. Then use a disposable project to render one 20-second evidence-flow clip with no private data and compare comprehension against a static diagram.", reentryTriggers: ["A report needs a short explanatory video", "A storyboard, reduced-motion alternative, and media license checklist exist"]
  }),
  record({
    id: "plasmic", name: "Plasmic", kind: "Visual application and page builder", repoUrl: "https://github.com/plasmicapp/plasmic", license: "MIT", sourceRevision: "bf789c319186c2f28f561ab4826259f0cb84cf55", version: "Source reviewed at bf789c319186 on 2026-10-26", primaryCategory: "ui-visual", decision: "CONDITIONAL",
    summary: "A visual builder and content platform for composing React websites and applications with code components.",
    bestFor: ["Collaborative visual composition", "React products needing marketer-editable pages"], weaknesses: ["Introduces a large platform and content workflow", "This small static catalog does not need a visual CMS"], tags: ["visual-builder", "react", "cms", "design", "components"],
    projectFit: { "design-quality": "B", "ui-visual": "A", "project-management": "B" }, impact: { workflow: "A", intelligence: "C", automation: "B", quality: "B" }, riskLevel: "HIGH", risks: ["Cloud or self-hosted content becomes another governed system", "Generated structure can diverge from the owned design system"],
    implementation: "Use only for a future multi-editor React product with an explicit CMS requirement. Do not migrate the ledger for visual novelty.", reentryTriggers: ["Non-developers need controlled page editing", "Hosting, ownership, export, and rollback are defined"]
  }),
  record({
    id: "openwhispr", name: "OpenWhispr", kind: "Cross-platform speech-to-text application", repoUrl: "https://github.com/OpenWhispr/openwhispr", license: "MIT", sourceRevision: "6408cd9a1081dc4935706fcbba6aaeae1d2cd18d", version: "Source reviewed at 6408cd9a1081 on 2026-10-26", primaryCategory: "focus-usability", decision: "PILOT",
    summary: "A cross-platform dictation application with local transcription and optional bring-your-own-key cloud models.",
    bestFor: ["Hands-free note capture", "Comparing local and cloud dictation"], weaknesses: ["Microphone permissions and audio handling are sensitive", "Transcription quality varies by language, accent, and environment"], tags: ["speech-to-text", "dictation", "local-ai", "desktop", "voice"],
    projectFit: { "office-data": "B", "focus-usability": "A", "local-ai-operations": "B" }, impact: { workflow: "A", intelligence: "C", automation: "B", quality: "B" }, riskLevel: "HIGH", risks: ["Audio or transcripts may contain private information", "Cloud mode sends content to external providers"],
    implementation: "Pilot local-only with synthetic phrases and a permission review. Measure word error, correction time, resource use, and data paths.", reentryTriggers: ["Dictation could reduce repetitive typing", "Local-only mode and deletion behavior are documented"]
  }),
  record({
    id: "crystal", name: "Crystal", kind: "Compiled programming language", repoUrl: "https://github.com/crystal-lang/crystal", license: "Apache-2.0", sourceRevision: "09430c33e7644593ca8d03151437d4f28f090eb0", version: "Source reviewed at 09430c33e764 on 2026-10-26", primaryCategory: "developer-workflow", decision: "REFERENCE",
    summary: "A statically typed compiled language with Ruby-like syntax and native-code performance goals.",
    bestFor: ["Language and compiler study", "Native utilities where Crystal is already selected"], weaknesses: ["No direct capability gap in this JavaScript ledger", "A new language increases maintenance and contributor requirements"], tags: ["language", "compiler", "native", "developer-tools"],
    projectFit: { "development-control": "C", "developer-workflow": "B", "ml-education": "B" }, impact: { workflow: "C", intelligence: "C", automation: "C", quality: "C" }, riskLevel: "MEDIUM", risks: ["Toolchain adoption without a product need", "Smaller ecosystem than current project languages"],
    implementation: "Reference only. Revisit when a workload has measured requirements that current languages cannot meet cleanly.", reentryTriggers: ["A native utility has a documented performance constraint", "The team accepts the toolchain and maintenance cost"]
  }),
  record({
    id: "speakoflow", name: "SpeakoFlow", kind: "Offline dictation and voice assistant", repoUrl: "https://github.com/AbhishekBarali/SpeakoFlow", license: "MIT", sourceRevision: "967857fa5756e03e3bfa74d2ad003848063ba249", version: "Source reviewed at 967857fa5756 on 2026-10-26", primaryCategory: "focus-usability", decision: "PILOT",
    summary: "An offline-oriented dictation and voice-assistant application that can use on-device context and screen reading when requested.",
    bestFor: ["Private dictation experiments", "Voice-assisted desktop workflows"], weaknesses: ["Screen-reading authority needs careful consent", "Accuracy and desktop integration need platform-specific testing"], tags: ["voice", "dictation", "offline", "assistant", "desktop"],
    projectFit: { "office-data": "B", "focus-usability": "A", "local-ai-operations": "B" }, impact: { workflow: "A", intelligence: "B", automation: "B", quality: "B" }, riskLevel: "HIGH", risks: ["Screen and microphone access can expose sensitive material", "Local model and dependency provenance need review"],
    implementation: "Pilot in an isolated desktop account with synthetic content, least-privilege permissions, and a clear indicator whenever screen context is read.", reentryTriggers: ["A voice workflow has a defined time-saving goal", "Permission, storage, and revocation behavior are documented"]
  }),
  record({
    id: "dittofeed", name: "Dittofeed", kind: "Customer engagement automation platform", repoUrl: "https://github.com/dittofeed/dittofeed", license: "MIT", sourceRevision: "91277939a9afcee797ab2562025f6b02d823b00c", version: "Source reviewed at 91277939a9af on 2026-10-26", primaryCategory: "automation", decision: "WATCH",
    summary: "A customer engagement platform for event-driven email, SMS, push, messaging, and lifecycle journeys.",
    bestFor: ["Product messaging orchestration", "Studying event-driven communication journeys"], weaknesses: ["Far outside the current static research workflow", "Needs databases, providers, consent, and deliverability operations"], tags: ["messaging", "email", "sms", "automation", "customer-data"],
    projectFit: { "development-control": "C", automation: "A", "project-management": "B" }, impact: { workflow: "A", intelligence: "B", automation: "A", quality: "B" }, riskLevel: "HIGH", risks: ["Contact and behavioral data become regulated assets", "Outbound errors can affect real people at scale"],
    implementation: "Watch only. Revisit for a separate product with consent records, suppression controls, provider ownership, and non-production fixtures.", reentryTriggers: ["A real customer-messaging requirement exists", "Privacy, consent, and deliverability owners are named"]
  }),
  record({
    id: "dimensional-drawing", name: "Dimensional Drawing", kind: "Diagram and motion agent skills", repoUrl: "https://github.com/enesozturk/dimensional-drawing", license: "MIT", sourceRevision: "5c457437c8c83524308aad3b7443e81adcc13153", version: "Source reviewed at 5c457437c8c8 on 2026-10-26", primaryCategory: "ui-visual", decision: "PILOT",
    summary: "Two agent skills for creating dimensional diagrams and motion-oriented visual explanations.",
    bestFor: ["Executive system maps", "Testing static-to-motion explanation"], weaknesses: ["A small, young repository offers limited operating history", "Visual output still needs accessibility and factual review"], tags: ["diagram", "motion", "skill", "visualization", "3d"],
    projectFit: { "design-quality": "A", "skill-governance": "B", "ui-visual": "A" }, impact: { workflow: "B", intelligence: "C", automation: "B", quality: "A" }, riskLevel: "HIGH", risks: ["Skill instructions may request broad generation tools", "Depth effects can reduce clarity when overused"],
    implementation: "Run NVIDIA SkillSpector against both pinned skill bundles. If accepted, compare one evidence-flow diagram with the current flat version using timed comprehension.", reentryTriggers: ["A complex flow needs a stronger visual hierarchy", "A static accessible alternative remains available"]
  }),
  record({
    id: "word-atlas", name: "Word Atlas", kind: "Interactive vocabulary visualization", repoUrl: "https://github.com/designfuchen/word-atlas", license: "MIT application; CC BY 4.0 dataset and media", sourceRevision: "e7b44629230a470e6b664826ced4af2c367b44c2", version: "Source reviewed at e7b44629230a on 2026-10-26", primaryCategory: "ui-visual", decision: "REFERENCE",
    summary: "An interactive WebGL vocabulary atlas that maps thousands of IELTS words into a spatial learning experience.",
    bestFor: ["Studying spatial knowledge navigation", "Visual inspiration for semantic collections"], weaknesses: ["The subject and interaction do not match the tool ledger", "AI-assisted content is not fully manually reviewed"], tags: ["webgl", "vocabulary", "learning", "visualization", "atlas"],
    projectFit: { "design-quality": "B", "knowledge-research": "B", "ui-visual": "A" }, impact: { workflow: "C", intelligence: "B", automation: "C", quality: "B" }, riskLevel: "MEDIUM", risks: ["Dataset attribution must be preserved", "Spatial novelty can impede scanning and accessibility"],
    implementation: "Use as visual research only. Borrow no content or media without preserving the relevant attribution and license.", reentryTriggers: ["A semantic map is more useful than search and filters", "Keyboard, reduced-motion, and low-power fallbacks are defined"]
  }),
  record({
    id: "strata", name: "Strata", kind: "Local model inference engine", repoUrl: "https://github.com/Niko1221/Strata", license: "MIT", sourceRevision: "4b9e05a2a806a3fe24f7b2560d98626c37dade35", version: "Source reviewed at 4b9e05a2a806 on 2026-10-26", primaryCategory: "model-routing", decision: "PILOT",
    summary: "A local inference engine and API aimed at running language models on consumer hardware.",
    bestFor: ["Local model serving experiments", "Comparing consumer-hardware inference"], weaknesses: ["Model quality and speed depend on hardware and quantization", "Downloads and local servers add storage and access concerns"], tags: ["local-ai", "inference", "models", "api", "consumer-hardware"],
    projectFit: { "local-ai-operations": "A", "model-routing": "A", "local-ai-agent": "B" }, impact: { workflow: "B", intelligence: "A", automation: "A", quality: "B" }, riskLevel: "HIGH", risks: ["Model files and serving ports need provenance and access controls", "Resource contention can disrupt other local workloads"],
    implementation: "Pilot on a disposable public prompt set with one pinned model. Record memory, latency, output quality, server exposure, cleanup, and comparison with the current runtime.", reentryTriggers: ["Local inference reduces a measured privacy or cost constraint", "A pinned model and hardware budget are available"]
  }),
  record({
    id: "context-attachment-manager", name: "Context Attachment Manager", kind: "Image-context and attachment manager", repoUrl: "https://github.com/chipfighter/context-attachment-manager", license: "MIT", sourceRevision: "dc2561c37d64da88e582fa72ab66bae06398c507", version: "Source reviewed at dc2561c37d64 on 2026-10-26", primaryCategory: "developer-workflow", decision: "PILOT",
    summary: "A plugin and MCP-oriented workflow for retaining, finding, and reusing image attachments across long AI conversations.",
    bestFor: ["Image-heavy audit conversations", "Recovering visual context across long sessions"], weaknesses: ["Attachment indexing can expose sensitive images", "It overlaps with native conversation and file-management features"], tags: ["attachments", "images", "context", "mcp", "plugin"],
    projectFit: { "development-control": "B", "developer-workflow": "A", "knowledge-management": "B" }, impact: { workflow: "A", intelligence: "B", automation: "B", quality: "B" }, riskLevel: "HIGH", risks: ["Image history may contain personal or confidential data", "MCP access broadens the retrievable context surface"],
    implementation: "Run NVIDIA SkillSpector where applicable. Pilot only with synthetic images in a separate profile and verify indexing scope, deletion, and retrieval boundaries.", reentryTriggers: ["Visual context loss is a repeated measured problem", "A synthetic fixture and deletion test are ready"]
  }),
  record({
    id: "browsentic", name: "Browsentic", kind: "Browser automation harness", repoUrl: "https://github.com/imshaikot/browsentic", license: "Apache-2.0", sourceRevision: "f323a0d55bf170b7c5ecd89b20d6763e5fdb97da", version: "Source reviewed at f323a0d55bf1 on 2026-10-26", primaryCategory: "automation", decision: "HOLD",
    summary: "A browser harness, extension, and MCP surface that can operate supported browsers using an existing user session.",
    bestFor: ["Studying browser-agent control patterns", "Future isolated browser automation research"], weaknesses: ["It can inherit access from a signed-in browser profile", "The current workflow already has bounded browser controls"], tags: ["browser", "automation", "mcp", "extension", "agents"],
    projectFit: { "agent-platforms": "B", automation: "A", "security-assurance": "B" }, impact: { workflow: "A", intelligence: "B", automation: "A", quality: "B" }, riskLevel: "CRITICAL", risks: ["A logged-in browser can expose sessions, accounts, and data", "Autonomous actions can create external side effects"],
    implementation: "Keep on HOLD. Any future evaluation needs a disposable browser profile, synthetic accounts, domain allowlists, read-only tasks, and no personal session reuse.", reentryTriggers: ["A browser task cannot be handled by the bounded existing controls", "A disposable environment and external-action gate are available"]
  }),
  record({
    id: "omniget", name: "Omniget", kind: "Multi-site media downloader", repoUrl: "https://github.com/OpenSelena/omniget", license: "GPL-3.0", sourceRevision: "617b59ed62fd99aadf6c5e218089642244090939", version: "Source reviewed at 617b59ed62fd on 2026-10-26", primaryCategory: "file-processing", decision: "REJECT",
    summary: "A downloader for courses, video, music, and other media across a large number of websites.",
    bestFor: ["Authorized personal-media retrieval research"], weaknesses: ["No capability gap in the research ledger", "Site terms and content rights vary widely"], tags: ["download", "media", "courses", "video", "cli"],
    projectFit: { "office-data": "C", "file-processing": "B" }, impact: { workflow: "C", intelligence: "C", automation: "B", quality: "C" }, riskLevel: "HIGH", risks: ["Use can conflict with rights or site terms", "Wide extractor scope increases maintenance and network exposure"],
    implementation: "Reject for this project. Use official export or download paths for content the user is authorized to retain.", reentryTriggers: ["A lawful archival requirement cannot use an official path", "Rights and terms are reviewed for the exact source"]
  }),
  record({
    id: "atomic-agents", name: "Atomic Agents", kind: "Composable agent framework", repoUrl: "https://github.com/Eigenwise/atomic-agents", license: "MIT", sourceRevision: "14cf8eb65d84b6614e99980b4cefefc98e2f5b05", version: "Source reviewed at 14cf8eb65d84 on 2026-10-26", primaryCategory: "local-ai-agent", decision: "REFERENCE",
    summary: "A modular framework for composing small, typed agent components, tools, memory, and provider integrations.",
    bestFor: ["Studying explicit agent composition", "Building a bounded typed agent prototype"], weaknesses: ["Adds another framework to an already capable environment", "Tools and provider integrations expand authority and cost"], tags: ["agents", "framework", "typed", "tools", "skills"],
    projectFit: { "agent-platforms": "B", "local-ai-agent": "A", "skill-governance": "B" }, impact: { workflow: "B", intelligence: "B", automation: "A", quality: "B" }, riskLevel: "HIGH", risks: ["Tool-enabled agents need explicit permission boundaries", "Provider credentials and prompts may leave the host"],
    implementation: "Reference the composition patterns. Run NVIDIA SkillSpector on bundled skill material before any reuse; avoid framework adoption without a missing capability.", reentryTriggers: ["A small typed agent prototype has a clear owner", "Authority, provider, budget, and rollback are bounded"]
  }),
  record({
    id: "liquid-glass-js", name: "Liquid Glass JS", kind: "Web visual-effect library", repoUrl: "https://github.com/dashersw/liquid-glass-js", license: "MIT", sourceRevision: "78cb6ccb0b9987bb60a88b14ccbd13a9e6e8ab2a", version: "Source reviewed at 78cb6ccb0b99 on 2026-10-26", primaryCategory: "ui-visual", decision: "REJECT",
    summary: "A JavaScript implementation of an Apple-inspired liquid-glass visual effect for web interfaces.",
    bestFor: ["Small decorative experiments"], weaknesses: ["Does not improve research decisions or evidence", "Transparency and distortion can reduce contrast and performance"], tags: ["glass", "visual-effect", "javascript", "ui"],
    projectFit: { "design-quality": "C", "ui-visual": "B" }, impact: { workflow: "C", intelligence: "C", automation: "C", quality: "C" }, riskLevel: "MEDIUM", risks: ["Readability can fall in light and dark themes", "Rendering cost may outweigh the effect"],
    implementation: "Reject for the ledger. Preserve the restrained, evidence-first visual system and use native contrast-safe surfaces.", reentryTriggers: ["A branded marketing surface, not a data view, needs the effect", "Contrast and performance budgets are met"]
  }),
  record({
    id: "chandra", name: "Chandra", kind: "Document OCR and understanding model", repoUrl: "https://github.com/datalab-to/chandra", license: "Apache-2.0 repository; model terms require separate review", sourceRevision: "b20d54d94e53b32211c98408620edef63e99a4ec", version: "Source reviewed at b20d54d94e53 on 2026-10-26", primaryCategory: "ocr-document", decision: "PILOT",
    summary: "A document OCR model aimed at complex layouts, tables, forms, handwriting, and structured extraction.",
    bestFor: ["Complex statement extraction research", "Comparing OCR on tables and forms"], weaknesses: ["Model resources and hardware needs may be substantial", "Repository and model terms must be reviewed separately"], tags: ["ocr", "documents", "tables", "forms", "handwriting", "model"],
    projectFit: { "document-intelligence": "A", "ocr-document": "A", "audit-finance": "B" }, impact: { workflow: "A", intelligence: "A", automation: "A", quality: "A" }, riskLevel: "HIGH", risks: ["Financial extraction errors can look plausible", "Private statements require isolated handling and row-level adjudication"],
    implementation: "Run a controlled benchmark on the approved statement with preserved row-level truth: dates, amounts, signs, fused rows, omissions, and false acceptances. Compare against OCRmyPDF and PaddleOCR.", reentryTriggers: ["A representative truth set is available", "Model terms, hardware, privacy, and cleanup are approved"]
  }),
  record({
    id: "oxr", name: "OXR", kind: "Vision-language OCR system", repoUrl: "https://github.com/SoMarkAI/OXR", license: "OXR Open Source License with additional terms", sourceRevision: "c1a1dcb312ee9f691404f127785510453c0d9350", version: "Source reviewed at c1a1dcb312ee on 2026-10-26", primaryCategory: "ocr-document", decision: "PILOT",
    summary: "A GPU-oriented vision-language OCR stack for extracting text and structure from documents and images.",
    bestFor: ["High-complexity OCR experiments", "Comparing vision-language extraction with conventional OCR"], weaknesses: ["Local use targets Linux and high-memory NVIDIA hardware", "Its custom license and service stack need legal and operational review"], tags: ["ocr", "vision-language", "gpu", "documents", "docker"],
    projectFit: { "document-intelligence": "A", "ocr-document": "A", "local-ai-operations": "B" }, impact: { workflow: "A", intelligence: "A", automation: "A", quality: "A" }, riskLevel: "HIGH", risks: ["Custom license terms may constrain use", "Service and GPU requirements increase operational scope", "Benchmark claims do not replace local row-level adjudication"],
    implementation: "Review the custom license first. If acceptable, benchmark the approved statement with the same row-level truth and failure taxonomy used for Chandra, OCRmyPDF, and PaddleOCR.", reentryTriggers: ["License and hardware review are complete", "A private, reproducible benchmark environment is available"]
  }),
  record({
    id: "claude-obsidian", name: "Claude Obsidian", kind: "Obsidian and coding-agent knowledge workflow", repoUrl: "https://github.com/AgriciDaniel/claude-obsidian", license: "MIT", sourceRevision: "2e545563172f97f02ecaaaab376ceea1246a0583", version: "Source reviewed at 2e545563172f on 2026-10-26", primaryCategory: "knowledge-management", decision: "CONDITIONAL",
    summary: "A public Markdown knowledge-graph workflow connecting an Obsidian vault with a coding agent and reusable instructions.",
    bestFor: ["Local Markdown knowledge organization", "Studying agent-assisted second-brain patterns"], weaknesses: ["Vault-wide access can expose unrelated notes", "It overlaps with existing project documentation and search"], tags: ["obsidian", "knowledge", "markdown", "skill", "second-brain"],
    projectFit: { "knowledge-research": "A", "knowledge-management": "A", "skill-governance": "B" }, impact: { workflow: "A", intelligence: "B", automation: "B", quality: "B" }, riskLevel: "HIGH", risks: ["A vault can mix personal, project, and confidential material", "Agent rewrites may damage links or provenance"],
    implementation: "Run NVIDIA SkillSpector first. If needed, pilot in a synthetic vault with read-only search before allowing writes or access to personal notes.", reentryTriggers: ["Knowledge fragmentation is measured", "Vault scope, backup, deletion, and write approvals are defined"]
  }),
  record({
    id: "obsidian-second-brain", name: "Obsidian Second Brain", kind: "Multi-agent persistent memory system", repoUrl: "https://github.com/eugeniughelbur/obsidian-second-brain", license: "MIT", sourceRevision: "58ca891156088635b4c28615d71a7842a8ca3143", version: "Source reviewed at 58ca89115608 on 2026-10-26", primaryCategory: "knowledge-management", decision: "HOLD",
    summary: "A persistent Obsidian-based memory and coordination system for multiple AI agents, shared logs, commands, search, and scheduled work.",
    bestFor: ["Studying multi-agent memory architecture", "Understanding shared agent logbooks"], weaknesses: ["Its broad command and memory model exceeds this project's needs", "Self-rewriting and scheduled agents increase governance complexity"], tags: ["obsidian", "memory", "agents", "knowledge", "automation", "skills"],
    projectFit: { "knowledge-research": "B", "knowledge-management": "A", "agent-platforms": "B" }, impact: { workflow: "A", intelligence: "A", automation: "A", quality: "B" }, riskLevel: "HIGH", risks: ["Persistent shared memory can retain sensitive content", "Scheduled and self-modifying behavior needs strong change control"],
    implementation: "Keep on HOLD. Run NVIDIA SkillSpector before any experiment; use only a synthetic vault with schedules disabled and immutable backups.", reentryTriggers: ["Multiple agents need durable shared context beyond current tools", "Retention, permissions, backups, and human approval are explicit"]
  })
];

const existing = new Map(catalog.tools.map((tool) => [tool.id, tool]));
for (const item of additions) {
  if (existing.has(item.id)) Object.assign(existing.get(item.id), item);
  else {
    catalog.tools.push(item);
    existing.set(item.id, item);
  }
}

const refresh = {
  codeburn: ["6489d5e4e52e86a2897b48b4a8ec56e392ed7072", "Source refreshed at 6489d5e4e52e on 2026-10-26"],
  "open-duet": ["743d01453e8cd5dff319078ed7182e9672236637", "Source refreshed at 743d01453e8c on 2026-10-26"],
  "react-bits": ["e12c22192ac7b4b452c5e2feb9b586d74765d696", "Source refreshed at e12c22192ac7 on 2026-10-26"],
  plane: ["a9e70360c5bc5b1beb5f70fe4c2fa765743147ec", "Source refreshed at a9e70360c5bc on 2026-10-26"],
  berth: ["97f918afa9ba437cf6efbfb7ca492ef6a5786247", "Source refreshed at 97f918afa9ba on 2026-10-26"],
  "swe-af": ["4d3dfe719e5ce9e2e8cd454722295bbe6512542f", "Source refreshed at 4d3dfe719e5c on 2026-10-26"],
  "diagram-design": ["97d795138448f6a739a0cebc3d9beb37a42077f1", "Source refreshed at 97d795138448 on 2026-10-26"]
};
for (const [id, [revision, version]] of Object.entries(refresh)) {
  const item = catalog.tools.find((tool) => tool.id === id);
  if (!item) throw new Error(`Missing refresh target: ${id}`);
  Object.assign(item, { batch, sourceRevision: revision, version, evidenceLevel: "E0", findingStatus: "SOURCE_REVIEWED", observedGrade: null, gradeBasis, publicEvidenceNote: sourceNote });
}

const groupAdds = {
  "document-intelligence": ["chandra", "oxr"],
  "audit-finance": ["finanzas-familiares-demo"],
  "design-quality": ["react-three-fiber", "huashu-motion", "plasmic", "dimensional-drawing", "word-atlas", "liquid-glass-js"],
  "skill-governance": ["humanizer", "vercel-skills"],
  "repo-intelligence": ["tool-research-ledger"],
  "development-control": ["crystal", "context-attachment-manager", "dittofeed"],
  "office-data": ["openwhispr", "speakoflow", "omniget"],
  "agent-platforms": ["mirofish", "browsentic", "atomic-agents"],
  "knowledge-research": ["claude-obsidian", "obsidian-second-brain"],
  "local-ai-operations": ["local-ai-workcell", "personaplex", "strata"]
};
for (const [groupId, ids] of Object.entries(groupAdds)) {
  const group = catalog.capabilityGroups.find((item) => item.id === groupId);
  if (!group) throw new Error(`Missing capability group: ${groupId}`);
  group.toolIds = [...new Set([...group.toolIds, ...ids])];
}

catalog.meta.updated = "2026-10-26";
catalog.meta.batchId = "REPO-BATCH-2026-10-26-I";
catalog.meta.currentBatchKey = batch;
catalog.meta.currentBatchReviewed = 33;
catalog.meta.currentBatchNote = "Twenty-six omissions were added and seven resubmitted records were refreshed. All 99 GitHub repositories shared in the research thread are represented as E0 source reviews.";
catalog.meta.scope = "A 99-repository public source-review ledger. Application checks are reproducible, while third-party tool claims remain E0 until public-safe proof is included.";
catalog.meta.repositoryCoverage = { expected: 99, represented: 99, missing: 0, duplicateUrls: 0, reconciledAt: "2026-10-26" };
if (!catalog.meta.reports.some((item) => item.relativePath === "docs/BATCH_2026-10-26-I.md")) {
  catalog.meta.reports.push({ label: "Repository reconciliation batch", relativePath: "docs/BATCH_2026-10-26-I.md", kind: "99-repository coverage, source-review decisions, and next tests" });
}

const serialized = `${JSON.stringify(catalog, null, 2)}\n`;
fs.writeFileSync(jsonPath, serialized);
fs.writeFileSync(jsPath, `window.CATALOG = ${serialized.trimEnd()};\n`);
console.log(`BATCH_I_APPLIED additions=${additions.length} refreshed=${Object.keys(refresh).length} tools=${catalog.tools.length}`);
