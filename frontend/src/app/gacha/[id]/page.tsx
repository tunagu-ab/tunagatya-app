'use client'; // クライアントコンポーネントとしてマーク

import { supabase } from '@/lib/supabase';
import { notFound, useParams } from 'next/navigation'; // useParams をインポート
import { useEffect, useState } from 'react';

// gachaオブジェクトの型を定義
type Gacha = {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number;
  current_stock: number;
  total_stock: number;
  category: string | null;
};

// itemオブジェクトの型を定義
type Item = {
  id: string;
  name: string;
  rarity: string | null;
  image_url: string | null;
};

// このコンポーネントはクライアントサイドでデータをフェッチします
export default function GachaDetailPage() { // propsを削除
  const params = useParams(); // useParamsフックを使用
  const id = params.id as string; // idを取得

  const [gacha, setGacha] = useState<Gacha | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    if (!id) return; // idが取得できるまで何もしない

    async function fetchData() {
      setLoading(true);
      // オリパ詳細を取得
      const { data: gachaData, error: gachaError } = await supabase
        .from('gachas')
        .select('*')
        .eq('id', id)
        .single();

      if (gachaError || !gachaData) {
        return notFound();
      }
      setGacha(gachaData);

      // 封入アイテムを取得 (ダミー)
      // TODO: 将来的に gacha_items テーブルから封入アイテムを取得する
      const dummyItems = [
        { id: '1', name: 'リザードンVMAX', rarity: 'SSR', image_url: 'https://storage.googleapis.com/gemini-prod-us-west1-assets/images/placeholder.jpg' },
        { id: '2', name: 'ピカチュウV', rarity: 'SR', image_url: 'https://storage.googleapis.com/gemini-prod-us-west1-assets/images/placeholder.jpg' },
        { id: '3', name: 'ミュウツーGX', rarity: 'HR', image_url: 'https://storage.googleapis.com/gemini-prod-us-west1-assets/images/placeholder.jpg' },
      ];
      setItems(dummyItems);
      setLoading(false);
    }

    fetchData();
  }, [id]); // 依存配列をidに変更

  const handleDraw = async () => {
    setDrawing(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('ログインしてください。');
      setDrawing(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/gacha/${id}/draw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'ガチャを引けませんでした。');
      }

      // 成功した場合、当たったアイテムをアラートで表示
      alert(`おめでとうございます！\n「${result.item.name}」をゲットしました！`);
      
      // 在庫表示を更新するためにページをリロード（より良いUIは後で検討）
      window.location.reload();

    } catch (err: any) {
      setError(err.message);
      alert(`エラー: ${err.message}`);
    } finally {
      setDrawing(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!gacha) {
    return notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-200 rounded-lg mb-8">
        <img 
          src={gacha.thumbnail_url || 'https://storage.googleapis.com/gemini-prod-us-west1-assets/images/placeholder.jpg'} 
          alt={gacha.name} 
          className="w-full h-64 object-cover rounded-lg"
        />
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h1 className="text-4xl font-bold">{gacha.name}</h1>
          <p className="text-gray-600 mt-2">{gacha.category}</p>
          <p className="mt-4 text-lg">{gacha.description}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md h-fit">
          <p className="text-3xl font-bold text-center text-yellow-600">{gacha.price.toLocaleString()} P</p>
          <p className="text-center text-gray-500 mt-2">残り {gacha.current_stock} / {gacha.total_stock} 口</p>
          <button 
            onClick={handleDraw}
            disabled={drawing || gacha.current_stock <= 0}
            className="mt-6 w-full bg-red-500 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-red-600 transition duration-300 text-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {drawing ? '抽選中...' : (gacha.current_stock <= 0 ? '売り切れ' : 'ガチャを引く')}
          </button>
          {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
        </div>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">封入アイテム一例</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map(item => (
            <div key={item.id} className="border rounded-lg p-2 shadow-sm">
              <div className="bg-gray-100 rounded-md aspect-w-1 aspect-h-1">
                 <img src={item.image_url || ''} alt={item.name} className="w-full h-full object-contain" />
              </div>
              <h4 className="text-sm font-semibold mt-2 truncate">{item.name}</h4>
              <p className="text-xs text-gray-500">{item.rarity}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
