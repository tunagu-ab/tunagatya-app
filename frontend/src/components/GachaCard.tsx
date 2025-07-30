import Link from 'next/link';

// gachaオブジェクトの型を定義
export type Gacha = {
  id: string;
  name: string;
  price: number;
  thumbnail_url: string | null;
  current_stock: number;
  total_stock: number;
  category: string | null;
};

type GachaCardProps = {
  gacha: Gacha;
};

export default function GachaCard({ gacha }: GachaCardProps) {
  const stockPercentage = gacha.total_stock > 0 ? (gacha.current_stock / gacha.total_stock) * 100 : 0;

  return (
    <div className="border rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
      <Link href={`/gacha/${gacha.id}`} className="block">
        <div className="relative w-full h-48 bg-gray-200">
          {gacha.thumbnail_url ? (
            <img src={gacha.thumbnail_url} alt={gacha.name} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
          {gacha.category && (
            <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
              {gacha.category}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold truncate">{gacha.name}</h3>
          <p className="text-xl font-semibold text-yellow-500 my-2">{gacha.price.toLocaleString()} P</p>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-500 h-2.5 rounded-full"
                style={{ width: `${stockPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 text-right mt-1">
              残り {gacha.current_stock} / {gacha.total_stock} 口
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
