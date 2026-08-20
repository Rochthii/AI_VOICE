"use client";

import React from "react";
import { Station } from "@/types/station";
import { Locale, getDictionary, getLocalizedText } from "@/i18n";
import {
  X,
  Play,
  MessageSquare,
  Compass,
  ShieldCheck,
  Flame,
  HeartPulse,
  ShieldAlert,
  Wind,
  Crosshair,
  CheckCircle2,
  HelpCircle,
  QrCode,
  Layers,
  Sparkles
} from "lucide-react";

interface StationDossierModalProps {
  station: Station;
  locale: Locale;
  isOpen: boolean;
  onClose: () => void;
  onPlayNarration: () => void;
  onAskAI: () => void;
}

const STATION_ICONS: Record<string, React.ReactNode> = {
  "01_hoang_cam_kitchen": <Flame className="w-6 h-6 text-amber-400" />,
  "02_field_hospital": <HeartPulse className="w-6 h-6 text-rose-400" />,
  "03_command_bunker": <ShieldAlert className="w-6 h-6 text-emerald-400" />,
  "04_ventilation_termite": <Wind className="w-6 h-6 text-cyan-400" />,
  "05_booby_traps": <Crosshair className="w-6 h-6 text-yellow-400" />
};

const STATION_SECRETS: Record<
  string,
  {
    whatIsHere: { vi: string; en: string };
    howItWorks: { vi: string; en: string };
    depthTag: { vi: string; en: string };
  }
> = {
  "01_hoang_cam_kitchen": {
    depthTag: { vi: "Tầng 2 (Sâu 5m - 8m)", en: "Level 2 (5m - 8m Depth)" },
    whatIsHere: {
      vi: "Không gian bếp dã chiến khoét thẳng vào tầng đất sét pha đá ong, nồi nấu dã chiến, giàn hấp khoai mì, hầm chứa củi khô và rãnh ngầm dẫn khói dài 20m kết nối ra ụ mối mặt đất.",
      en: "Underground field kitchen carved into laterite clay, cooking cauldrons, cassava steamers, dry firewood caches, and 20-meter subterranean smoke ducts connecting to surface termite vents."
    },
    howItWorks: {
      vi: "Khói sinh ra từ buồng đốt được dẫn qua hệ thống rãnh ngầm làm nguội và phân tán qua nhiều tầng lọc đất, khi thoát lên mặt đất chỉ còn làn sương mỏng là là, hòa lẫn vào sương rừng ban mai để tránh máy bay trinh sát.",
      en: "Smoke from the firebox travels through underground trenches where it cools and dissipates. When released on the surface, it appears as a faint ground mist blending invisibly with jungle fog."
    }
  },
  "02_field_hospital": {
    depthTag: { vi: "Tầng 2 (Sâu 5m - 8m)", en: "Level 2 (5m - 8m Depth)" },
    whatIsHere: {
      vi: "Bàn mổ dã chiến bằng tre gỗ, đèn dầu và lọ đom đóm gom sáng, tủ thuốc Nam tự chế, giếng nước ngầm sinh hoạt và khu phục hồi chức năng của thương binh.",
      en: "Wooden surgical tables, dim oil lamps and firefly jars for illumination, homemade herbal medicine apothecary, underground well, and wounded soldiers recovery ward."
    },
    howItWorks: {
      vi: "Bác sĩ Võ Hoàng Lê cùng y bác sĩ thực hiện các ca phẫu thuật phức tạp dưới lòng đất ẩm tối, kết hợp cấy mô Filatov tăng đề kháng và bào chế thuốc Nam tại chỗ giữa vòng vây cấm vận thuốc men của địch.",
      en: "Dr. Vo Hoang Le conducted complex surgeries in dark, humid tunnels, utilizing Filatov tissue therapy and local herbal preparations to treat battlefield casualties amid total enemy blockade."
    }
  },
  "03_command_bunker": {
    depthTag: { vi: "Tầng 3 (Sâu 8m - 12m)", en: "Level 3 (8m - 12m Depth)" },
    whatIsHere: {
      vi: "Hầm họp Bộ Tư lệnh Khu Sài Gòn - Gia Định, hầm làm việc Chính ủy, bản đồ tác chiến khắc trên vách đất, hệ thống nút chặn chống khí độc và ngách bí mật trổ ra sông Sài Gòn.",
      en: "Military Command headquarters, Commissar quarters, combat maps engraved in clay, gas-sealing safety stop-valves, and an escape corridor to the Saigon River."
    },
    howItWorks: {
      vi: "Bố trí ở tầng ngầm kiên cố nhất có khả năng kháng bom tấn, trang bị các nút chặn kín hơi để cô lập từng đoạn hầm khi địch bơm hơi ngạt hoặc nước, là bàn đạp chỉ huy cuộc Tổng tiến công Tết Mậu Thân 1968.",
      en: "Engineered at the deepest bomb-proof layer, equipped with airtight stop-valves to seal off sections during gas or water attacks, serving as the nerve center for the 1968 Tet Offensive."
    }
  },
  "04_ventilation_termite": {
    depthTag: { vi: "Tầng 1 & 2 (Thông khí tự nhiên)", en: "Level 1 & 2 (Natural Air Vent)" },
    whatIsHere: {
      vi: "Các ống thông gió bằng thân tre rỗng ruột đục ngầm, miệng thoát khí ngụy trang như ụ mối đùn tự nhiên và xà phòng Camay Mỹ đặt quanh miệng hầm để đánh lừa chó săn.",
      en: "Hollow bamboo air ducts bored through earth, disguised surface openings resembling termite mounds, and American soap placed at entrances to foil scent-tracking hounds."
    },
    howItWorks: {
      vi: "Dựa vào nguyên lý đối lưu nhiệt tự nhiên giữa lòng hầm mát mẻ và thảm thực vật mặt đất để liên tục hút dưỡng khí sạch xuống hầm mà không gây tiếng ồn hay để lộ dấu vết.",
      en: "Operates on natural thermal convection between cool tunnels and warm surface canopy, continuously drawing fresh oxygen underground without noise or visual traces."
    }
  },
  "05_booby_traps": {
    depthTag: { vi: "Mặt đất (Khu trưng bày)", en: "Surface (Exhibition Grounds)" },
    whatIsHere: {
      vi: "Bộ sưu tập bẫy chông tre vót nhọn tẩm độc, bẫy chông cánh cửa, chông nắp tự động, hố đinh, và mô hình mìn gạt phá hủy xe bọc thép M113 của Anh hùng Tô Văn Đực.",
      en: "Collection of razor-sharp bamboo booby traps, door traps, automatic lid traps, spike pits, and Hero To Van Duc's converted sweep mines that destroyed M113 armored personnel carriers."
    },
    howItWorks: {
      vi: "Minh chứng cho đỉnh cao chiến tranh nhân dân 'lấy thô sơ thắng hiện đại' — tận dụng chính bom pháo lép của đối phương để tái chế thành vũ khí phòng thủ bảo vệ quê hương.",
      en: "Showcases the pinnacle of people's guerilla warfare — converting unexploded enemy ordnance into lethal defensive weaponry to neutralize superior technology."
    }
  }
};

export const StationDossierModal: React.FC<StationDossierModalProps> = ({
  station,
  locale,
  isOpen,
  onClose,
  onPlayNarration,
  onAskAI
}) => {
  if (!isOpen) return null;

  const dict = getDictionary(locale);
  const safety = station.safety;
  const stationTitle = getLocalizedText(station.title, locale);
  const summary = getLocalizedText(station.short_summary, locale);
  const storyHook = getLocalizedText(station.human_story_hook, locale);
  const exitNote = getLocalizedText(safety.emergency_exit_note, locale);
  const reassurance = getLocalizedText(safety.reassurance_message, locale);

  const secret = STATION_SECRETS[station.id] || {
    depthTag: { vi: "Tầng 2 (Sâu 5m - 8m)", en: "Level 2" },
    whatIsHere: { vi: summary, en: summary },
    howItWorks: { vi: storyHook, en: storyHook }
  };

  const depthText = locale === "vi" ? secret.depthTag.vi : secret.depthTag.en;
  const whatIsHereText = locale === "vi" ? secret.whatIsHere.vi : secret.whatIsHere.en;
  const howItWorksText = locale === "vi" ? secret.howItWorks.vi : secret.howItWorks.en;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-end sm:items-center justify-center p-3 sm:p-4 select-none animate-fadeIn">
      <div className="w-full max-w-lg bg-stone-950 border border-stone-800/90 rounded-3xl p-5 sm:p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl text-stone-200 relative animate-in slide-in-from-bottom duration-200">
        {/* 1. MODAL HEADER */}
        <div className="flex items-start justify-between border-b border-stone-800/80 pb-4">
          <div className="flex items-start space-x-3">
            <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 text-tunnel-amber flex-shrink-0 shadow-md">
              {STATION_ICONS[station.id] || <Compass className="w-6 h-6 text-tunnel-amber" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-tunnel-amber/15 border border-tunnel-amber/30 text-tunnel-amber text-[10px] font-bold tracking-wider uppercase font-mono">
                  TRẠM 0{station.order_index}
                </span>
                <span className="text-[10px] text-stone-400 font-mono flex items-center space-x-1">
                  <Layers className="w-3 h-3 text-tunnel-amber inline mr-1" />
                  {depthText}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-1 leading-snug">
                {stationTitle}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-stone-900 border border-stone-800 text-stone-400 hover:text-white active:scale-95 transition-all flex-shrink-0"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. KHU VỰC: CHỖ NÀY CÓ NHỮNG GÌ & LÀ GÌ? */}
        <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-2 shadow-inner">
          <div className="flex items-center space-x-2 text-tunnel-amber text-xs font-bold uppercase tracking-wider font-mono">
            <Sparkles className="w-4 h-4" />
            <span>{locale === "vi" ? "HIỆN VẬT & KHÔNG GIAN THỰC TẾ" : "WHAT IS LOCATED HERE"}</span>
          </div>
          <p className="text-xs sm:text-[13px] text-stone-300 leading-relaxed">
            {whatIsHereText}
          </p>
        </div>

        {/* 3. KHU VỰC: BÍ QUYẾT KỸ THUẬT & NGUYÊN LÝ HOẠT ĐỘNG */}
        <div className="p-4 rounded-2xl bg-tunnel-amber/10 border border-tunnel-amber/30 space-y-2">
          <div className="flex items-center space-x-2 text-tunnel-amber text-xs font-bold uppercase tracking-wider font-mono">
            <Layers className="w-4 h-4" />
            <span>{locale === "vi" ? "BÍ QUYẾT CÔNG TRÌNH NGẦM" : "SUBTERRANEAN MECHANISM"}</span>
          </div>
          <p className="text-xs sm:text-[13px] text-stone-200 leading-relaxed italic">
            &ldquo;{howItWorksText}&rdquo;
          </p>
        </div>

        {/* 4. 3 DẤU MỐC SỬ LIỆU ĐÃ KIỂM CHỨNG */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-tunnel-jade uppercase tracking-wider font-mono flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>{locale === "vi" ? "3 ĐẶC ĐIỂM SỬ LIỆU THEN CHỐT" : "VERIFIED HISTORICAL FACTS"}</span>
          </h3>
          <div className="space-y-2">
            {station.key_facts.map((fact, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-stone-900/60 border border-stone-800/80 text-xs text-stone-300"
              >
                <CheckCircle2 className="w-4 h-4 text-tunnel-jade flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{getLocalizedText(fact, locale)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. THÔNG SỐ AN TOÀN SINH MỆNH DƯỚI HẦM */}
        <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800/90 space-y-2 text-xs">
          <div className="flex items-center justify-between text-stone-400 font-mono text-[11px]">
            <span>ĐỘ DÀI: <strong className="text-white">{safety.tunnel_length_meters}m</strong></span>
            <span>THỜI GIAN: <strong className="text-white">~{safety.avg_crawl_time_minutes}p</strong></span>
            <span>TRẦN HẦM: <strong className="text-white">{safety.ceiling_height_meters}m</strong></span>
          </div>
          <div className="pt-1.5 border-t border-stone-800 flex items-start space-x-2 text-tunnel-jade text-xs font-medium">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{exitNote} — {reassurance}</span>
          </div>
        </div>

        {/* 6. CÂU HỎI THỰC ĐỊA DU KHÁCH THƯỜNG HỎI (FAQS) */}
        {station.faqs && station.faqs.length > 0 && (
          <div className="space-y-2.5 pt-2 border-t border-stone-800/80">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider font-mono flex items-center space-x-1.5">
              <HelpCircle className="w-4 h-4 text-tunnel-amber" />
              <span>{dict.beacon.fieldFaq}</span>
            </h3>
            <div className="space-y-2">
              {station.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-stone-900/90 border border-stone-800/90 space-y-1 text-xs"
                >
                  <p className="font-bold text-tunnel-amber">
                    Q: {getLocalizedText(faq.question, locale)}
                  </p>
                  <p className="text-stone-300 leading-relaxed">
                    A: {getLocalizedText(faq.answer, locale)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. CỤM NÚT HÀNH ĐỘNG DU KHÁCH */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5 sticky bottom-0 bg-stone-950/95 py-2">
          <button
            onClick={() => {
              onClose();
              onPlayNarration();
            }}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-tunnel-amber text-stone-950 font-bold text-xs hover:bg-amber-400 active:scale-95 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-tunnel-amber/20 font-mono uppercase"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{locale === "vi" ? "NGHE THUYẾT MINH MP3 (0ms)" : "PLAY AUDIO GUIDE (0ms)"}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onAskAI();
            }}
            className="py-3.5 px-4 rounded-2xl bg-stone-900 border border-stone-700 text-tunnel-chalk font-bold text-xs hover:border-tunnel-amber active:scale-95 transition-all flex items-center justify-center space-x-2 font-mono uppercase"
          >
            <MessageSquare className="w-4 h-4 text-tunnel-amber" />
            <span>{locale === "vi" ? "HỎI AI" : "ASK AI"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
