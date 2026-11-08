/** Wall posters for the tear-off pad. Each is [b&w lines, Devkitty lines]; art is an inline doodle drawn in sheet coordinates. */
export type Poster = { art?: string; bw: string[]; lit: string[]; };

const S = 'stroke="#1A1220" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';

const ARTS = {
  bug: `
    <path d="M1100 248 l-14 -8 M1104 254 l-16 2 M1102 260 l-12 10 M1124 248 l12 -8 M1126 255 l14 2 M1124 261 l10 9" fill="none" ${S} stroke-width="2.5"/>
    <ellipse cx="1112" cy="254" rx="13" ry="10" fill="#B83A16" ${S}/>
    <circle cx="1112" cy="244" r="6" fill="#B83A16" ${S}/>
    <path d="M1112 246 V262" fill="none" stroke="#FFB27A" stroke-width="2"/>
    <circle cx="1112" cy="254" r="23" fill="#FBF1E8" fill-opacity=".35" ${S} stroke-width="4"/>
    <path d="M1129 271 L1152 278" fill="none" ${S} stroke-width="6"/>`,
  crown: `
    <path d="M1098 238 L1093 219 L1105 227 L1112 214 L1119 227 L1131 219 L1126 238Z" fill="#FFD166" ${S}/>
    <circle cx="1112" cy="231" r="2.5" fill="#B83A16"/>
    <rect x="1088" y="238" width="48" height="30" rx="3" fill="#4A3A46" ${S}/>
    <rect x="1093" y="243" width="38" height="20" rx="2" fill="#FFB27A"/>
    <path d="M1104 252 h2 M1118 252 h2 M1104 257 q8 6 16 0" fill="none" ${S} stroke-width="2"/>
    <path d="M1080 268 H1144 L1149 276 H1075Z" fill="#9C8A94" ${S}/>`,
  drip: `
    <path d="M1080 278 V216 H1106" fill="none" ${S}/>
    <rect x="1086" y="220" width="26" height="30" rx="7" fill="#6B3A20" ${S}/>
    <path d="M1092 232 h14 M1092 238 h10" stroke="#FFB27A" stroke-width="2"/>
    <path d="M1099 250 C1099 258 1124 252 1124 260" fill="none" ${S} stroke-width="2.5"/>
    <circle cx="1124" cy="258" r="2.5" fill="#6B3A20"/>
    <rect x="1108" y="262" width="26" height="16" rx="3" fill="#FBF1E8" ${S}/>
    <path d="M1134 266 q8 0 0 8" fill="none" ${S} stroke-width="2.5"/>
    <path d="M1112 266 h18" stroke="#6B3A20" stroke-width="4"/>`,
  duck: `
    <rect x="1070" y="216" width="58" height="22" rx="9" fill="#FBF1E8" ${S}/>
    <path d="M1100 237 l4 8 l4 -8" fill="#FBF1E8" ${S}/>
    <text x="1076" y="231" class="hand" font-size="12" fill="#1A1220">blah blah</text>
    <ellipse cx="1112" cy="266" rx="26" ry="12" fill="#FFD166" ${S}/>
    <circle cx="1132" cy="252" r="11" fill="#FFD166" ${S}/>
    <path d="M1141 252 l11 2 l-11 5Z" fill="#FF6A3D" ${S}/>
    <circle cx="1134" cy="249" r="1.8" fill="#1A1220"/>
    <path d="M1096 264 q10 -8 20 0" fill="none" ${S} stroke-width="2.5"/>`,
  // our ginger cat sits calmly with a mug while a laptop burns
  fine: `
    <rect x="1126" y="266" width="40" height="7" rx="2" fill="#4A3A46" ${S}/>
    <path d="M1131 266 L1135 242 H1161 L1163 266Z" fill="#4A3A46" ${S}/>
    <path d="M1140 242 Q1134 230 1141 220 Q1142 228 1147 230 Q1149 222 1154 218 Q1156 228 1160 232 Q1163 238 1160 242Z" fill="#FF6A3D" ${S}/>
    <path d="M1147 242 Q1145 236 1149 232 Q1152 237 1153 242Z" fill="#FFD166"/>
    <ellipse cx="1098" cy="263" rx="15" ry="14" fill="#E8883A" ${S}/>
    <circle cx="1098" cy="240" r="11" fill="#E8883A" ${S}/>
    <path d="M1089 234 L1090 223 L1098 230Z M1107 230 L1115 223 L1116 234Z" fill="#E8883A" ${S}/>
    <path d="M1093 241 h4 M1101 241 h4 M1097 247 h3" fill="none" ${S} stroke-width="2"/>
    <rect x="1108" y="256" width="12" height="12" rx="2" fill="#FBF1E8" ${S}/>
    <path d="M1120 259 q6 0 0 7" fill="none" ${S} stroke-width="2.5"/>`,
  git: `
    <path d="M1082 274 C1082 244 1124 262 1124 232" fill="none" ${S}/>
    <path d="M1082 274 C1112 276 1100 242 1152 248" fill="none" ${S}/>
    <path d="M1124 232 C1156 224 1160 268 1114 272" fill="none" ${S}/>
    <path d="M1100 240 C1090 224 1130 222 1110 244" fill="none" ${S} stroke-width="2.5"/>
    <circle cx="1082" cy="274" r="6" fill="#FF6A3D" ${S}/>
    <circle cx="1124" cy="232" r="6" fill="#FFD166" ${S}/>
    <circle cx="1152" cy="248" r="6" fill="#FBF1E8" ${S}/>
    <circle cx="1114" cy="272" r="6" fill="#B83A16" ${S}/>
    <text x="1156" y="232" class="hand" font-size="22" fill="#B83A16">?</text>`,
  // Tomas the spider dives down his thread into a .NET (a web)
  net: `
    <path d="M1112 252 L1074 226 M1112 252 L1112 214 M1112 252 L1150 226 M1112 252 L1160 260 M1112 252 L1134 280 M1112 252 L1090 280 M1112 252 L1064 260" fill="none" stroke="#1A1220" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M1097 242 L1112 237 L1127 242 L1131 256 L1121 266 L1103 266 L1093 256Z" fill="none" stroke="#1A1220" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M1083 233 L1112 225 L1141 233 L1148 258 L1129 276 L1095 276 L1076 258Z" fill="none" stroke="#1A1220" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M1150 208 V236" stroke="#1A1220" stroke-width="1.4"/>
    <path d="M1144 238 l-6 -5 M1143 242 l-7 0 M1144 246 l-6 5 M1156 238 l6 -5 M1157 242 l7 0 M1156 246 l6 5" fill="none" stroke="#1A1220" stroke-width="1.8" stroke-linecap="round"/>
    <ellipse cx="1150" cy="243" rx="6" ry="7" fill="#1A1220"/>
    <circle cx="1150" cy="235" r="3.5" fill="#1A1220"/>
    <circle cx="1148.6" cy="234.4" r="1" fill="#FFF"/><circle cx="1151.4" cy="234.4" r="1" fill="#FFF"/>`,
  sleep: `
    <rect x="1070" y="262" width="100" height="14" rx="3" fill="#4A3A46" ${S}/>
    <path d="M1080 269 h84" stroke="#FBF1E8" stroke-width="3" stroke-dasharray="5 4"/>
    <ellipse cx="1124" cy="254" rx="32" ry="13" fill="#E8883A" ${S}/>
    <path d="M1106 244 l4 8 M1118 242 l3 9 M1130 242 l-2 9" stroke="#B83A16" stroke-width="2.5" fill="none"/>
    <circle cx="1092" cy="255" r="10" fill="#E8883A" ${S}/>
    <path d="M1084 249 L1085 239 L1093 246Z M1100 246 L1107 240 L1107 250Z" fill="#E8883A" ${S}/>
    <path d="M1088 256 q3 3 6 0" fill="none" ${S} stroke-width="2"/>
    <path d="M1155 258 q14 0 12 -12" fill="none" ${S}/>
    <text x="1128" y="232" class="hand" font-size="16" fill="#B83A16">zz</text>`
};

export const POSTERS: Poster[] = [
  { bw: ['rebase', 'builds', 'character'], lit: ['ship', 'it', 'tonight'] },
  { art: ARTS.fine, bw: ['this is', 'fine.'], lit: ['actually', 'fine.'] },
  { art: ARTS.duck, bw: ['explain it', 'to the duck'], lit: ['the duck', 'approved'] },
  { bw: ['99 tabs,', "can't find", 'one'], lit: ['1 window,', 'every tab', 'grouped'] },
  { art: ARTS.bug, bw: ["it's a", 'feature'], lit: ['found it.', 'fixed.'] },
  { art: ARTS.git, bw: ['who rebased', 'main?'], lit: ['clean', 'history.'] },
  { bw: ["it's", 'always', 'DNS'], lit: ['CI', 'is', 'green'] },
  { art: ARTS.crown, bw: ['works on', 'my machine'], lit: ['works on', 'every machine'] },
  { art: ARTS.drip, bw: ['coffee', '> sleep'], lit: ['coffee +', 'devkitty'] },
  { art: ARTS.sleep, bw: ['pair', 'programming'], lit: ['best pair', 'programmer'] },
  { art: ARTS.net, bw: ['Tomas, dive', 'into .NET'], lit: ['Tomas caught', 'bugs in .NET'] }
];
