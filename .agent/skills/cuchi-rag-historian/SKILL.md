---
name: cuchi-rag-historian
description: "Expert historical researcher, auditor, and zero-hallucination RAG guard for the Cu Chi Tunnels Historical Voice Guide (CHI VOICE). Enforces the 7 official archival citations, verified multi-level subterranean engineering, and authentic military/medical history."
---

# 🏛️ Cu Chi Tunnels Historical Ground Truth & RAG Historian Skill

Use this skill when handling historical facts, data schemas, QA queries, speech generation, and audit verification for the **CHI VOICE** system.

---

## 📚 7 Official Archival Citations (Mandatory Verification)

Every fact, technical metric, geographic reference, and narrative must trace back to these 7 sources:

1. **Ban Chấp hành Đảng bộ TP.HCM (2014)** — *Lịch sử Đảng bộ TP.HCM (1930 - 1975)*. NXB Chính trị Quốc gia.
2. **Ban Chỉ huy Quân sự huyện Củ Chi (2006)** — *Lịch sử LLVTND huyện Củ Chi (1945 - 2005)*. NXB Quân đội Nhân dân.
3. **Bộ Quốc phòng - Quân khu 7 (2004)** — *Lịch sử Bộ Chỉ huy Miền (1961 - 1976)*. NXB Chính trị Quốc gia.
4. **Đảng ủy - Bộ Chỉ huy Quân sự TP.HCM (1998)** — *Lịch sử LLVT TP.HCM (1945 - 1995)*. NXB Quân đội Nhân dân.
5. **Sở Văn hóa và Thể thao TP.HCM (2020)** — *Báo cáo hiện trạng bảo tồn và khai thác Di tích Địa đạo Củ Chi*.
6. **Thành ủy TP.HCM (2026)** — Bộ sách *Củ Chi - Đất thép thành đồng* (Tập 1, 2, 3). NXB Tổng hợp TP.HCM.
7. **Tom Mangold & John Penycate (1985)** — *The Tunnels of Cu Chi*. Presidio Press.

---

## 🛡️ Strict Zero-Hallucination Ground Truth Guardrails

### 1. Architectural & Subterranean Facts
- **Origins:** Began around 1948 in Tan Phu Trung and Phuoc Vinh An communes with short, simple shelters during the anti-French resistance.
- **Total length:** $200\text{ km} - 250\text{ km}$ across 3 interconnected subterranean levels.
- **Soil:** Laterite clay (*đất sét pha đá ong*), highly cohesive, durable, non-caving.
- **Tiers:**
  * **Level 1 (Top / Upper):** $3\text{m} - 4\text{m}$ (resists artillery, mortar, light bombs).
  * **Level 2 (Middle):** $5\text{m} - 8\text{m}$ (resists light demolition bombs; houses Hoang Cam kitchen, field hospital/surgery, grain/weapon depots).
  * **Level 3 (Deep / Bottom):** $8\text{m} - 12\text{m}$ (some points $>12\text{m}$; resists heavy aerial blockbusters; houses Headquarters Command Bunkers).

### 2. 5 Station Master Facts
- **Station 1 (Hoang Cam Stove):** Level 2 ($5\text{m}-8\text{m}$), underground smoke dissipation trenches/tubes cooling smoke into low morning mist. Served with cassava & sesame salt.
- **Station 2 (Field Hospital & Surgical Ward):** Level 2 ($5\text{m}-8\text{m}$), stooping crawl, dark & humid microclimate. Pioneered herbal remedies (*cây thuốc Nam*), Filatov tissue implantation (*cấy Phi-la-tốp*). Heroic surgeon **Dr. Vo Hoang Le**.
- **Station 3 (Command Bunker):** Level 3 ($8\text{m}-12\text{m}$), Ben Duoc (Sector A: Regional Command, Sector B: Party Committee) & Ben Dinh (District Committee). Safety stop-valves blocking poison gas and pumped water; secret escape exits to Saigon River. Staging springboard for the **1968 Tet Offensive**.
- **Station 4 (Termite Mound Vents & K-9 Defense):** Hollow bamboo/metal pipes, camouflaged as termite mounds (*ụ mối đùn*), earth hummocks, tree roots. Natural thermal convection. Masked with captured **American soap** (*xà phòng Mỹ*) to defeat tracking dogs in Operations Crimp (1966) & Cedar Falls (1967).
- **Station 5 (Booby Traps & Guerilla Weaponry):** People's war doctrine (*"lấy thô sơ thắng hiện đại"*). Two classic reconstructed models: **door trap** (*chông cánh cửa*) and **automatic lid trap** (*chông nắp tự động*), spike pits, trip-mines. Renowned invention of **sweep mines** (*mìn gạt*) by Hero **To Van Duc** from dud enemy artillery shells destroying armor and tanks in Operation Cedar Falls (1967).

### 3. Ben Duoc vs Ben Dinh Alignment
- **Geographic Distance:** Whole system is $\sim 70\text{ km}$ (or $69\text{ km}$ NW) from Ho Chi Minh City center.
- **Ben Duoc (Phu My Hung):** Regional Command (Sector A) & Party Committee (Sector B). Ben Duoc Memorial Temple with 9-story tower ($39\text{m}$) honoring **44,357 martyrs** on **632 granite slabs**.
- **Ben Dinh (Nhuan Duc):** District Command base with dedicated underpass beneath Provincial Road 15 (*đường hầm đi bộ ngầm ngang qua Tỉnh lộ 15*).

---

## ⚡ Output Formatting for Voice & UI
- When generating voice scripts: Max 2 concise sentences ($\le 35$ words), no Markdown symbols (`*`, `#`, `_`), convert numbers to natural speech words (e.g. `250 ki-lô-mét`).
- When user query similarity $< 0.78$ or outside scope: Return polite refusal: *"Xin lỗi quý khách, thông tin này chưa có trong tư liệu chính thức của Ban Quản Lý Di Tích."* / *"I apologize, this detail is not available in our official historical records."*
