// ユーザーが獲得したアイテムの共通の型定義
export type UserItem = {
  id: string;
  acquired_at: string;
  status: string;
  items: {
    name: string;
    rarity: string | null;
    image_url: string | null;
    default_point_conversion_rate: number;
  }[] | null; // オブジェクトの配列、またはnull
};
