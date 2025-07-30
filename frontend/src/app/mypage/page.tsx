'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import UserItemCard, { UserItem } from '@/components/UserItemCard';

// mypageで使う型を再定義
type MyPageUserItem = Omit<UserItem, 'items'> & {
  items: {
    name: string;
    rarity: string | null;
    image_url: string | null;
    default_point_conversion_rate: number;
  } | null;
};

export default function MyPage() {
  const [userItems, setUserItems] = useState<MyPageUserItem[]>([]);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // ユーザーのポイント残高を取得
      const { data: balanceData, error: balanceError } = await supabase
        .from('user_balances')
        .select('current_points')
        .eq('user_id', user.id)
        .single();

      if (balanceError) {
        console.error('Error fetching user balance:', balanceError);
        setUserPoints(0);
      } else {
        setUserPoints(balanceData?.current_points || 0);
      }

      // ユーザーが獲得したアイテムを、関連するアイテムマスターの情報と共に取得
      const { data: itemsData, error: itemsError } = await supabase
        .from('user_items')
        .select(`
          id,
          acquired_at,
          status,
          items (
            name,
            rarity,
            image_url,
            default_point_conversion_rate
          )
        `)
        .eq('user_id', user.id)
        .order('acquired_at', { ascending: false });

      if (itemsError) {
        console.error('Error fetching user items:', itemsError);
      } else {
        setUserItems(itemsData as UserItem[]);
      }
      setLoading(false);
    }

    fetchData();
  }, [router]);

  // アイテム変換後にアイテムリストとポイントを更新するコールバック
  const handleItemConverted = (convertedItemId: string, convertedPoints: number) => {
    setUserItems(prevItems => prevItems.filter(item => item.id !== convertedItemId));
    setUserPoints(prevPoints => prevPoints + convertedPoints);
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">獲得アイテム一覧</h1>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 text-center">
        <p className="text-xl font-semibold">現在のポイント: <span className="text-yellow-600 text-2xl">{userPoints.toLocaleString()}</span> P</p>
      </div>
      {userItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {userItems.map((item) => (
            <UserItemCard key={item.id} item={item} onConvert={handleItemConverted} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">まだ獲得したアイテムはありません。</p>
          <p className="text-gray-400 mt-2">ガチャを引いてアイテムを集めよう！</p>
        </div>
      )}
    </div>
  );
}
