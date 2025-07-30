'use client';

import Link from 'next/link';
import { supabase } from '@/lib/supabase';

import { UserItem } from '@/types'; // 共通の型定義をインポート

type UserItemCardProps = {
  item: UserItem;
  onConvert: (convertedItemId: string, convertedPoints: number) => void;
};

export default function UserItemCard({ item, onConvert }: UserItemCardProps) {
  const itemDetails = item.items?.[0]; // 配列の最初の要素を取得 (オプショナルチェイニング)

  if (!itemDetails) {
    return null; // アイテム情報がない場合は何も表示しない
  }

  const acquiredDate = new Date(item.acquired_at).toLocaleDateString('ja-JP');
  const isConvertible = item.status === 'acquired' || item.status === 'kept';

  const handleConvert = async () => {
    if (!confirm(`${itemDetails.name} を ${itemDetails.default_point_conversion_rate} ポイントに変換しますか？`)) {
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('ログインしてください。');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/user-items/${item.id}/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'アイテムの変換に失敗しました。');
      }

      alert(`${itemDetails.name} を ${result.converted_points} ポイントに変換しました！`);
      onConvert(item.id, result.converted_points); // 親コンポーネントに通知

    } catch (err) { // errの型をanyからunknownに変更し、型ガードを行う
      if (err instanceof Error) {
        alert(`エラー: ${err.message}`);
      } else {
        alert('不明なエラーが発生しました');
      }
    }
  };

  return (
    <div className="border rounded-lg p-3 shadow-sm flex flex-col h-full">
      <div className="bg-gray-100 rounded-md aspect-w-1 aspect-h-1 flex-shrink-0">
        <img 
          src={itemDetails.image_url || 'https://storage.googleapis.com/gemini-prod-us-west1-assets/images/placeholder.jpg'} 
          alt={itemDetails.name} 
          className="w-full h-full object-contain"
        />
      </div>
      <div className="mt-3 flex flex-col flex-grow">
        <h4 className="text-base font-semibold truncate flex-grow">{itemDetails.name}</h4>
        <p className="text-sm text-gray-500">{itemDetails.rarity || 'N/A'}</p>
        <p className="text-xs text-gray-400 mt-1">獲得日: {acquiredDate}</p>
        <div className="mt-4 flex space-x-2">
          <button 
            onClick={handleConvert}
            disabled={!isConvertible}
            className="flex-1 bg-blue-500 text-white text-sm py-2 rounded-md hover:bg-blue-600 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            ポイントに変換 ({itemDetails.default_point_conversion_rate || 0} P)
          </button>
          <button 
            disabled={!isConvertible} // 仮で変換可能なら発送も可能とする
            className="flex-1 bg-green-500 text-white text-sm py-2 rounded-md hover:bg-green-600 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            発送する
          </button>
        </div>
      </div>
    </div>
  );
}
