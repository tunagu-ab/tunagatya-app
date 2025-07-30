import { supabase } from '@/lib/supabase';
import GachaCard, { Gacha } from '@/components/GachaCard';

// サーバーサイドでデータをフェッチ
async function getGachas() {
  const { data, error } = await supabase
    .from('gachas')
    .select('*')
    .eq('status', 'active') // 販売中のオリパのみ取得
    .order('created_at', { ascending: false }); // 新着順

  if (error) {
    console.error('Error fetching gachas:', error);
    return [];
  }
  return data as Gacha[];
}

export default async function Home() {
  const gachas = await getGachas();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">販売中のオリパ</h1>
      {gachas.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {gachas.map((gacha) => (
            <GachaCard key={gacha.id} gacha={gacha} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">現在販売中のオリパはありません。</p>
        </div>
      )}
    </div>
  );
}
