const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // corsパッケージをインポート
const supabase = require('./src/supabase'); // Supabaseクライアントをインポート

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// CORSミドルウェアを使用
app.use(cors({
  origin: 'http://localhost:3000', // フロントエンドのURLを許可
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // 許可するHTTPメソッド
}));

// JSONリクエストボディをパースするためのミドルウェア
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from Backend!');
});

// Supabase接続テスト用のエンドポイント
app.get('/test-supabase', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) throw error;
    res.json({ message: 'Successfully connected to Supabase!', data });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data from Supabase', error: error.message });
  }
});

// ガチャを引くAPIエンドポイント (RPC呼び出しに変更)
app.post('/api/gacha/:id/draw', async (req, res) => {
  const gachaId = req.params.id;
  const { userId } = req.body; // 本来は認証ヘッダーからユーザーIDを取得しますが、今回は簡略化

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    // SupabaseのRPC（データベース関数）を呼び出す
    const { data, error } = await supabase.rpc('draw_gacha', {
      gacha_id_in: gachaId,
      p_user_id: userId
    });

    if (error) {
      // データベース関数内で発生したエラー (例: 在庫切れ、ポイント不足) をクライアントに返す
      return res.status(400).json({ message: error.message });
    }

    // RPCから返された、当たったアイテムの情報をクライアントに返す
    res.json({ 
      message: 'Successfully drew a gacha!', 
      item: data[0] // RPCは配列で結果を返すため、最初の要素を取得
    });

  } catch (error) {
    // 予期せぬサーバーエラー
    console.error('Gacha draw RPC error:', error);
    res.status(500).json({ message: 'An error occurred while drawing the gacha', error: error.message });
  }
});


// アイテムをポイントに変換するAPIエンドポイント
app.post('/api/user-items/:id/convert', async (req, res) => {
  const userItemId = req.params.id;
  const { userId } = req.body; // 本来は認証ヘッダーからユーザーIDを取得

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const { data, error } = await supabase.rpc('convert_item_to_points', {
      user_item_id_in: userItemId,
      user_id_in: userId
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ 
      message: 'アイテムをポイントに変換しました！', 
      converted_points: data 
    });

  } catch (error) {
    console.error('Item conversion RPC error:', error);
    res.status(500).json({ message: 'アイテムの変換中にエラーが発生しました', error: error.message });
  }
});


// ポイントをチャージするAPIエンドポイント (シミュレーション)
app.post('/api/charge', async (req, res) => {
  const { userId, amount } = req.body;

  if (!userId || !amount) {
    return res.status(400).json({ message: 'User ID and amount are required' });
  }

  if (amount <= 0) {
    return res.status(400).json({ message: 'Amount must be positive' });
  }

  try {
    // ユーザーの現在のポイント残高を取得
    const { data: balance, error: fetchError } = await supabase
      .from('user_balances')
      .select('current_points')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116は行が存在しないエラー
      throw fetchError;
    }

    const newPoints = (balance?.current_points || 0) + amount;

    // ポイント残高を更新 (存在しない場合は新規作成)
    const { error: upsertError } = await supabase
      .from('user_balances')
      .upsert({ user_id: userId, current_points: newPoints });

    if (upsertError) {
      throw upsertError;
    }

    // TODO: point_transactionsテーブルにも履歴を記録する

    res.json({ 
      message: `${amount}ポイントをチャージしました！`, 
      new_balance: newPoints 
    });

  } catch (error) {
    console.error('Charge error:', error);
    res.status(500).json({ message: 'ポイントのチャージ中にエラーが発生しました', error: error.message });
  }
});


app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
