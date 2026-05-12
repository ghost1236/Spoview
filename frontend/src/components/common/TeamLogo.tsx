"use client";

import { getTeamColor } from "@/lib/teamColors";

// 팀코드 → 표시 약자 (영문 팀은 코드 대문자, 한글 팀은 한글 첫 글자)
const TEAM_INITIALS: Record<string, string> = {
  // EPL
  ars: "ARS", mci: "MCI", mun: "MUN", liv: "LIV", avl: "AVL", bou: "BOU",
  bre: "BRE", bha: "BHA", che: "CHE", eve: "EVE", ful: "FUL", sun: "SUN",
  new: "NEW", lee: "LEE", cry: "CRY", not: "NOT", tot: "TOT", whu: "WHU",
  bur: "BUR", wol: "WOL",
  // 라리가
  fcb: "BAR", rma: "RMA", vil: "VIL", atm: "ATM", bet: "BET", cel: "CEL",
  get: "GET", ath: "ATH", rso: "RSO", osa: "OSA", ray: "RAY", val: "VAL",
  esp: "ESP", elc: "ELC", mal: "MAL", gir: "GIR", sev: "SEV", ala: "ALA",
  lev: "LEV", ovi: "OVI",
  // 분데스
  fcb2: "BAY", bvb: "BVB", rbl: "RBL", b04: "B04", vfb: "VFB", tsg: "TSG",
  scf: "SCF", sge: "SGE", fca: "FCA", m05: "M05", bmg: "BMG", hsv: "HSV",
  unb: "UNB", koe: "KOE", svw: "SVW", wob: "WOB", stp: "STP", hei: "HEI",
  // 세리에A
  int: "INT", nap: "NAP", mil: "MIL", juv: "JUV", rom: "ROM", com: "COM",
  ata: "ATA", laz: "LAZ", bol: "BOL", sas: "SAS", udi: "UDI", par: "PAR",
  tor: "TOR", gen: "GEN", fio: "FIO", cag: "CAG", usl: "USL", cre: "CRE",
  hve: "HVE", pis: "PIS",
  // 리그앙
  psg: "PSG", rcl: "RCL", lyo: "LYO", lil: "LIL", ren: "REN", asm: "ASM",
  mar: "MAR", rc: "RCS", fcl: "FCL", tou: "TOU", pfc: "PFC", bre2: "BRE",
  ang: "ANG", hac: "HAC", nic: "NIC", aja: "AJA", nan: "NAN", fcm: "FCM",
  // K리그
  jun: "전북", usn: "울산", phn: "포항", fcs: "서울", gnm: "강원", dae: "대전",
  gsn: "김천", gjn: "광주", ann: "안양", jej: "제주", inc: "인천", buc: "부천",
  dgu: "대구", suw: "수원", swb: "수원", sej: "이랜", sgn: "성남", jnm: "전남",
  gyg: "김포", bus: "부산", cha: "아산", hws: "화성", chb: "청주", chn: "천안",
  ans: "안산", gyn: "경남", kmh: "김해", yng: "용인", paj: "파주",
  // KBO
  ssg: "SSG", kia: "KIA", lgd: "LG", doo: "두산", ktu: "KT", sam: "삼성",
  lot: "롯데", han: "한화", nc: "NC", kw: "키움",
  // MLB
  nyy: "NYY", bos: "BOS", tbj: "TOR", bal: "BAL", tbr: "TB", cle: "CLE",
  det: "DET", min: "MIN", cws: "CWS", kc: "KC", hou: "HOU", tex: "TEX",
  sea: "SEA", laa: "LAA", oak: "OAK", atl: "ATL", nym: "NYM", phi: "PHI",
  mia: "MIA", was: "WSH", chc: "CHC", mkb: "MIL", stl: "STL", pit: "PIT",
  cin: "CIN", lad: "LAD", sdp: "SD", sfg: "SF", ari: "ARI", col: "COL",
};

interface Props {
  teamCode: string;
  name: string;
  size?: number;
}

export function TeamLogo({ teamCode, name, size = 36 }: Props) {
  const color = getTeamColor(teamCode);
  const initial = TEAM_INITIALS[teamCode] || name.charAt(0);
  const fontSize = size <= 24 ? 8 : size <= 32 ? 9 : size <= 40 ? 10 : size <= 48 ? 11 : 13;

  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        color: "#fff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize,
        flexShrink: 0,
        letterSpacing: "-0.02em",
        boxShadow: "0 1px 3px rgba(0,0,0,0.15), inset 0 -2px 0 rgba(0,0,0,0.12)",
        textShadow: "0 1px 2px rgba(0,0,0,0.25)",
      }}
      title={name}
    >
      {initial}
    </span>
  );
}
