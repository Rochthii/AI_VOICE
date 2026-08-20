import { Dictionary } from "../types";

export const frDictionary: Dictionary = {
  common: {
    station: "STATION",
    offline: "Hors ligne",
    details: "VOIR DÉTAILS",
    close: "Fermer",
    continue: "CONTINUER",
    understood: "COMPRIS — CONTINUER",
    send: "Envoyer",
    viewQr: "CODE QR DU SITE ↗",
    loading: "Chargement...",
    language: "Langue",
    selectLanguage: "CHOISIR LA LANGUE DU GUIDE"
  },
  beacon: {
    openGround: "Zone de surface — Espace ouvert",
    time: "Durée:",
    meters: "m",
    minutes: "min",
    historicalStory: "RÉCIT HISTORIQUE",
    verifiedFacts: "FAITS HISTORIQUES VÉRIFIÉS",
    fieldFaq: "QUESTIONS ET RÉPONSES DU SITE"
  },
  orb: {
    statusSearching: "RECHERCHE D'ARCHIVES",
    statusListening: "À L'ÉCOUTE",
    statusNarrating: "NARRATION EN COURS",
    statusTapToAsk: "TOUCHER POUR POSER UNE QUESTION",
    aiTitle: "INTELLIGENCE VOCALE IA",
    aiSubtitle: "Archives historiques officielles de Cu Chi",
    inputPlaceholder: "Posez une question sur les tunnels...",
    promptSuite: "Suggestions de questions rapides:",
    oneClickQuery: "QUESTION EN 1 CLIC",
    recPrefix: "[ENR]",
    defaultQuestion: "Quelle est la signification historique de ce site ?",
    sampleQuestions: [
      "Comment le poêle Hoang Cam cachait-il la fumée ?",
      "Qui était le Dr Vo Hoang Le ?",
      "Les habitants étaient-ils forcés de creuser ?",
      "Le chiffre de 44 357 martyrs est-il vérifié ?",
      "Comment fonctionnent les cheminées termitières ?",
      "Comment les mines de To Van Duc étaient-elles fabriquées ?"
    ]
  },
  ticker: {
    seekBackward: "Reculer de 15s",
    seekForward: "Avancer de 15s",
    play: "Écouter l'audio",
    pause: "Mettre en pause",
    progressBar: "Barre de progression audio"
  },
  panic: {
    title: "ASSISTANCE D'URGENCE",
    safeZoneHeader: "VOUS ÊTES EN SÉCURITÉ",
    exitPathLabel: "VOIE DE SORTIE D'URGENCE:",
    reassuranceButton: "JE SUIS RASSURÉ — CONTINUER"
  }
};
