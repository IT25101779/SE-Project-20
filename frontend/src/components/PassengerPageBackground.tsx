export type BackgroundVariant =
  | "home"
  | "search"
  | "bookings"
  | "auth"
  | "dashboard"
  | "notifications"
  | "notfound";

interface PassengerPageBackgroundProps {
  variant?: BackgroundVariant;
  opacity?: number;
}

/**
 * PassengerPageBackground
 * 
 * Elegant, large-scale, generous-spacing transportation watermark background
 * tailored for each passenger-facing page in Magiya.
 * Tuned with ultra-subtle opacity (0.05-0.08) so typography and data remain crystal clear.
 */
export default function PassengerPageBackground({
  variant = "home",
  opacity = 0.20,
}: PassengerPageBackgroundProps) {
  const patternId = `passenger-pattern-${variant}`;

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id={patternId}
            width="360"
            height="360"
            patternUnits="userSpaceOnUse"
          >
            {renderPatternMotifs(variant)}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}

function renderPatternMotifs(variant: BackgroundVariant) {
  switch (variant) {
    case "search":
      return <SearchMotifs />;
    case "bookings":
      return <BookingsMotifs />;
    case "auth":
      return <AuthMotifs />;
    case "dashboard":
      return <DashboardMotifs />;
    case "notifications":
      return <NotificationsMotifs />;
    case "notfound":
      return <NotFoundMotifs />;
    case "home":
    default:
      return <HomeMotifs />;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   1. HOME: General Intercity Bus Transit Motifs
   ───────────────────────────────────────────────────────────────────────────── */
function HomeMotifs() {
  return (
    <>
      {/* 1. Expressway Coach Side Profile (Top Left, scaled 68x30) */}
      <g transform="translate(30, 35)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <path d="M 6 28 L 2 14 Q 3 4 14 3 L 64 3 Q 72 3 72 9 L 72 28 Z" />
        <rect x="8" y="6" width="10" height="9" rx="1.5" />
        <rect x="21" y="6" width="10" height="9" rx="1.5" />
        <rect x="34" y="6" width="10" height="9" rx="1.5" />
        <rect x="47" y="6" width="10" height="9" rx="1.5" />
        <rect x="59" y="6" width="10" height="9" rx="1.5" />
        <line x1="2" y1="20" x2="72" y2="20" stroke="#D46B24" strokeWidth="1.2" />
        <circle cx="18" cy="28" r="5.5" stroke="#163E32" strokeWidth="1.5" fill="#F8F6F0" />
        <circle cx="18" cy="28" r="2" fill="#163E32" />
        <circle cx="58" cy="28" r="5.5" stroke="#163E32" strokeWidth="1.5" fill="#F8F6F0" />
        <circle cx="58" cy="28" r="2" fill="#163E32" />
      </g>

      {/* 2. Official Bus Stop Terminal Signpost (Top Right) */}
      <g transform="translate(225, 30)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <circle cx="15" cy="15" r="14" />
        {/* Little bus glyph inside stop circle */}
        <rect x="9" y="9" width="12" height="10" rx="2" />
        <line x1="9" y1="14" x2="21" y2="14" />
        <circle cx="11" cy="17" r="1" fill="#163E32" />
        <circle cx="19" cy="17" r="1" fill="#163E32" />
        {/* Post */}
        <line x1="15" y1="29" x2="15" y2="58" strokeWidth="2" />
        <line x1="7" y1="58" x2="23" y2="58" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* 3. Driver Steering Wheel (Center Left) */}
      <g transform="translate(45, 150)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <circle cx="20" cy="20" r="18" />
        <circle cx="20" cy="20" r="5.5" />
        <line x1="20" y1="2" x2="20" y2="14.5" />
        <line x1="5" y1="26" x2="15" y2="22.5" />
        <line x1="35" y1="26" x2="25" y2="22.5" />
      </g>

      {/* 4. Perforated Express Ticket Stub (Center Right) */}
      <g transform="translate(210, 140)" stroke="#D46B24" strokeWidth="1.5" fill="none">
        <rect x="2" y="2" width="56" height="32" rx="4" />
        {/* Ticket notch punchouts */}
        <path d="M 2 20 A 4 4 0 0 1 2 12" fill="#F8F6F0" />
        <path d="M 58 12 A 4 4 0 0 1 58 20" fill="#F8F6F0" />
        <line x1="20" y1="3" x2="20" y2="33" strokeDasharray="3 3" />
        {/* Barcode lines */}
        <line x1="28" y1="9" x2="28" y2="25" stroke="#163E32" strokeWidth="1.5" />
        <line x1="33" y1="9" x2="33" y2="25" stroke="#163E32" strokeWidth="1" />
        <line x1="38" y1="9" x2="38" y2="25" stroke="#163E32" strokeWidth="2" />
        <line x1="44" y1="9" x2="44" y2="25" stroke="#163E32" strokeWidth="1" />
        <line x1="49" y1="9" x2="49" y2="25" stroke="#163E32" strokeWidth="1.5" />
      </g>

      {/* 5. Expressway Shield Badge E01 (Bottom Left) */}
      <g transform="translate(40, 255)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <path d="M 6 4 H 36 V 20 Q 36 36 21 42 Q 6 36 6 20 Z" />
        <text
          x="21"
          y="25"
          textAnchor="middle"
          fill="#163E32"
          fontSize="13"
          fontFamily="monospace"
          fontWeight="bold"
          stroke="none"
        >
          E01
        </text>
      </g>

      {/* 6. Curving Highway Ribbon Corridor with City Pins (Bottom Right) */}
      <g transform="translate(190, 255)" stroke="#163E32" fill="none">
        <path
          d="M 10 35 Q 40 10 70 35 T 130 15"
          strokeWidth="1.6"
          strokeDasharray="4 4"
        />
        {/* Start waypoint pin */}
        <circle cx="10" cy="35" r="4" fill="#163E32" stroke="none" />
        <circle cx="10" cy="35" r="8" stroke="#163E32" strokeWidth="1" strokeDasharray="2 2" />
        {/* End waypoint pin */}
        <circle cx="130" cy="15" r="4" fill="#D46B24" stroke="none" />
        <circle cx="130" cy="15" r="8" stroke="#D46B24" strokeWidth="1" strokeDasharray="2 2" />
      </g>

      {/* Subtle Waypoint Crosshairs */}
      <g stroke="#163E32" strokeWidth="1" opacity="0.6">
        <circle cx="140" cy="70" r="2.5" fill="#163E32" />
        <circle cx="140" cy="290" r="2.5" fill="#D46B24" />
      </g>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   2. SEARCH: Timetable, Routes, Clocks & Milestone Markers
   ───────────────────────────────────────────────────────────────────────────── */
function SearchMotifs() {
  return (
    <>
      {/* 1. Departure Time Clock with Moving Transit Hands (Top Left) */}
      <g transform="translate(35, 30)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <circle cx="20" cy="20" r="18" />
        <circle cx="20" cy="20" r="2.5" fill="#163E32" />
        <line x1="20" y1="20" x2="20" y2="8" strokeLinecap="round" strokeWidth="2" />
        <line x1="20" y1="20" x2="28" y2="20" strokeLinecap="round" strokeWidth="2" stroke="#D46B24" />
        {/* Tick marks */}
        <line x1="20" y1="3" x2="20" y2="5" />
        <line x1="37" y1="20" x2="35" y2="20" />
        <line x1="20" y1="37" x2="20" y2="35" />
        <line x1="3" y1="20" x2="5" y2="20" />
      </g>

      {/* 2. Route Path A → B Corridor (Top Right) */}
      <g transform="translate(195, 40)" stroke="#163E32" strokeWidth="1.5" fill="none">
        <circle cx="12" cy="14" r="5" stroke="#163E32" strokeWidth="1.8" />
        <circle cx="12" cy="14" r="2" fill="#163E32" />
        <path d="M 18 14 C 45 4, 65 24, 95 14" strokeDasharray="3 3" />
        <circle cx="101" cy="14" r="5" stroke="#D46B24" strokeWidth="1.8" />
        <circle cx="101" cy="14" r="2" fill="#D46B24" />
        <text x="56" y="32" textAnchor="middle" fill="#D46B24" fontSize="9" fontFamily="sans-serif" fontWeight="bold" stroke="none">
          EXPRESS ROUTE
        </text>
      </g>

      {/* 3. Luxury Coach Frontal Face with Destination Screen (Center Left) */}
      <g transform="translate(30, 145)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <rect x="4" y="4" width="38" height="46" rx="6" />
        {/* Route marquee destination board */}
        <rect x="9" y="8" width="28" height="8" rx="1.5" stroke="#D46B24" />
        <line x1="12" y1="12" x2="34" y2="12" stroke="#D46B24" strokeDasharray="2 2" />
        {/* Windshield */}
        <rect x="8" y="19" width="30" height="15" rx="2" />
        {/* Headlights */}
        <circle cx="11" cy="40" r="3" stroke="#D46B24" />
        <circle cx="35" cy="40" r="3" stroke="#D46B24" />
        {/* Radiator grill */}
        <line x1="18" y1="40" x2="28" y2="40" />
        <line x1="18" y1="43" x2="28" y2="43" />
      </g>

      {/* 4. Luxury Passenger Seat Pair Outline (Center Right) */}
      <g transform="translate(220, 145)" stroke="#163E32" strokeWidth="1.6" fill="none">
        {/* Seat 1 */}
        <rect x="4" y="6" width="14" height="24" rx="3" />
        <path d="M 4 22 H 18 V 30 H 4 Z" stroke="#D46B24" />
        <rect x="2" y="10" width="2" height="14" rx="1" />
        {/* Seat 2 */}
        <rect x="24" y="6" width="14" height="24" rx="3" />
        <path d="M 24 22 H 38 V 30 H 24 Z" stroke="#D46B24" />
        <rect x="38" y="10" width="2" height="14" rx="1" />
        {/* Floor base */}
        <line x1="8" y1="30" x2="8" y2="38" />
        <line x1="34" y1="30" x2="34" y2="38" />
        <line x1="4" y1="38" x2="38" y2="38" strokeWidth="2" />
      </g>

      {/* 5. Sri Lankan Highway Milestone Stone (Bottom Left) */}
      <g transform="translate(45, 255)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <path d="M 4 40 V 16 Q 4 4 20 4 Q 36 4 36 16 V 40 Z" />
        <line x1="4" y1="18" x2="36" y2="18" stroke="#D46B24" strokeWidth="1.5" />
        <text x="20" y="14" textAnchor="middle" fill="#D46B24" fontSize="8" fontWeight="bold" stroke="none">
          A1
        </text>
        <text x="20" y="32" textAnchor="middle" fill="#163E32" fontSize="11" fontFamily="monospace" fontWeight="bold" stroke="none">
          115
        </text>
      </g>

      {/* 6. Calendar Travel Date Indicator (Bottom Right) */}
      <g transform="translate(225, 260)" stroke="#163E32" strokeWidth="1.5" fill="none">
        <rect x="2" y="6" width="36" height="32" rx="4" />
        <line x1="2" y1="16" x2="38" y2="16" stroke="#D46B24" strokeWidth="1.5" />
        {/* Ring binders */}
        <line x1="10" y1="2" x2="10" y2="8" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="2" x2="30" y2="8" strokeWidth="2" strokeLinecap="round" />
        {/* Date grid dots */}
        <circle cx="11" cy="23" r="1.5" fill="#163E32" stroke="none" />
        <circle cx="20" cy="23" r="1.5" fill="#163E32" stroke="none" />
        <circle cx="29" cy="23" r="1.5" fill="#D46B24" stroke="none" />
        <circle cx="11" cy="30" r="1.5" fill="#163E32" stroke="none" />
        <circle cx="20" cy="30" r="1.5" fill="#163E32" stroke="none" />
        <circle cx="29" cy="30" r="1.5" fill="#163E32" stroke="none" />
      </g>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   3. BOOKINGS: Digital Boarding Passes, QR Codes, Luggage & Verified Stamps
   ───────────────────────────────────────────────────────────────────────────── */
function BookingsMotifs() {
  return (
    <>
      {/* 1. Large Digital Boarding Pass with Perforation & QR Corner (Top Left) */}
      <g transform="translate(30, 25)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <rect x="2" y="2" width="68" height="42" rx="5" />
        <line x1="48" y1="2" x2="48" y2="44" stroke="#D46B24" strokeDasharray="3 3" />
        {/* Perforation notches */}
        <path d="M 48 2 A 3 3 0 0 0 48 8" fill="#F8F6F0" />
        <path d="M 48 38 A 3 3 0 0 0 48 44" fill="#F8F6F0" />
        {/* Text lines */}
        <line x1="8" y1="10" x2="36" y2="10" strokeWidth="1.5" />
        <line x1="8" y1="18" x2="28" y2="18" strokeWidth="1" stroke="#D46B24" />
        <line x1="8" y1="26" x2="34" y2="26" strokeWidth="1" />
        <line x1="8" y1="34" x2="22" y2="34" strokeWidth="1" />
        {/* Mini QR code pattern */}
        <rect x="53" y="10" width="10" height="10" strokeWidth="1" />
        <rect x="55" y="12" width="3" height="3" fill="#163E32" stroke="none" />
        <rect x="53" y="25" width="10" height="10" strokeWidth="1" />
        <rect x="59" y="27" width="3" height="3" fill="#D46B24" stroke="none" />
      </g>

      {/* 2. Official Journey Confirmed Stamp with Checkmark (Top Right) */}
      <g transform="translate(225, 30)" stroke="#D46B24" strokeWidth="1.6" fill="none">
        <circle cx="22" cy="22" r="20" strokeDasharray="4 2" />
        <circle cx="22" cy="22" r="16" />
        <path d="M 14 22 L 20 28 L 30 16" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <text x="22" y="36" textAnchor="middle" fill="#D46B24" fontSize="6" fontWeight="bold" stroke="none">
          VERIFIED
        </text>
      </g>

      {/* 3. Passenger Travel Luggage with Baggage Tag (Center Left) */}
      <g transform="translate(45, 140)" stroke="#163E32" strokeWidth="1.6" fill="none">
        {/* Suitcase Body */}
        <rect x="6" y="12" width="36" height="30" rx="4" />
        {/* Handle */}
        <path d="M 17 12 V 6 H 31 V 12" strokeWidth="2" strokeLinecap="round" />
        {/* Reinforcement straps */}
        <line x1="16" y1="12" x2="16" y2="42" stroke="#D46B24" />
        <line x1="32" y1="12" x2="32" y2="42" stroke="#D46B24" />
        {/* Wheels */}
        <circle cx="14" cy="44" r="2" fill="#163E32" />
        <circle cx="34" cy="44" r="2" fill="#163E32" />
        {/* Tag hanging */}
        <path d="M 31 12 L 40 22 L 36 25 L 29 15" strokeWidth="1" stroke="#D46B24" />
      </g>

      {/* 4. Live GPS Satellite Signal & Route Waypoint (Center Right) */}
      <g transform="translate(215, 145)" stroke="#163E32" strokeWidth="1.5" fill="none">
        <circle cx="22" cy="22" r="6" stroke="#D46B24" strokeWidth="2" />
        <circle cx="22" cy="22" r="2.5" fill="#D46B24" />
        {/* Radio beacon wave ripples */}
        <path d="M 12 12 A 14 14 0 0 1 32 12" strokeLinecap="round" />
        <path d="M 8 8 A 20 20 0 0 1 36 8" strokeLinecap="round" stroke="#D46B24" />
        <path d="M 4 4 A 26 26 0 0 1 40 4" strokeLinecap="round" />
      </g>

      {/* 5. Coach Interior Window with Scenery Horizon (Bottom Left) */}
      <g transform="translate(40, 250)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <rect x="4" y="4" width="46" height="34" rx="8" />
        {/* Curtain drape line */}
        <path d="M 4 8 Q 14 14 14 26" stroke="#D46B24" strokeWidth="1.2" />
        <path d="M 50 8 Q 40 14 40 26" stroke="#D46B24" strokeWidth="1.2" />
        {/* Mountain horizon curve */}
        <path d="M 6 30 Q 18 20 30 25 T 48 24" strokeWidth="1.2" strokeDasharray="2 2" />
        <circle cx="38" cy="14" r="3" stroke="#D46B24" />
      </g>

      {/* 6. Boarding Gate Barcode Scanner Beam (Bottom Right) */}
      <g transform="translate(220, 255)" stroke="#163E32" strokeWidth="1.5" fill="none">
        <line x1="2" y1="4" x2="2" y2="34" strokeWidth="3" />
        <line x1="8" y1="4" x2="8" y2="34" strokeWidth="1.5" />
        <line x1="13" y1="4" x2="13" y2="34" strokeWidth="2" stroke="#D46B24" />
        <line x1="18" y1="4" x2="18" y2="34" strokeWidth="1" />
        <line x1="23" y1="4" x2="23" y2="34" strokeWidth="3" />
        <line x1="30" y1="4" x2="30" y2="34" strokeWidth="1" stroke="#D46B24" />
        <line x1="35" y1="4" x2="35" y2="34" strokeWidth="2.5" />
        <line x1="42" y1="4" x2="42" y2="34" strokeWidth="1" />
        {/* Red laser scanner beam */}
        <line x1="0" y1="19" x2="46" y2="19" stroke="#D46B24" strokeWidth="1.5" strokeDasharray="3 2" />
      </g>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   4. AUTH: Passports, Security Badges, Key Tokens & Express Emblems
   ───────────────────────────────────────────────────────────────────────────── */
function AuthMotifs() {
  return (
    <>
      {/* 1. Passenger Passport / Journey Book Silhouette (Top Left) */}
      <g transform="translate(40, 30)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <rect x="4" y="4" width="34" height="46" rx="4" />
        {/* Passport emblem circle */}
        <circle cx="21" cy="22" r="10" stroke="#D46B24" strokeWidth="1.4" />
        <circle cx="21" cy="22" r="5" stroke="#163E32" />
        <line x1="12" y1="38" x2="30" y2="38" strokeWidth="1.5" />
        <line x1="15" y1="42" x2="27" y2="42" strokeWidth="1" />
      </g>

      {/* 2. Official Transit Insignia / Verified Shield (Top Right) */}
      <g transform="translate(230, 35)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <path d="M 4 6 L 22 2 L 40 6 V 22 C 40 34 22 42 22 42 C 22 42 4 34 4 22 Z" />
        {/* Keyhole / star in shield */}
        <circle cx="22" cy="18" r="4" stroke="#D46B24" />
        <path d="M 22 22 V 28" stroke="#D46B24" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* 3. Modern Express Coach Silhouette (Center Left) */}
      <g transform="translate(30, 150)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <path d="M 4 24 L 2 12 Q 3 4 12 3 L 56 3 Q 62 3 62 8 L 62 24 Z" />
        <rect x="7" y="6" width="8" height="8" rx="1.5" />
        <rect x="18" y="6" width="8" height="8" rx="1.5" />
        <rect x="29" y="6" width="8" height="8" rx="1.5" />
        <rect x="40" y="6" width="8" height="8" rx="1.5" />
        <line x1="2" y1="18" x2="62" y2="18" stroke="#D46B24" />
        <circle cx="16" cy="24" r="4.5" fill="#F8F6F0" />
        <circle cx="48" cy="24" r="4.5" fill="#F8F6F0" />
      </g>

      {/* 4. Journey Compass Rose (Center Right) */}
      <g transform="translate(225, 145)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <circle cx="22" cy="22" r="18" strokeDasharray="3 3" />
        {/* 4 points */}
        <polygon points="22,4 26,18 22,22 18,18" fill="#163E32" stroke="none" />
        <polygon points="22,40 26,26 22,22 18,26" fill="#D46B24" stroke="none" />
        <polygon points="4,22 18,18 22,22 18,26" fill="#163E32" stroke="none" />
        <polygon points="40,22 26,18 22,22 26,26" fill="#D46B24" stroke="none" />
      </g>

      {/* 5. Destination Map Location Pin (Bottom Left) */}
      <g transform="translate(45, 255)" stroke="#D46B24" strokeWidth="1.6" fill="none">
        <path d="M 18 2 C 10 2 4 8 4 16 C 4 26 18 38 18 38 C 18 38 32 26 32 16 C 32 8 26 2 18 2 Z" />
        <circle cx="18" cy="15" r="5" stroke="#163E32" strokeWidth="2" fill="#F8F6F0" />
      </g>

      {/* 6. Highway Route Corridor E01 (Bottom Right) */}
      <g transform="translate(210, 260)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <rect x="2" y="2" width="46" height="28" rx="5" />
        <line x1="2" y1="16" x2="48" y2="16" stroke="#D46B24" strokeDasharray="3 3" />
        <circle cx="12" cy="16" r="3" fill="#163E32" stroke="none" />
        <circle cx="38" cy="16" r="3" fill="#D46B24" stroke="none" />
      </g>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   5. DASHBOARD: Frequent Traveler, Kilometers Traveled, Profile & Mileage
   ───────────────────────────────────────────────────────────────────────────── */
function DashboardMotifs() {
  return (
    <>
      {/* 1. Speedometer / Odometer Kilometer Dial (Top Left) */}
      <g transform="translate(35, 30)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <path d="M 6 32 A 18 18 0 1 1 38 32" strokeWidth="2" strokeLinecap="round" />
        <circle cx="22" cy="24" r="3" fill="#163E32" />
        <line x1="22" y1="24" x2="32" y2="14" stroke="#D46B24" strokeWidth="2" strokeLinecap="round" />
        {/* Speed marks */}
        <line x1="9" y1="24" x2="13" y2="23" />
        <line x1="14" y1="14" x2="17" y2="16" />
        <line x1="22" y1="8" x2="22" y2="12" />
        <line x1="30" y1="14" x2="27" y2="16" stroke="#D46B24" />
      </g>

      {/* 2. Frequent Passenger Star Medal (Top Right) */}
      <g transform="translate(230, 30)" stroke="#D46B24" strokeWidth="1.6" fill="none">
        {/* Ribbons */}
        <path d="M 12 28 L 6 44 L 16 40 L 22 44 L 18 28" />
        <path d="M 28 28 L 34 44 L 24 40 L 18 44 L 22 28" />
        {/* Medal circle */}
        <circle cx="20" cy="18" r="14" stroke="#163E32" strokeWidth="1.8" fill="#F8F6F0" />
        <polygon points="20,8 23,14 29,15 25,19 26,25 20,22 14,25 15,19 11,15 17,14" fill="#D46B24" stroke="none" />
      </g>

      {/* 3. Passenger Identity Card Outline (Center Left) */}
      <g transform="translate(30, 145)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <rect x="2" y="2" width="56" height="36" rx="4" />
        {/* Photo avatar outline */}
        <rect x="8" y="8" width="16" height="18" rx="2" stroke="#D46B24" />
        <circle cx="16" cy="14" r="3.5" stroke="#D46B24" />
        <path d="M 10 24 Q 16 19 22 24" stroke="#D46B24" />
        {/* Details lines */}
        <line x1="28" y1="11" x2="50" y2="11" strokeWidth="1.8" />
        <line x1="28" y1="17" x2="44" y2="17" strokeWidth="1.2" />
        <line x1="28" y1="23" x2="48" y2="23" strokeWidth="1.2" />
        <line x1="8" y1="31" x2="50" y2="31" strokeDasharray="2 2" strokeWidth="1" />
      </g>

      {/* 4. Journey Waypoint Pin Milestones (Center Right) */}
      <g transform="translate(210, 145)" stroke="#163E32" strokeWidth="1.5" fill="none">
        <circle cx="10" cy="18" r="6" stroke="#163E32" strokeWidth="2" />
        <path d="M 16 18 C 30 8, 45 28, 60 18" strokeDasharray="3 3" />
        <circle cx="66" cy="18" r="6" stroke="#D46B24" strokeWidth="2" />
        <circle cx="66" cy="18" r="2.5" fill="#D46B24" />
        <text x="38" y="32" textAnchor="middle" fill="#163E32" fontSize="9" fontWeight="bold" stroke="none">
          TRIPS LOGGED
        </text>
      </g>

      {/* 5. Expressway Bus Silhouette (Bottom Left) */}
      <g transform="translate(35, 255)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <path d="M 6 26 L 2 12 Q 3 3 14 2 L 60 2 Q 68 2 68 8 L 68 26 Z" />
        <line x1="2" y1="17" x2="68" y2="17" stroke="#D46B24" />
        <circle cx="16" cy="26" r="5" fill="#F8F6F0" />
        <circle cx="54" cy="26" r="5" fill="#F8F6F0" />
      </g>

      {/* 6. Travel Luggage Bag Tag (Bottom Right) */}
      <g transform="translate(225, 255)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <rect x="4" y="6" width="34" height="26" rx="4" />
        <path d="M 14 6 V 2 H 28 V 6" strokeWidth="1.8" />
        <line x1="12" y1="6" x2="12" y2="32" stroke="#D46B24" />
        <line x1="30" y1="6" x2="30" y2="32" stroke="#D46B24" />
      </g>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   6. NOTIFICATIONS: Radio Transmissions, Bells, Advisory Horns & Alerts
   ───────────────────────────────────────────────────────────────────────────── */
function NotificationsMotifs() {
  return (
    <>
      {/* 1. Travel Alert Bell with Sound Vibration Waves (Top Left) */}
      <g transform="translate(40, 30)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <path d="M 18 6 C 12 6 8 11 8 18 C 8 23 5 26 5 26 H 31 C 31 26 28 23 28 18 C 28 11 24 6 18 6 Z" />
        <path d="M 15 29 A 3 3 0 0 0 21 29" strokeWidth="2" />
        {/* Sound ripples */}
        <path d="M 4 14 A 12 12 0 0 0 4 22" stroke="#D46B24" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 32 14 A 12 12 0 0 1 32 22" stroke="#D46B24" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* 2. Broadcast Radio Antenna Tower with Signal Beams (Top Right) */}
      <g transform="translate(230, 25)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <polygon points="18,4 6,42 30,42" />
        <line x1="10" y1="28" x2="26" y2="28" />
        <line x1="13" y1="16" x2="23" y2="16" />
        <circle cx="18" cy="4" r="3" fill="#D46B24" stroke="none" />
        {/* Radio waves */}
        <path d="M 10 2 A 10 10 0 0 1 26 2" stroke="#D46B24" strokeWidth="1.5" />
        <path d="M 6 -2 A 16 16 0 0 1 30 -2" stroke="#D46B24" strokeWidth="1.5" />
      </g>

      {/* 3. Expressway Travel Advisory Warning Triangle (Center Left) */}
      <g transform="translate(35, 145)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <polygon points="22,6 4,38 40,38" strokeWidth="2" strokeLinejoin="round" />
        <line x1="22" y1="16" x2="22" y2="26" stroke="#D46B24" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="22" cy="32" r="1.5" fill="#D46B24" stroke="none" />
      </g>

      {/* 4. Terminal Public Announcement Horn / Megaphone (Center Right) */}
      <g transform="translate(220, 145)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <polygon points="8,16 22,8 22,28 8,20" />
        <rect x="4" y="16" width="4" height="4" rx="1" />
        <path d="M 12 20 V 28 H 15 V 20" />
        {/* Sound arcs */}
        <path d="M 26 12 A 8 8 0 0 1 26 24" stroke="#D46B24" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 30 8 A 14 14 0 0 1 30 28" stroke="#D46B24" strokeWidth="1.8" strokeLinecap="round" />
      </g>

      {/* 5. Message Envelope with Route Departure Stamp (Bottom Left) */}
      <g transform="translate(40, 255)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <rect x="2" y="6" width="42" height="28" rx="4" />
        <path d="M 3 8 L 23 22 L 43 8" stroke="#D46B24" strokeWidth="1.5" />
        <circle cx="34" cy="22" r="4" stroke="#163E32" strokeDasharray="2 2" />
      </g>

      {/* 6. Digital Journey Clock with Alarm (Bottom Right) */}
      <g transform="translate(225, 255)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <circle cx="20" cy="20" r="16" />
        <line x1="20" y1="20" x2="20" y2="10" strokeLinecap="round" strokeWidth="2" />
        <line x1="20" y1="20" x2="26" y2="20" strokeLinecap="round" strokeWidth="2" stroke="#D46B24" />
        <path d="M 7 7 L 12 4" strokeWidth="2" strokeLinecap="round" />
        <path d="M 33 7 L 28 4" strokeWidth="2" strokeLinecap="round" />
      </g>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   7. NOTFOUND: Detour Roads, Roundabouts, U-Turns & Off-Route Signs
   ───────────────────────────────────────────────────────────────────────────── */
function NotFoundMotifs() {
  return (
    <>
      {/* 1. Detour Curved Road Arrow Sign (Top Left) */}
      <g transform="translate(40, 30)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <rect x="4" y="4" width="38" height="38" rx="6" transform="rotate(45 23 23)" />
        <path d="M 12 28 Q 16 16 28 16 H 34" stroke="#D46B24" strokeWidth="2" strokeLinecap="round" />
        <polyline points="30,12 35,16 30,20" stroke="#D46B24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* 2. Roundabout Direction Loop (Top Right) */}
      <g transform="translate(230, 35)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <circle cx="20" cy="20" r="16" strokeDasharray="6 3" />
        <circle cx="20" cy="20" r="6" stroke="#D46B24" />
        <polyline points="28,8 34,14 28,20" stroke="#163E32" strokeWidth="1.5" />
      </g>

      {/* 3. Bus Stop Empty Pole (Center Left) */}
      <g transform="translate(45, 150)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <circle cx="15" cy="15" r="14" stroke="#D46B24" />
        <line x1="8" y1="8" x2="22" y2="22" stroke="#D46B24" strokeWidth="2" />
        <line x1="15" y1="29" x2="15" y2="52" strokeWidth="2" />
      </g>

      {/* 4. Compass Needle Spinning (Center Right) */}
      <g transform="translate(225, 145)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <circle cx="20" cy="20" r="18" />
        <polygon points="20,4 24,18 20,20 16,18" fill="#D46B24" stroke="none" />
        <polygon points="20,36 24,22 20,20 16,22" fill="#163E32" stroke="none" />
      </g>

      {/* 5. Highway U-Turn Curve (Bottom Left) */}
      <g transform="translate(45, 260)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <path d="M 8 32 V 16 Q 8 6 22 6 Q 36 6 36 16 V 32" strokeWidth="2" strokeLinecap="round" />
        <polyline points="32,26 36,32 40,26" stroke="#D46B24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* 6. Unknown Distance Milepost "? KM" (Bottom Right) */}
      <g transform="translate(225, 260)" stroke="#163E32" strokeWidth="1.6" fill="none">
        <path d="M 4 36 V 14 Q 4 4 18 4 Q 32 4 32 14 V 36 Z" />
        <text x="18" y="24" textAnchor="middle" fill="#D46B24" fontSize="14" fontWeight="bold" stroke="none">
          ?
        </text>
      </g>
    </>
  );
}
