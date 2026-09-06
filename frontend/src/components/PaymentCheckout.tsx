import { useEffect, useState } from "react";
import { CreditCard, Smartphone, Lock, CheckCircle2, XCircle, Loader2, Clock, Ticket } from "lucide-react";
import { PaymentApi, type BookingGroupResponse } from "../api/client";

type Method = "CARD" | "WALLET";
type Status = "form" | "processing" | "success" | "failure";

/**
 * PaymentCheckout Component
 *
 * Implements an editorial Sri Lankan transportation checkout interface:
 * - Method selection (Bank Debit/Credit Card or Mobile Digital Wallet: eZ Cash / FriMi / Genie).
 * - Interactive 3D credit card preview with dynamic flip to show CVV.
 * - Live Luhn checksum validation as the passenger types.
 * - Real-time 10-minute pessimistic seat hold countdown timer.
 * - Boarding pass e-ticket confirmation screen with QR code render.
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

  // Card payment fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [expiry, setExpiry] = useState(""); // digits only, up to 4 (MMYY)
  const [cvv, setCvv] = useState("");
  const [cvvFocused, setCvvFocused] = useState(false);

  // Digital Wallet fields (eZ Cash, FriMi, mCash)
  const [walletPhone, setWalletPhone] = useState("");
  const [walletPin, setWalletPin] = useState("");

  const secondsLeft = useCountdown(holdExpiresAt);
  const holdExpired = secondsLeft !== null && secondsLeft <= 0;

  // Real-time client format validations
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
        setFailureReason(
          result.paymentFailureReason ?? "Payment could not be authorized. Please review your details and retry."
        );
        setStatus("failure");
      } else {
        setSuccessResult(result);
        setStatus("success");
      }
    } catch (err: any) {
      setFailureReason(err?.response?.data?.message ?? err.message ?? "Transaction failed.");
      setStatus("failure");
    }
  }

  if (status === "success" && successResult) {
    return <SuccessScreen result={successResult} onDone={() => onSuccess(successResult)} />;
  }

  if (status === "failure") {
    return (
      <FailureScreen
        reason={failureReason ?? "Payment authorization failed."}
        onRetry={() => setStatus("form")}
        onCancel={onCancel}
      />
    );
  }

  return (
    <div className="animate-modal-in space-y-5 text-stone-900">
      {/* Checkout Header & Hold Timer */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-[#163E32]">Payment Checkout</h3>
          <p className="text-[11px] text-stone-500">Ref: <span className="font-mono font-bold text-stone-700">{groupRef}</span></p>
        </div>
        {secondsLeft !== null && (
          <span
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
              holdExpired
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : secondsLeft < 120
                ? "bg-amber-50 text-amber-800 border-amber-300 animate-pulse"
                : "bg-emerald-50 text-[#163E32] border-emerald-200"
            }`}
          >
            <Clock size={13} />
            {holdExpired ? "Seat hold expired" : `Hold: ${formatCountdown(secondsLeft)}`}
          </span>
        )}
      </div>

      {/* Fare Summary Panel */}
      <div className="flex items-center justify-between rounded-xl bg-[#FAF8F5] border border-[#E2DDD5] px-4 py-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Total Payable</p>
          <span className="text-xs font-bold text-stone-600">
            {seatCount} Passenger Seat{seatCount > 1 ? "s" : ""}
          </span>
        </div>
        <div className="text-right">
          <span className="text-lg font-black text-[#D46B24]">
            Rs. {totalFare.toLocaleString()}
          </span>
          <span className="text-[10px] text-stone-400 block">SLTB & NTC Regulated</span>
        </div>
      </div>

      {holdExpired && (
        <p className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2 text-xs font-bold text-rose-700">
          Your 10-minute temporary seat hold has expired. Please return to search to select fresh seats.
        </p>
      )}

      {/* Method Tabs */}
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-stone-100 p-1 border border-stone-200">
        <button
          type="button"
          onClick={() => setMethod("CARD")}
          className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-extrabold transition-all ${
            method === "CARD"
              ? "bg-white text-[#163E32] shadow-sm border border-stone-200"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <CreditCard size={15} /> Visa / Mastercard / LankaPay
        </button>
        <button
          type="button"
          onClick={() => setMethod("WALLET")}
          className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-extrabold transition-all ${
            method === "WALLET"
              ? "bg-white text-[#163E32] shadow-sm border border-stone-200"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <Smartphone size={15} /> Mobile Wallet (eZ Cash / FriMi)
        </button>
      </div>

      {/* Card Form */}
      {method === "CARD" ? (
        <div className="animate-fade-slide-up space-y-4">
          <CardPreview
            numberFormatted={formatCardNumber(cardNumber)}
            holder={cardHolderName || "TRAVELER NAME"}
            expiryFormatted={formatExpiryDisplay(expiry)}
            cvv={cvv}
            flipped={cvvFocused}
          />

          <div className="space-y-3">
            <Field label="Card Number" valid={cardNumber.length === 0 ? undefined : cardLooksValid}>
              <input
                inputMode="numeric"
                maxLength={23}
                value={formatCardNumber(cardNumber)}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 19))}
                placeholder="4111 2222 3333 4444"
                className="w-full rounded-xl border border-[#E2DDD5] bg-[#FAF8F5] px-3 py-2 text-xs font-bold text-stone-900 focus:border-[#163E32] focus:bg-white focus:outline-none"
              />
            </Field>

            <Field label="Cardholder Full Name">
              <input
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
                placeholder="As printed on card"
                className="w-full rounded-xl border border-[#E2DDD5] bg-[#FAF8F5] px-3 py-2 text-xs font-bold text-stone-900 focus:border-[#163E32] focus:bg-white focus:outline-none"
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
                  className="w-full rounded-xl border border-[#E2DDD5] bg-[#FAF8F5] px-3 py-2 text-xs font-bold text-stone-900 focus:border-[#163E32] focus:bg-white focus:outline-none"
                />
              </Field>

              <Field label="CVV Security Code" valid={cvv.length === 0 ? undefined : cvvLooksValid}>
                <input
                  inputMode="numeric"
                  maxLength={4}
                  value={cvv}
                  onFocus={() => setCvvFocused(true)}
                  onBlur={() => setCvvFocused(false)}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="123"
                  className="w-full rounded-xl border border-[#E2DDD5] bg-[#FAF8F5] px-3 py-2 text-xs font-bold text-stone-900 focus:border-[#163E32] focus:bg-white focus:outline-none"
                />
              </Field>
            </div>
          </div>
        </div>
      ) : (
        /* Digital Wallet Form */
        <div className="animate-fade-slide-up space-y-4">
          <div className="rounded-xl bg-[#163E32] border border-[#235547] p-4 text-white shadow-md">
            <div className="flex items-center gap-2 text-xs text-amber-300 font-extrabold uppercase tracking-wider">
              <Smartphone size={15} /> Dialog eZ Cash / Mobitel mCash / FriMi
            </div>
            <p className="mt-2 text-lg font-mono font-extrabold tracking-wide">
              {walletPhone || "07X XXX XXXX"}
            </p>
            <p className="text-[10px] text-emerald-200 mt-0.5">Instant OTP verification will be dispatched to your phone</p>
          </div>

          <div className="space-y-3">
            <Field label="Registered Mobile Number" valid={walletPhone.length === 0 ? undefined : walletPhoneLooksValid}>
              <input
                inputMode="tel"
                maxLength={12}
                value={walletPhone}
                onChange={(e) => setWalletPhone(e.target.value.replace(/[^\d+]/g, ""))}
                placeholder="0771234567"
                className="w-full rounded-xl border border-[#E2DDD5] bg-[#FAF8F5] px-3 py-2 text-xs font-bold text-stone-900 focus:border-[#163E32] focus:bg-white focus:outline-none"
              />
            </Field>

            <Field label="Wallet PIN (4 Digits)" valid={walletPin.length === 0 ? undefined : walletPinLooksValid}>
              <input
                inputMode="numeric"
                type="password"
                maxLength={4}
                value={walletPin}
                onChange={(e) => setWalletPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="••••"
                className="w-full rounded-xl border border-[#E2DDD5] bg-[#FAF8F5] px-3 py-2 text-xs font-bold text-stone-900 focus:border-[#163E32] focus:bg-white focus:outline-none"
              />
            </Field>
          </div>
        </div>
      )}

      {/* Security Guarantee */}
      <div className="flex items-center gap-2 text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
        <Lock size={13} className="text-[#163E32] shrink-0" />
        <span>Sandbox Environment: 256-bit encrypted transit gateway simulation. No real funds are deducted.</span>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-[#E2DDD5] py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
        >
          Back to Seats
        </button>
        <button
          type="button"
          disabled={holdExpired || (method === "CARD" ? !cardFormReady : !walletFormReady) || (status as Status) === "processing"}
          onClick={submit}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#163E32] hover:bg-[#1f5444] py-2.5 text-xs font-extrabold text-white shadow-md transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {(status as Status) === "processing" ? (
            <>
              <Loader2 size={15} className="animate-spin text-amber-300" /> Authorizing Payment...
            </>
          ) : (
            `Pay Rs. ${totalFare.toLocaleString()} →`
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * ─── 3D Card Preview Component ────────────────────────────────────────────────
 */
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
    <div className="card-flip-container h-44 w-full">
      <div className={`card-flip-inner h-full w-full ${flipped ? "flipped" : ""}`}>
        {/* Front */}
        <div className="card-face h-full w-full rounded-2xl bg-gradient-to-br from-[#163E32] via-[#0f2c24] to-[#1a4a3c] p-5 text-white shadow-lg border border-[#2d6253]">
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center justify-between">
              {/* EMV Chip */}
              <div className="h-7 w-10 rounded bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 border border-amber-600 shadow-inner" />
              <div className="text-right">
                <span className="font-extrabold text-[11px] tracking-widest text-amber-300">MAGIYA PASS</span>
              </div>
            </div>

            <p className="font-mono text-lg tracking-widest text-amber-100 font-semibold drop-shadow-sm">
              {numberFormatted || "•••• •••• •••• ••••"}
            </p>

            <div className="flex items-end justify-between text-xs">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-emerald-200/70 font-bold">Passenger Name</p>
                <p className="font-bold uppercase tracking-wider text-white truncate max-w-[170px]">{holder}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-wider text-emerald-200/70 font-bold">Valid Thru</p>
                <p className="font-bold text-white font-mono">{expiryFormatted || "MM/YY"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back (CVV) */}
        <div className="card-face card-face-back h-full w-full rounded-2xl bg-gradient-to-br from-[#0f2c24] to-[#163E32] text-white shadow-lg border border-[#2d6253]">
          <div className="mt-4 h-9 w-full bg-stone-900" />
          <div className="mt-4 flex justify-end px-5">
            <div className="flex h-7 w-14 items-center justify-end rounded bg-white px-2 font-mono text-xs font-bold text-stone-900 border border-stone-300">
              {cvv.padEnd(3, "•")}
            </div>
          </div>
          <p className="text-[9px] text-emerald-200/60 px-5 mt-2">Authorized Signature / Security Code</p>
        </div>
      </div>
    </div>
  );
}

/**
 * ─── Form Field Helper ────────────────────────────────────────────────────────
 */
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
      <span className="mb-1 flex items-center justify-between text-[11px] font-bold text-stone-600 uppercase tracking-wider">
        <span>{label}</span>
        {valid === true && (
          <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-extrabold">
            <CheckCircle2 size={12} /> Valid
          </span>
        )}
        {valid === false && (
          <span className="flex items-center gap-1 text-[10px] text-rose-600 font-extrabold">
            <XCircle size={12} /> Incomplete
          </span>
        )}
      </span>
      {children}
    </label>
  );
}

/**
 * ─── Success Confirmation Screen (Digital Boarding Pass) ───────────────────────
 */
function SuccessScreen({
  result,
  onDone,
}: {
  result: BookingGroupResponse;
  onDone: () => void;
}) {
  return (
    <div className="animate-modal-in flex flex-col items-center py-2 text-center text-stone-900">
      <div className="h-16 w-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#163E32] mb-3">
        <CheckCircle2 size={36} className="text-emerald-600" />
      </div>

      <h3 className="text-lg font-black text-[#163E32]">Booking Confirmed!</h3>
      <p className="text-xs text-stone-500 mt-0.5">
        {result.bookings.length} ticket{result.bookings.length > 1 ? "s" : ""} issued • Total Rs. {result.totalFare.toLocaleString()}
      </p>

      {/* Ticket List Stubs */}
      <div className="mt-4 w-full space-y-2.5 max-h-56 overflow-y-auto pr-1">
        {result.bookings.map((b, i) => (
          <div
            key={b.bookingId}
            className="animate-fade-slide-up flex items-center justify-between rounded-xl border border-[#E2DDD5] bg-[#FAF8F5] p-3 text-left"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center gap-3">
              {b.qrCodeBase64 ? (
                <img
                  src={`data:image/png;base64,${b.qrCodeBase64}`}
                  alt="QR Ticket"
                  className="h-14 w-14 rounded-lg border border-[#E2DDD5] bg-white p-0.5 shrink-0"
                />
              ) : (
                <div className="h-14 w-14 rounded-lg bg-emerald-100 flex items-center justify-center text-[#163E32]">
                  <Ticket size={24} />
                </div>
              )}
              <div>
                <span className="text-[10px] font-black uppercase text-[#D46B24] tracking-wider">
                  Seat {b.seatNumber}
                </span>
                <p className="text-xs font-mono font-bold text-stone-800">{b.ticketReference}</p>
                <p className="text-[11px] text-stone-500 font-medium">
                  {b.pickupStopName} → {b.dropStopName}
                </p>
              </div>
            </div>

            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Confirmed
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onDone}
        className="mt-5 w-full rounded-xl bg-[#163E32] hover:bg-[#1f5444] py-3 text-xs font-extrabold text-white shadow-md transition-all active:scale-95"
      >
        View My Boarding Passes →
      </button>
    </div>
  );
}

/**
 * ─── Payment Failure Screen ───────────────────────────────────────────────────
 */
function FailureScreen({
  reason,
  onRetry,
  onCancel,
}: {
  reason: string;
  onRetry: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="animate-modal-in flex flex-col items-center py-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 border border-rose-200 mb-3">
        <XCircle size={36} className="text-rose-600" />
      </div>
      <h3 className="text-lg font-black text-stone-900">Payment Authorization Failed</h3>
      <p className="mt-1 max-w-xs text-xs text-stone-500 leading-relaxed">{reason}</p>

      <div className="mt-5 flex w-full gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-[#E2DDD5] py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onRetry}
          className="flex-1 rounded-xl bg-[#163E32] hover:bg-[#1f5444] py-2.5 text-xs font-extrabold text-white shadow-md"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatters & Checksum Helpers
// ─────────────────────────────────────────────────────────────────────────────

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
  const expiry = new Date(year, month, 0);
  return expiry >= new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Standard Luhn checksum calculation (matches bank card validation rule).
 */
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
