import { useEffect, useState, type FormEvent } from "react";
import { PaymentApi, type PaymentEntry } from "../api/client";
import { DollarSign, Search } from "lucide-react";

export default function FinanceDashboard() {
  const [payments, setPayments] = useState<PaymentEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reconcileRef, setReconcileRef] = useState("");
  const [reconcileResult, setReconcileResult] = useState<PaymentEntry | null>(null);

  function load() {
    PaymentApi.all().then(setPayments).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  async function handleRefund(payment: PaymentEntry, approved: boolean) {
    const reason = window.prompt(`Reason for ${approved ? "approving" : "rejecting"} this refund?`);
    if (!reason) return;
    try {
      await PaymentApi.refund(payment.id, approved, reason);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleReconcile(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setReconcileResult(null);
    try {
      const result = await PaymentApi.reconcile(reconcileRef);
      setReconcileResult(result);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#163E32]">
          <DollarSign size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#163E32]">Finance Dashboard</h1>
          <p className="text-xs text-[#6B8F82]">Transaction reconciliation, refunds & payment audit</p>
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {/* Reconciliation */}
      <div className="mt-6 rounded-xl border border-[#E2DDD5] bg-white p-5">
        <h2 className="text-sm font-semibold text-[#163E32]">Reconcile by transaction reference</h2>
        <form onSubmit={handleReconcile} className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8BA89E]" />
            <input
              value={reconcileRef}
              onChange={(e) => setReconcileRef(e.target.value)}
              placeholder="e.g. CARD-A1B2C3D4E5F6"
              className="w-full rounded-lg border border-[#D4CFC6] bg-white pl-9 pr-3 py-2 text-sm text-[#163E32] focus:border-[#D46B24] focus:outline-none"
            />
          </div>
          <button className="rounded-lg bg-[#163E32] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1C4D3E]">
            Look up
          </button>
        </form>
        {reconcileResult && (
          <div className="mt-3 rounded-lg bg-[#F4F1EA] p-3 text-sm text-[#163E32]">
            Booking <strong>{reconcileResult.booking.ticketReference}</strong> · {reconcileResult.method} · Rs.{reconcileResult.amount} · <StatusBadge status={reconcileResult.status} />
          </div>
        )}
      </div>

      {/* Payments List */}
      <h2 className="mt-8 text-sm font-semibold text-[#163E32]">All payments</h2>
      <div className="mt-3 space-y-2">
        {payments?.map((p) => (
          <div key={p.id} className="rounded-xl border border-[#E2DDD5] bg-white p-4 transition-colors hover:border-[#D46B24]/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#163E32]">
                  {p.booking?.ticketReference} · Rs.{p.amount} · {p.method}
                </p>
                <p className="text-xs text-[#6B8F82]">
                  {p.transactionRef} · {new Date(p.createdAt).toLocaleString()}
                </p>
                {p.flaggedDuplicate && (
                  <p className="text-xs font-medium text-[#D46B24]">⚠ Flagged as a duplicate payment attempt</p>
                )}
                {p.refundReason && <p className="text-xs text-[#6B8F82]">Refund note: {p.refundReason}</p>}
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={p.status} />
                {p.status === "SUCCESSFUL" && (
                  <div className="flex gap-1">
                    <button onClick={() => handleRefund(p, true)} className="rounded border border-emerald-300 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50">
                      Approve refund
                    </button>
                    <button onClick={() => handleRefund(p, false)} className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50">
                      Reject
                    </button>
                  </div>
                )}
                {p.status !== "FAILED" && (
                  <button
                    onClick={async () => {
                      if (confirm(`Void payment record for ${p.booking?.ticketReference}?`)) {
                        try {
                          await PaymentApi.void(p.id);
                          load();
                        } catch (err: any) {
                          setError(err.message);
                        }
                      }
                    }}
                    className="rounded border border-[#D4CFC6] px-2 py-1 text-xs text-[#3D7A68] transition-colors hover:bg-[#F4F1EA]"
                    title="Void/Invalidate Payment"
                  >
                    Void
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {payments?.length === 0 && <p className="text-[#6B8F82]">No payments yet.</p>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    SUCCESSFUL: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-amber-100 text-amber-700",
    FAILED: "bg-red-100 text-red-700",
    REFUNDED: "bg-blue-100 text-blue-700",
  };
  return <span className={`rounded-full px-2 py-1 text-xs font-medium ${colors[status] ?? "bg-[#EDE9E1]"}`}>{status}</span>;
}
