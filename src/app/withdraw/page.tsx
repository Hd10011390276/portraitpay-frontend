/**
 * /withdraw — Withdrawal Application Page
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";

interface EarningsSummary {
  availableBalance: number;
  currency: string;
}

interface WithdrawalRecord {
  id: string;
  amount: number;
  currency: string;
  status: string;
  bankName: string | null;
  bankAccountLast4: string | null;
  accountHolder: string | null;
  rejectionReason: string | null;
  createdAt: string;
  completedAt: string | null;
}

const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  PENDING: { text: "待处理", color: "text-yellow-600 bg-yellow-50" },
  PROCESSING: { text: "处理中", color: "text-blue-600 bg-blue-50" },
  APPROVED: { text: "已通过", color: "text-green-600 bg-green-50" },
  REJECTED: { text: "已拒绝", color: "text-red-600 bg-red-50" },
  COMPLETED: { text: "已完成", color: "text-gray-600 bg-gray-50" },
  FAILED: { text: "失败", color: "text-red-600 bg-red-50" },
};

const MIN_WITHDRAWAL = 100;

export default function WithdrawPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<EarningsSummary | null>(null);
  const [history, setHistory] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [accountHolder, setAccountHolder] = useState("");

  const loadData = useCallback(async () => {
    const [balanceRes, historyRes] = await Promise.all([
      fetch("/api/v1/earnings/summary"),
      fetch("/api/v1/withdrawals"),
    ]);
    if (balanceRes.ok) {
      const d = await balanceRes.json();
      setBalance(d.data);
    }
    if (historyRes.ok) {
      const d = await historyRes.json();
      setHistory(d.data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const validateForm = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) < MIN_WITHDRAWAL) {
      return `最低提现金额为 ¥${MIN_WITHDRAWAL}`;
    }
    if (balance && Number(amount) > balance.availableBalance) {
      return `可提现余额不足，当前可提现 ¥${balance.availableBalance.toFixed(2)}`;
    }
    if (!bankName.trim()) return "请填写银行名称";
    if (!bankAccount.trim() || bankAccount.length < 8) return "请填写正确的银行账号";
    if (!accountHolder.trim()) return "请填写开户姓名";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          currency: "CNY",
          bankName,
          bankAccount,
          accountHolder,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "提交失败，请重试");
        return;
      }

      setSuccessMsg("提现申请已提交！预计 1-3 个工作日到账");
      setAmount("");
      setBankName("");
      setBankAccount("");
      setAccountHolder("");
      loadData(); // Refresh
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" }).format(v);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });

  return (
    <DashboardShell
      title="提现"
      subtitle="PortraitPay AI · 收益提现申请"
    >
      <div className="max-w-3xl space-y-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <p className="text-blue-100 text-sm mb-1">可提现余额</p>
          <p className="text-3xl sm:text-4xl font-bold">
            {loading ? "—" : formatCurrency(balance?.availableBalance ?? 0)}
          </p>
          <p className="text-blue-200 text-xs mt-2">每月1-5日为对账周期，暂停提现</p>
        </div>

        {/* Withdrawal Form */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-5">填写提现信息</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">{error}</div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">{successMsg}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">提现金额 (¥)</label>
              <input
                type="number"
                min={MIN_WITHDRAWAL}
                step="0.01"
                placeholder={`最低 ¥${MIN_WITHDRAWAL}`}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {!loading && balance && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  当前可提现：{formatCurrency(balance.availableBalance)} · 输入全部可填「{balance.availableBalance.toFixed(2)}」
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">银行名称</label>
              <input
                type="text"
                placeholder="例如：中国工商银行"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">银行账号</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="请输入银行卡号"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">开户姓名</label>
              <input
                type="text"
                placeholder="请输入持卡人姓名"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
              />
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>• 最低提现金额：¥{MIN_WITHDRAWAL}</p>
              <p>• 到账时间：1-3 个工作日</p>
              <p>• 实际到账金额 = 申请金额（含Stripe手续费）</p>
            </div>

            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {submitting ? "提交中..." : "确认提现"}
            </button>
          </form>
        </div>

        {/* History */}
        <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-800 dark:text-white">提现记录</h2>
          </div>

          {history.length === 0 ? (
            <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">暂无提现记录</div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {history.map((w) => {
                const status = STATUS_LABEL[w.status] ?? { text: w.status, color: "text-gray-600 bg-gray-50" };
                return (
                  <div key={w.id} className="px-5 py-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(w.amount)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        {w.bankName} ****{w.bankAccountLast4} · {formatDate(w.createdAt)}
                      </p>
                      {w.rejectionReason && (
                        <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">拒绝原因：{w.rejectionReason}</p>
                      )}
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${status.color}`}>
                      {status.text}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
