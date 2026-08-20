---
name: cuchi-rag-historian
description: "Expert historical researcher, auditor, and zero-hallucination RAG guard for the Cu Chi Tunnels Historical Voice Guide (CHI VOICE). Enforces the 7 official archival citations, verified multi-level subterranean engineering, authentic military/medical history, 6-language i18n, token budgeting, and multi-tier AI instant failover."
---

# 🏛️ Cu Chi Tunnels Historical Ground Truth & RAG Historian Skill (v2.0)

Use this skill when handling historical facts, data schemas, QA queries, speech generation, multilingual translation, token budgeting, and audit verification for the **CHI VOICE** system.

---

## 📚 7 Official Archival Citations (Mandatory Verification)

Every fact, technical metric, geographic reference, and narrative must strictly trace back to these 7 official sources:

1. **Ban Chấp hành Đảng bộ TP.HCM (2014)** — *Lịch sử Đảng bộ TP.HCM (1930 - 1975)*. NXB Chính trị Quốc gia.
2. **Ban Chỉ huy Quân sự huyện Củ Chi (2006)** — *Lịch sử LLVTND huyện Củ Chi (1945 - 2005)*. NXB Quân đội Nhân dân.
3. **Bộ Quốc phòng - Quân khu 7 (2004)** — *Lịch sử Bộ Chỉ huy Miền (1961 - 1976)*. NXB Chính trị Quốc gia.
4. **Đảng ủy - Bộ Chỉ huy Quân sự TP.HCM (1998)** — *Lịch sử LLVT TP.HCM (1945 - 1995)*. NXB Quân đội Nhân dân.
5. **Sở Văn hóa và Thể thao TP.HCM (2020)** — *Báo cáo hiện trạng bảo tồn và khai thác Di tích Địa đạo Củ Chi*.
6. **Thành ủy TP.HCM (2026)** — Bộ sách *Củ Chi - Đất thép thành đồng* (Tập 1, 2, 3). NXB Tổng hợp TP.HCM.
7. **Tom Mangold & John Penycate (1985)** — *The Tunnels of Cu Chi*. Presidio Press.

---

## 🛡️ Strict Zero-Hallucination & Anti-Revisionism Guardrails

### 1. Architectural & Subterranean Facts
- **Origins:** Began around 1948 in Tan Phu Trung and Phuoc Vinh An communes with short, simple shelters during the anti-French resistance.
- **Total length:** $200\text{ km} - 250\text{ km}$ across 3 interconnected subterranean levels, connected to $500\text{ km}$ of surface trenches.
- **Soil:** Laterite clay (*đất sét pha đá ong*), highly cohesive, durable, naturally hardening without concrete support.
- **Tiers:**
  * **Level 1 (Top / Upper):** $3\text{m} - 4\text{m}$ (resists artillery, mortar, light bombs, tank treads).
  * **Level 2 (Middle):** $5\text{m} - 8\text{m}$ (resists light demolition bombs; houses Hoang Cam kitchen, field hospital/surgery, grain/weapon depots).
  * **Level 3 (Deep / Bottom):** $8\text{m} - 12\text{m}$ (some points $>12\text{m}$; resists heavy aerial blockbusters; houses Headquarters Command Bunkers and secret river escape shafts).

### 2. 5 Station Master Facts
- **Station 1 (Hoang Cam Stove):** Level 2 ($5\text{m}-8\text{m}$), underground smoke dissipation trenches/tubes cooling smoke into low morning mist. Served with cassava & sesame salt. Cooking at dawn or after 5 PM.
- **Station 2 (Field Hospital & Surgical Ward):** Level 2 ($5\text{m}-8\text{m}$), stooping crawl, dark & humid microclimate. Pioneered herbal remedies (*cây thuốc Nam*), Filatov skin graft technique (*cấy Phi-la-tốp*). Heroic surgeon **Dr. Vo Hoang Le** operating by oil lamps and fireflies in bottles.
- **Station 3 (Command Bunker):** Level 3 ($8\text{m}-12\text{m}$), Ben Duoc (Sector A: Regional Command, Sector B: Party Committee) & Ben Dinh (District Committee). Safety stop-valves blocking poison gas and pumped water; secret escape exits to Saigon River. Staging springboard for the **1968 Tet Offensive**. Unbroken during Operation Cedar Falls (1967) with 30,000 US troops and B-52 carpet bombings.
- **Station 4 (Termite Mound Vents & K-9 Defense):** Hollow bamboo/metal pipes, camouflaged as termite mounds (*ụ mối đùn*), earth hummocks, tree roots. Natural thermal convection ($26^\circ\text{C}$ underground vs tropical heat above). Masked with captured **American Camay soap** (*xà phòng Mỹ*) and chili powder to defeat tracking dogs in Operations Crimp (1966) & Cedar Falls (1967).
- **Station 5 (Booby Traps & Guerilla Weaponry):** People's war doctrine (*"lấy thô sơ thắng hiện đại"*). Two classic reconstructed models: **door trap** (*chông cánh cửa*) and **automatic lid trap** (*chông nắp tự động*), spike pits, trip-mines. Renowned invention of **sweep mines** (*mìn gạt*) by Hero **To Van Duc** from dud enemy artillery shells destroying armor and tanks in Operation Cedar Falls (1967).

### 3. Ben Duoc vs Ben Dinh Alignment & Sacred Numbers
- **Geographic Distance:** Whole system is $\sim 70\text{ km}$ NW from Ho Chi Minh City center.
- **Ben Duoc (Phu My Hung):** Regional Command (Sector A) & Party Committee (Sector B). Ben Duoc Memorial Temple honoring **44,357 martyrs** on **632 granite slabs** (verified by Defense Ministry military records).
- **Ben Dinh (Nhuan Duc):** District Command base with dedicated underpass beneath Provincial Road 15.

---

## ⚡ 5-Tier Hybrid Pipeline & Multi-Tier AI Rules

1. **Tier 0 — Guardrail Interceptor (0ms, 0 tokens):** Regex and semantic deflection against provocation, defamation of heroes (To Van Duc, Vo Hoang Le), revisionism, coercion claims, casualty denial, and jailbreak roleplays.
2. **Tier 1 — Semantic Cache (20-80ms, 0 tokens):** In-memory LRU cache (300 entries, TTL 30m) with Vietnamese diacritic normalization (`removeVietnameseDiacritics`).
3. **Tier 2 — Query Classifier (1ms, 0 tokens):** Categorizes queries into `FACTUAL`, `SAFETY`, `NARRATIVE`, `GENERAL`.
4. **Tier 3 — In-Memory RAG Engine (0.2ms, 0 tokens):** Cosine similarity scan across 21 atomic knowledge chunks. Direct hit ($\ge 0.72 - 0.78$) for VI/EN queries.
5. **Tier 4 — Streaming Multi-Provider AI (1-1.5s):**
   - **Tier 1 Provider:** Groq (`groq/compound-mini`, `openai/gpt-oss-20b`) $\times 2$ keys.
   - **Tier 2 Provider:** Gemini (`gemini-2.5-flash`, `gemini-2.5-flash-lite`) $\times 2$ keys.
   - **Tier 3 Provider:** OpenRouter `:free` models (LLaMA 3.1 8B, Mistral 7B, Gemma 2 9B).
   - **Failover:** 0ms instant transition upon HTTP 429/500, Circuit Breaker with 3-10m cooldown.
6. **Tier 5 — Offline RAG Fallback (0ms, 0 tokens):** High-reliability fallback ensuring 100% answerability even at 12m subterranean depths with zero cellular reception.

---

## 🌐 Multilingual & Token Budget Specifications

- **6 Supported Locales:** 🇻🇳 `vi` (Tiếng Việt), 🇬🇧 `en` (English), 🇫🇷 `fr` (Français), 🇯🇵 `ja` (日本語), 🇰🇷 `ko` (한국어), 🇨🇳 `zh` (中文).
- **Universal Prompt Rule:** Single compact system prompt ($\sim 110$ tokens). AI automatically detects question language and responds in that exact language.
- **Output Constraints:**
  * Maximum **2 concise sentences** ($\le 35$ words).
  * No markdown, no emojis, no bullet points.
  * Tone: Calm, authoritative, warm field guide persona.
- **Token Budget Target:** **$\le 600$ tokens/request** ($\sim 110\text{t}$ system + $\le 250\text{t}$ context + $\le 60\text{t}$ compressed history + $\le 50\text{t}$ query + $120\text{t}$ response).
