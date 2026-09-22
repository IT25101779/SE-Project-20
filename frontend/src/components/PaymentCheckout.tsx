import { useEffect, useState } from "react";
import { CreditCard, Smartphone, Lock, CheckCircle2, XCircle, Loader2, Clock } from "lucide-react";
import { PaymentApi, type BookingGroupResponse } from "../api/client";

type Method = "CARD" | "WALLET";
type Status = "form" | "processing" | "success" | "failure";

/**
 * Full payment checkout screen: method selection, an animated live card
 * preview (flips to show CVV on the back), format validation as you type,
 * and success/failure result screens. The backend is the real source of
 * truth for whether a payment succeeds - see PaymentStrategy - this only
 * adds inline formatting/hints so the actual error is never a surprise.
 */
export default function PaymentCheckout({
  groupRef,
  totalFare,
  seatCount,
  holdExpiresAt,
  onSuccess,
  onCancel,
}: {
  groupRef: string;
  totalFare: number;
  seatCount: number;
  holdExpiresAt: string | null;
  onSuccess: (result: BookingGroupResponse) => void;
  onCancel: () => void;
}) {
  const [method, setMethod] = useState<Method>("CARD");
  const [status, setStatus] = useState<Status>("form");
  const [failureReason, setFailureReason] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<BookingGroupResponse | null>(null);

  // Card fields
  const [cardNumber, setCardNumber] = useState(""); // digits only
  const [cardHolderName, setCardHolderName] = useState("");
  const [expiry, setExpiry] = useState(""); // digits only, up to 4 (MMYY)
  const [cvv, setCvv] = useState("");
  const [cvvFocused, setCvvFocused] = useState(false);

  // Wallet fields
  const [walletPhone, setWalletPhone] = useState("");
  const [walletPin, setWalletPin] = useState("");

  const secondsLeft = useCountdown(holdExpiresAt);
  const holdExpired = secondsLeft !== null && secondsLeft <= 0;

  const cardLooksValid = luhnCheck(cardNumber) && cardNumber.length >= 13;
  const expiryLooksValid = /^\d{4}$/.test(expiry) && isFutureExpiry(expiry);
  const cvvLooksValid = /^\d{3,4}$/.test(cvv);
  const cardFormReady = cardLooksValid && expiryLooksValid && cvvLooksValid && cardHolderName.trim().length > 1;

  const walletPhoneLooksValid = /^0\d{9}$/.test(walletPhone) || /^\+94\d{9}$/.test(walletPhone);
  const walletPinLooksValid = /^\d{4}$/.test(walletPin);
  const walletFormReady = walletPhoneLooksValid && walletPinLooksValid;

  async function submit() {
    setStatus("processing");
    try {
      const result =
        method === "CARD"
          ? await PaymentApi.checkout({
              paymentMethod: "CARD",
              groupRef,
              cardNumber,
              cardHolderName,
              expiryMonth: expiry.slice(0, 2),
              expiryYear: expiry.slice(2, 4),
              cvv,
            })
          : await PaymentApi.checkout({
              paymentMethod: "WALLET",
              groupRef,
              walletPhone,
              walletPin,
            });

      const failed = result.bookings.some((b) => b.status !== "CONFIRMED");
      if (failed) {
        setFailureReason(result.paymentFailureReason ?? "Payment could not be completed. Please check your details and try again.");
        setStatus("failure");
      } else {
        setSuccessResult(result);
        setStatus("success");
      }
    } catch (err: any) {
      setFailureReason(err?.response?.data?.message ?? err.message ?? "Payment failed.");
      setStatus("failure");
    }
  }

  if (status === "success" && successResult) {
    return <SuccessScreen result={successResult} onDone={() => onSuccess(successResult)} />;
  }

  if (status === "failure") {
    return (
      <FailureScreen
        reason={failureReason ?? "Payment failed."}
        onRetry={() => setStatus("form")}
        onCancel={onCancel}
      />
    );
  }

  return (
    <div className="animate-modal-in space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Checkout</h3>
        {secondsLeft !== null && (
          <span
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
              holdExpired ? "bg-red-100 text-red-700" : secondsLeft < 60 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
            }`}
          >
            <Clock size={13} />
            {holdExpired ? "Hold expired" : `Hold: ${formatCountdown(secondsLeft)}`}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
        <span className="text-sm text-slate-500">{seatCount} seat{seatCount > 1 ? "s" : ""}</span>
        <span className="text-lg font-bold text-slate-900">LKR {totalFare.toLocaleString()}</span>
      </div>

      {holdExpired && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Your seat hold expired before payment. Go back and search again.
        </p>
      )}

      {/* Method tabs */}
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setMethod("CARD")}
          className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all ${
            method === "CARD" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
          }`}
        >
          <CreditCard size={16} /> Card
        </button>
        <button
          type="button"
          onClick={() => setMethod("WALLET")}
          className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all ${
            method === "WALLET" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
          }`}
        >
          <Smartphone size={16} /> Wallet
        </button>
      </div>

      {method === "CARD" ? (
        <div className="animate-fade-slide-up space-y-4">
          <CardPreview
            numberFormatted={formatCardNumber(cardNumber)}
            holder={cardHolderName || "YOUR NAME"}
            expiryFormatted={formatExpiryDisplay(expiry)}
            cvv={cvv}
            flipped={cvvFocused}
          />

          <div className="space-y-3">
            <Field label="Card number" valid={cardNumber.length === 0 ? undefined : cardLooksValid}>
              <input
                inputMode="numeric"
                maxLength={23}
                value={formatCardNumber(cardNumber)}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 19))}
                placeholder="4111 1111 1111 1111"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              />
            </Field>
            <Field label="Cardholder name">
              <input
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
                placeholder="As shown on card"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Expiry (MM/YY)" valid={expiry.length === 0 ? undefined : expiryLooksValid}>
                <input
                  inputMode="numeric"
                  maxLength={5}
                  value={formatExpiryDisplay(expiry)}
                  onChange={(e) => setExpiry(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="MM/YY"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                />
              </Field>
              <Field label="CVV" valid={cvv.length === 0 ? undefined : cvvLooksValid}>
                <input
                  inputMode="numeric"
                  maxLength={4}
                  value={cvv}
                  onFocus={() => setCvvFocused(true)}
                  onBlur={() => setCvvFocused(false)}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="123"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                />
              </Field>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fade-slide-up space-y-4">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white shadow-lg">
            <div className="flex items-center gap-2 text-sm opacity-90">
              <Smartphone size={16} /> Digital Wallet
            </div>
            <p className="mt-3 text-xl font-semibold tracking-wide">
              {walletPhone || "07X XXX XXXX"}
            </p>
          </div>
          <div className="space-y-3">
            <Field label="Mobile number" valid={walletPhone.length === 0 ? undefined : walletPhoneLooksValid}>
              <input
                inputMode="tel"
                maxLength={12}
                value={walletPhone}
                onChange={(e) => setWalletPhone(e.target.value.replace(/[^\d+]/g, ""))}
                placeholder="07XXXXXXXX"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              />
            </Field>
            <Field label="Wallet PIN" valid={walletPin.length === 0 ? undefined : walletPinLooksValid}>
              <input
                inputMode="numeric"
                type="password"
                maxLength={4}
                value={walletPin}
                onChange={(e) => setWalletPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="4-digit PIN"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              />
            </Field>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Lock size={12} /> Sandbox payment - no real card or wallet is charged.
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={holdExpired || (method === "CARD" ? !cardFormReady : !walletFormReady) || (status as Status) === "processing"}
          onClick={submit}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition-transform enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {(status as Status) === "processing" ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Processing...
            </>
          ) : (
            `Pay LKR ${totalFare.toLocaleString()}`
          )}
        </button>
      </div>
    </div>
  );
}

function CardPreview({
  numberFormatted,
  holder,
  expiryFormatted,
  cvv,
  flipped,
}: {
  numberFormatted: string;
  holder: string;
  expiryFormatted: string;
  cvv: string;
  flipped: boolean;
}) {
  return (
    <div className="card-flip-container h-48 w-full">
      <div className={`card-flip-inner h-full w-full ${flipped ? "flipped" : ""}`}>
        {/* Front */}
        <div className="card-face h-full w-full rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-black p-5 text-white shadow-xl">
          <div className="animate-card-shimmer absolute inset-0 rounded-2xl" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="h-8 w-11 rounded-md bg-gradient-to-br from-amber-300 to-amber-500" />
              <CreditCard size={22} className="opacity-70" />
            </div>
            <p className="font-mono text-xl tracking-widest">{numberFormatted || "•••• •••• •••• ••••"}</p>
            <div className="flex items-end justify-between text-sm">
              <div>
                <p className="text-[10px] uppercase tracking-wide opacity-60">Card holder</p>
                <p className="font-medium uppercase tracking-wide">{holder}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide opacity-60">Expires</p>
                <p className="font-medium">{expiryFormatted || "MM/YY"}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Back (CVV) */}
        <div className="card-face card-face-back h-full w-full rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-black text-white shadow-xl">
          <div className="mt-5 h-10 w-full bg-black" />
          <div className="mt-6 flex justify-end px-5">
            <div className="flex h-8 w-16 items-center justify-end rounded bg-white px-2 font-mono text-sm text-slate-900">
              {cvv.padEnd(3, "•")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  valid,
  children,
}: {
  label: string;
  valid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
        {label}
        {valid === true && <CheckCircle2 size={13} className="text-emerald-500" />}
        {valid === false && <XCircle size={13} className="text-red-400" />}
      </span>
      {children}
    </label>
  );
}

function SuccessScreen({ result, onDone }: { result: BookingGroupResponse; onDone: () => void }) {
  return (
    <div className="animate-modal-in flex flex-col items-center py-4 text-center">
      <svg viewBox="0 0 52 52" className="h-20 w-20 animate-pop-in text-emerald-500">
        <circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
        <path
          d="M14 27l7 7 17-17"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-draw-check"
        />
      </svg>
      <h3 className="mt-4 text-xl font-bold text-slate-900">Payment successful</h3>
      <p className="mt-1 text-sm text-slate-500">
        {result.bookings.length} seat{result.bookings.length > 1 ? "s" : ""} confirmed - LKR {result.totalFare.toLocaleString()}
      </p>

      <div className="mt-5 w-full space-y-3">
        {result.bookings.map((b, i) => (
          <div
            key={b.bookingId}
            className="animate-fade-slide-up flex items-center gap-3 rounded-xl border border-slate-200 p-3"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {b.qrCodeBase64 && (
              <img src={`data:image/png;base64,${b.qrCodeBase64}`} alt="QR ticket" className="h-16 w-16 rounded-lg border" />
            )}
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-800">Seat {b.seatNumber}</p>
              <p className="text-xs text-slate-500">{b.ticketReference}</p>
              <p className="text-xs text-slate-400">{b.pickupStopName} → {b.dropStopName}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onDone}
        className="mt-6 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:scale-[1.02] transition-transform"
      >
        View My Bookings
      </button>
    </div>
  );
}

function FailureScreen({ reason, onRetry, onCancel }: { reason: string; onRetry: () => void; onCancel: () => void }) {
  return (
    <div className="animate-modal-in flex flex-col items-center py-4 text-center">
      <div className="animate-shake flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
        <XCircle size={44} className="text-red-500" />
      </div>
      <h3 className="mt-4 text-xl font-bold text-slate-900">Payment failed</h3>
      <p className="mt-1 max-w-xs text-sm text-slate-500">{reason}</p>

      <div className="mt-6 flex w-full gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onRetry}
          className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:scale-[1.02] transition-transform"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

function formatCardNumber(digits: string): string {
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiryDisplay(digits: string): string {
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
}

function isFutureExpiry(mmYY: string): boolean {
  const month = parseInt(mmYY.slice(0, 2), 10);
  const year = 2000 + parseInt(mmYY.slice(2, 4), 10);
  if (!month || month < 1 || month > 12) return false;
  const now = new Date();
  const expiry = new Date(year, month, 0); // last day of that month
  return expiry >= new Date(now.getFullYear(), now.getMonth(), 1);
}

/** Same Luhn checksum the backend uses - here purely for an inline "looks valid" hint. */
function luhnCheck(digits: string): boolean {
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

function useCountdown(targetIso: string | null): number | null {
  const [seconds, setSeconds] = useState<number | null>(
    targetIso ? Math.round((new Date(targetIso).getTime() - Date.now()) / 1000) : null
  );
  useEffect(() => {
    if (!targetIso) return;
    const interval = setInterval(() => {
      setSeconds(Math.round((new Date(targetIso).getTime() - Date.now()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetIso]);
  return seconds;
}

function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
