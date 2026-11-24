export default function ClayMascot() {
  return (
    <div className="relative w-full max-w-md mx-auto select-none py-2">
      {/* Elemen Melayang 1: Hangeul "스터디오" (Studyo) */}
      <div className="animate-clay-float-delayed absolute -top-3 -left-2 sm:left-0 z-10 clay-yellow px-4 py-2 flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-[#182338] text-[#FBE48B] flex items-center justify-center text-xs font-extrabold">
          한
        </span>
        <div>
          <p className="text-xs font-extrabold leading-none text-[#182338]">
            스터디오
          </p>
          <p className="text-[10px] font-semibold text-[#182338]/75 mt-0.5">
            Studyo • Korean
          </p>
        </div>
      </div>

      {/* Elemen Melayang 2: Kanji & Katakana Jepang "学習 • スタディオ" */}
      <div className="animate-clay-float absolute top-6 -right-2 sm:-right-1 z-10 bg-white text-[#182338] clay-pill px-4 py-2 flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-[#FBE48B] text-[#182338] flex items-center justify-center text-xs font-extrabold">
          学
        </span>
        <div>
          <p className="text-xs font-extrabold leading-none">学習 • Studyo</p>
          <p className="text-[10px] text-[#5A657A] font-semibold mt-0.5">
            Japanese
          </p>
        </div>
      </div>

      {/* Elemen Melayang 3: English "Studyo" */}
      <div className="animate-clay-float-delayed absolute -bottom-3 left-3 sm:left-5 z-10 bg-white text-[#182338] clay-pill px-4 py-2 flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-[#182338] text-[#FBE48B] flex items-center justify-center text-xs font-extrabold">
          En
        </span>
        <div>
          <p className="text-xs font-extrabold leading-none">Studyo</p>
          <p className="text-[10px] text-[#5A657A] font-semibold mt-0.5">
            Certified Fluency
          </p>
        </div>
      </div>

      {/* Wadah Utama 3D Matte Clay Cartoon */}
      <div className="animate-clay-float bg-[#233250] rounded-[36px] p-5 sm:p-6 border-2 border-[#31446B] shadow-[inset_0_6px_14px_rgba(255,255,255,0.12),inset_0_-8px_16px_rgba(10,16,28,0.6)]">
        <svg
          viewBox="0 0 380 300"
          className="w-full h-auto drop-shadow-[0_18px_22px_rgba(8,13,24,0.45)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradien Matte Clay Soft Yellow */}
            <radialGradient id="clayYellow" cx="35%" cy="28%" r="72%">
              <stop offset="0%" stopColor="#FFF6C7" />
              <stop offset="55%" stopColor="#FBE48B" />
              <stop offset="100%" stopColor="#D4AE38" />
            </radialGradient>

            {/* Gradien Matte Clay Deep Navy */}
            <radialGradient id="clayNavy" cx="35%" cy="25%" r="75%">
              <stop offset="0%" stopColor="#465F8F" />
              <stop offset="60%" stopColor="#22314F" />
              <stop offset="100%" stopColor="#111929" />
            </radialGradient>

            {/* Gradien Matte Clay Kulit Kartun Hangat */}
            <radialGradient id="claySkin" cx="38%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFE6D5" />
              <stop offset="65%" stopColor="#F7C4A5" />
              <stop offset="100%" stopColor="#D89B78" />
            </radialGradient>

            {/* Gradien Matte Clay Rambut Cokelat Tua */}
            <radialGradient id="clayHair" cx="35%" cy="25%" r="75%">
              <stop offset="0%" stopColor="#4A3B47" />
              <stop offset="65%" stopColor="#2B2129" />
              <stop offset="100%" stopColor="#181217" />
            </radialGradient>

            {/* Gradien Matte Clay Kertas / Sertifikat Cream */}
            <linearGradient id="clayPaper" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="75%" stopColor="#F5EFE2" />
              <stop offset="100%" stopColor="#DDD3BE" />
            </linearGradient>

            {/* Gradien Matte Clay Coral / Terracotta Pita */}
            <radialGradient id="clayCoral" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFA585" />
              <stop offset="65%" stopColor="#E5734E" />
              <stop offset="100%" stopColor="#B34A2A" />
            </radialGradient>
          </defs>

          {/* Latar Lingkaran Clay Soft */}
          <circle cx="190" cy="154" r="108" fill="#1B2740" />

          {/* Tulisan Berterbangan di Dalam Canvas SVG (Inggris, Hangeul, Kanji) */}
          <g opacity="0.9">
            <rect x="34" y="96" width="68" height="26" rx="13" fill="url(#clayNavy)" />
            <text
              x="68"
              y="113"
              textAnchor="middle"
              fill="#FBE48B"
              fontSize="11"
              fontWeight="800"
            >
              Studyo
            </text>

            <rect x="276" y="118" width="74" height="26" rx="13" fill="url(#clayYellow)" />
            <text
              x="313"
              y="135"
              textAnchor="middle"
              fill="#182338"
              fontSize="11"
              fontWeight="800"
            >
              스터디오
            </text>

            <rect x="268" y="160" width="76" height="26" rx="13" fill="url(#clayPaper)" />
            <text
              x="306"
              y="177"
              textAnchor="middle"
              fill="#182338"
              fontSize="11"
              fontWeight="800"
            >
              勉強 • 学習
            </text>
          </g>

          {/* Badan / Sweater 3D Clay (Soft Yellow) */}
          <path
            d="M124 242C124 202 152 182 190 182C228 182 256 202 256 242V256H124V242Z"
            fill="url(#clayYellow)"
          />
          {/* Kerah Kemeja Navy */}
          <path
            d="M170 184L190 206L210 184"
            fill="url(#clayNavy)"
          />

          {/* Telinga Kiri & Kanan */}
          <circle cx="143" cy="134" r="11" fill="url(#claySkin)" />
          <circle cx="237" cy="134" r="11" fill="url(#claySkin)" />

          {/* Kepala Karakter 3D Clay */}
          <rect
            x="146"
            y="88"
            width="88"
            height="92"
            rx="44"
            fill="url(#claySkin)"
          />

          {/* Poni & Rambut 3D Clay */}
          <path
            d="M145 124C145 96 164 82 190 82C216 82 235 96 235 124C227 110 214 106 202 110C192 113 180 106 168 109C157 112 150 117 145 124Z"
            fill="url(#clayHair)"
          />

          {/* Ekspresi Wajah Kartun Ceria */}
          <circle cx="172" cy="133" r="5" fill="#182338" />
          <circle cx="208" cy="133" r="5" fill="#182338" />
          <circle cx="170.5" cy="131.5" r="1.7" fill="#FFFFFF" />
          <circle cx="206.5" cy="131.5" r="1.7" fill="#FFFFFF" />
          <ellipse cx="161" cy="143" rx="6.5" ry="3.8" fill="#F29578" opacity="0.65" />
          <ellipse cx="219" cy="143" rx="6.5" ry="3.8" fill="#F29578" opacity="0.65" />
          <path
            d="M181 144C185 150 195 150 199 144"
            stroke="#182338"
            strokeWidth="3.8"
            strokeLinecap="round"
          />

          {/* TOPI KELULUSAN (MORTARBOARD) 3D CLAY */}
          {/* Bagian Kepala Topi */}
          <path
            d="M156 76H224V91C224 96 209 100 190 100C171 100 156 96 156 91V76Z"
            fill="url(#clayNavy)"
          />
          {/* Papan Atas Topi Wisuda */}
          <path
            d="M190 46L252 69L190 91L128 69L190 46Z"
            fill="url(#clayNavy)"
          />
          {/* Kancing & Rumbai Tali Soft Yellow */}
          <circle cx="190" cy="68" r="5" fill="url(#clayYellow)" />
          <path
            d="M190 68L236 82V104"
            stroke="#FBE48B"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="236" cy="106" r="4.5" fill="url(#clayYellow)" />

          {/* BUKU TULIS 3D CLAY (Di Tangan Kiri) */}
          <g transform="rotate(-8 118 214)">
            <rect
              x="82"
              y="186"
              width="68"
              height="54"
              rx="12"
              fill="url(#clayNavy)"
            />
            <rect
              x="92"
              y="186"
              width="58"
              height="54"
              rx="10"
              fill="url(#clayPaper)"
            />
            {/* Garis Catatan & Label Buku */}
            <rect x="103" y="198" width="34" height="6" rx="3" fill="#FBE48B" />
            <rect x="103" y="210" width="28" height="4" rx="2" fill="#CBD5E1" />
            <rect x="103" y="219" width="22" height="4" rx="2" fill="#CBD5E1" />
          </g>

          {/* Tangan Kiri Memegang Buku */}
          <circle cx="134" cy="218" r="12" fill="url(#claySkin)" />

          {/* GULUNGAN SERTIFIKAT BERPITA 3D CLAY (Di Tangan Kanan) */}
          <g transform="rotate(14 252 214)">
            <rect
              x="222"
              y="198"
              width="66"
              height="24"
              rx="12"
              fill="url(#clayPaper)"
            />
            {/* Ujung Gulungan Sertifikat */}
            <ellipse cx="284" cy="210" rx="5" ry="11" fill="#D5CCB8" />
            {/* Pita Merah Coral & Segel Emas */}
            <rect x="249" y="197" width="10" height="26" rx="3" fill="url(#clayCoral)" />
            <circle cx="254" cy="210" r="6" fill="url(#clayYellow)" />
          </g>

          {/* Tangan Kanan Memegang Sertifikat */}
          <circle cx="244" cy="218" r="12" fill="url(#claySkin)" />

          {/* Partikel Bola Clay Kecil */}
          <circle cx="66" cy="158" r="8" fill="url(#clayYellow)" />
          <circle cx="316" cy="92" r="7" fill="url(#clayCoral)" />
          <circle cx="298" cy="224" r="9" fill="url(#clayYellow)" />
        </svg>
      </div>
    </div>
  );
}