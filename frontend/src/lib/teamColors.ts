// 팀별 메인 컬러 매핑
export const TEAM_COLORS: Record<string, string> = {
  // EPL
  ars: "#EF0107", mci: "#6CADDF", mun: "#DA291C", liv: "#C8102E",
  avl: "#670E36", bou: "#DA291C", bre: "#E30613", bha: "#0057B8",
  che: "#034694", eve: "#003399", ful: "#000000", sun: "#EB172B",
  new: "#241F20", lee: "#FFCD00", cry: "#1B458F", not: "#DD0000",
  tot: "#132257", whu: "#7A263A", bur: "#6C1D45", wol: "#FDB913",

  // 라리가
  fcb: "#A50044", rma: "#FEBE10", vil: "#005CA5", atm: "#CB3524",
  bet: "#00954C", cel: "#8AC3EE", get: "#005999", ath: "#EE2523",
  rso: "#003DA5", osa: "#0A3685", ray: "#E53027", val: "#EE3900",
  esp: "#007FC8", elc: "#006633", mal: "#E20613", gir: "#CD2534",
  sev: "#D40928", ala: "#00529F", lev: "#003DA5", ovi: "#003DA5",

  // 분데스리가
  fcb2: "#DC052D", bvb: "#FDE100", rbl: "#DD0741", b04: "#E32221",
  vfb: "#E32219", tsg: "#1461AC", scf: "#000000", sge: "#E1000F",
  fca: "#BA3733", m05: "#C3002F", bmg: "#000000", hsv: "#005B9E",
  unb: "#EB1923", koe: "#FC4B30", svw: "#1D9053", wob: "#65B32E",
  stp: "#6F4028", hei: "#D71920",

  // 세리에A
  int: "#0068A8", nap: "#12A0D7", mil: "#FB090B", juv: "#000000",
  rom: "#8E1F2F", com: "#003DA5", ata: "#1E71B8", laz: "#87D8F7",
  bol: "#1A2F48", sas: "#00A85A", udi: "#000000", par: "#FFFF00",
  tor: "#8B0000", gen: "#091C3E", fio: "#482C84", cag: "#7B2F3F",
  usl: "#FFED00", cre: "#9E1B32", hve: "#003DA5", pis: "#000080",

  // 리그앙
  psg: "#004170", rcl: "#E2001A", lyo: "#003DA5", lil: "#E2001A",
  ren: "#000000", asm: "#E2001A", mar: "#2FAEE0", rc: "#009FE3",
  fcl: "#F68D2E", tou: "#6F2C91", pfc: "#004A8F", bre2: "#E2001A",
  ang: "#000000", hac: "#009FE3", nic: "#000000", aja: "#1A3E7A",
  nan: "#FFED00", fcm: "#6B1632",

  // K리그1
  jun: "#16A34A", usn: "#1F4099", phn: "#DC2626", fcs: "#DC2626",
  gnm: "#FF6600", dae: "#8B0000", gsn: "#004B87", gjn: "#009944",
  ann: "#E50012", jej: "#FF8C00", inc: "#003DA5", buc: "#C70125",

  // K리그2
  dgu: "#003DA5", suw: "#004B87", swb: "#003DA5", sej: "#E20E17",
  sgn: "#000000", jnm: "#FFD700", gyg: "#0058A6", bus: "#E20E17",
  cha: "#1E3A6E", hws: "#004EA2", chb: "#D72631", chn: "#003DA5",
  ans: "#009944", gyn: "#DC2626", kmh: "#1B458F", yng: "#004B87",
  paj: "#003DA5",

  // KBO
  ssg: "#CE0E2D", kia: "#EA002C", lgd: "#C30452", doo: "#13284A",
  ktu: "#000000", sam: "#074CA1", lot: "#041E42", han: "#FF6600",
  nc: "#315288", kw: "#570514",

  // MLB
  nyy: "#003087", bos: "#BD3039", tbj: "#134A8E", bal: "#DF4601",
  tbr: "#092C5C", cle: "#00385D", det: "#0C2340", min: "#002B5C",
  cws: "#27251F", kc: "#004687", hou: "#002D62", tex: "#003278",
  sea: "#0C2C56", laa: "#BA0021", oak: "#003831",
  atl: "#CE1141", nym: "#002D72", phi: "#E81828", mia: "#00A3E0",
  was: "#AB0003", chc: "#0E3386", mkb: "#FFC52F", stl: "#C41E3A",
  pit: "#27251F", cin: "#C6011F", lad: "#005A9C", sdp: "#2F241D",
  sfg: "#FD5A1E", ari: "#A71930", col: "#333366",
};

export function getTeamColor(teamCode: string): string {
  return TEAM_COLORS[teamCode] || "var(--surface-2)";
}
