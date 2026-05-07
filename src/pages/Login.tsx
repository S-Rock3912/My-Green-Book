import React, { useState } from 'react';
import { BookOpen, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { login, signUp } from '../hooks/useAuth';

export const Login: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    const err = mode === 'login'
      ? await login(email, password)
      : await signUp(email, password);

    setLoading(false);

    if (err) {
      setError(err);
    } else if (mode === 'signup') {
      setInfo('確認メールを送信しました。メールのリンクをクリックしてください。');
    }
  };

  return (
    <div className="min-h-dvh bg-golf-green flex flex-col items-center justify-center p-6">
      {/* ロゴ */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-golf-gold rounded-2xl flex items-center justify-center shadow-lg mb-3">
          <BookOpen size={32} className="text-golf-green-dark" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-wide">My Yardage Book</h1>
        <p className="text-green-200 text-sm mt-1">デジタルヤーデージブック</p>
      </div>

      {/* フォーム */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">
          {mode === 'login' ? 'ログイン' : '新規登録'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-golf-green"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-golf-green"
              placeholder="6文字以上"
            />
          </div>

          {error && (
            <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {info && (
            <p className="text-green-700 text-xs bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-golf-green text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-golf-green-dark transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : mode === 'login' ? (
              <><LogIn size={16} />ログイン</>
            ) : (
              <><UserPlus size={16} />登録する</>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setInfo(null); }}
            className="text-xs text-golf-green hover:underline"
          >
            {mode === 'login' ? 'アカウントを作成する' : 'ログインに戻る'}
          </button>
        </div>
      </div>
    </div>
  );
};
