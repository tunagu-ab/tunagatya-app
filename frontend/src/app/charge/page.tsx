'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const chargeAmounts = [1000, 3000, 5000, 10000, 30000, 50000];

export default function ChargePage() {
  const [selectedAmount, setSelectedAmount] = useState<number>(chargeAmounts[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCharge = async () => {
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('ログインしてください。');
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id, amount: selectedAmount }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'ポイントのチャージに失敗しました。');
      }

      alert(`${result.message}\n現在のポイント: ${result.new_balance} P`);
      router.push('/mypage'); // チャージ成功後、マイページへリダイレクト

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        alert(`エラー: ${err.message}`);
      } else {
        setError('不明なエラーが発生しました');
        alert('不明なエラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center">ポイントチャージ</h1>
      <div className="mb-8">
        <p className="text-lg text-center text-gray-600">チャージする金額を選択してください。</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {chargeAmounts.map((amount) => (
          <button
            key={amount}
            onClick={() => setSelectedAmount(amount)}
            className={`p-4 border rounded-lg text-center transition duration-300 ${
              selectedAmount === amount
                ? 'bg-blue-500 text-white border-blue-500 shadow-lg'
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            <p className="text-xl font-bold">{amount.toLocaleString()} P</p>
          </button>
        ))}
      </div>
      <div className="text-center">
        <button
          onClick={handleCharge}
          disabled={loading}
          className="w-full max-w-xs bg-green-500 text-white font-bold py-4 rounded-lg shadow-lg hover:bg-green-600 transition duration-300 text-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? '処理中...' : `${selectedAmount.toLocaleString()} P をチャージする`}
        </button>
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
}