import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';

const MANAGER_URL = 'https://t.me/Ekaterinamoneys';
const PRIZE = 100000;

const SECTORS = [
  { label: '0 ₽', color: '#232327', win: false },
  { label: '500 ₽', color: '#7B2FF7', win: false },
  { label: '0 ₽', color: '#232327', win: false },
  { label: '1 000 ₽', color: '#A020F0', win: false },
  { label: '0 ₽', color: '#232327', win: false },
  { label: '100 000 ₽', color: '#FF1FB3', win: true },
  { label: '0 ₽', color: '#232327', win: false },
  { label: '300 ₽', color: '#7B2FF7', win: false },
];

const NEWS = [
  { name: 'Алексей М.', sum: '100 000 ₽', city: 'Москва' },
  { name: 'Марина К.', sum: '100 000 ₽', city: 'Казань' },
  { name: 'Дмитрий В.', sum: '100 000 ₽', city: 'СПб' },
  { name: 'Ольга С.', sum: '100 000 ₽', city: 'Новосибирск' },
  { name: 'Игорь П.', sum: '100 000 ₽', city: 'Екатеринбург' },
  { name: 'Светлана Р.', sum: '100 000 ₽', city: 'Сочи' },
];

const RND_NAMES = ['Алексей М.', 'Марина К.', 'Дмитрий В.', 'Ольга С.', 'Игорь П.', 'Светлана Р.', 'Никита Т.', 'Елена Ф.', 'Артём Б.', 'Кристина Л.', 'Роман Д.', 'Анастасия Ж.', 'Владимир Г.', 'Татьяна Н.', 'Максим О.', 'Юлия В.'];
const RND_CITIES = ['Москва', 'Казань', 'СПб', 'Новосибирск', 'Екатеринбург', 'Сочи', 'Самара', 'Уфа', 'Пермь', 'Ростов', 'Воронеж', 'Тюмень', 'Краснодар', 'Челябинск'];
const RND_SUMS = ['100 000 ₽', '100 000 ₽', '100 000 ₽', '50 000 ₽', '100 000 ₽'];
const rnd = (a: string[]) => a[Math.floor(Math.random() * a.length)];

const REVIEWS = [
  { name: 'Анна Воробьёва', text: 'Не верила, но реально пришли деньги! Заплатила комиссию, через час всё было на карте 🙏', stars: 5, avatar: '👩' },
  { name: 'Сергей Кузнецов', text: 'Выиграл 100 000 с третьей попытки. Менеджер Екатерина всё объяснила, помогла с выводом.', stars: 5, avatar: '🧔' },
  { name: 'Юлия Морозова', text: 'Спасибо за розыгрыш! Сначала думала развод, но всё честно. Рекомендую всем.', stars: 5, avatar: '👱‍♀️' },
  { name: 'Павел Никитин', text: 'Вывод занял немного времени из-за налога, но деньги получил. Доволен!', stars: 4, avatar: '👨' },
];

const BOTS = [
  { name: 'Екатерина', avatar: '👩‍💼', color: '#FF1FB3' },
  { name: 'Андрей', avatar: '👨‍🦱', color: '#7B2FF7' },
  { name: 'Виктория', avatar: '👩‍🦰', color: '#A020F0' },
];

const INITIAL_CHAT = [
  { bot: 1, text: 'Ребят, кто-нибудь выводил уже выигрыш? 😅' },
  { bot: 0, text: 'Андрей, да! Мне вчера 100 000 пришло. Просто комиссию оплатила менеджеру и всё 👍' },
  { bot: 2, text: 'Я тоже сегодня вывела, реально работает) Главное налог оплатить заранее' },
  { bot: 1, text: 'Вот это да, побежал крутить колесо 🎰' },
];

const BOT_REPLIES = [
  { bot: 0, text: 'Поздравляю!! 🎉 Скорее пиши менеджеру Екатерине, она поможет вывести' },
  { bot: 2, text: 'Ого, повезло тебе! У меня тоже с третьей попытки выпало 😍' },
  { bot: 1, text: 'Красава! Я свои уже потратил наполовину ха-ха' },
  { bot: 0, text: 'Не тяни с выводом, у них там акция ограничена по времени ⏳' },
  { bot: 2, text: 'Главное оплати комиссию и жди, всё придёт честно 💯' },
];

const Wheel = ({ spinning, rotation }: { spinning: boolean; rotation: number }) => {
  const size = 280;
  const cx = size / 2;
  const r = size / 2 - 6;
  const seg = 360 / SECTORS.length;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute left-1/2 -top-1 z-20 -translate-x-1/2"
        style={{ width: 0, height: 0, borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderTop: '26px solid #FF1FB3' }}
      />
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 4.5s cubic-bezier(0.16,1,0.3,1)' : 'none' }}
        className="drop-shadow-[0_0_30px_rgba(160,32,240,0.5)]"
      >
        <circle cx={cx} cy={cx} r={r + 5} fill="#0E0E10" stroke="#A020F0" strokeWidth="3" />
        {SECTORS.map((s, i) => {
          const a0 = (i * seg - 90) * (Math.PI / 180);
          const a1 = ((i + 1) * seg - 90) * (Math.PI / 180);
          const x0 = cx + r * Math.cos(a0);
          const y0 = cx + r * Math.sin(a0);
          const x1 = cx + r * Math.cos(a1);
          const y1 = cx + r * Math.sin(a1);
          const mid = (i * seg + seg / 2 - 90) * (Math.PI / 180);
          const tx = cx + r * 0.62 * Math.cos(mid);
          const ty = cx + r * 0.62 * Math.sin(mid);
          return (
            <g key={i}>
              <path d={`M${cx},${cx} L${x0},${y0} A${r},${r} 0 0,1 ${x1},${y1} Z`} fill={s.color} stroke="#0E0E10" strokeWidth="1.5" />
              <text x={tx} y={ty} fill="#fff" fontSize="13" fontWeight="700" textAnchor="middle" transform={`rotate(${i * seg + seg / 2},${tx},${ty})`}>{s.label}</text>
            </g>
          );
        })}
      </svg>
      <div className="absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full wb-gradient text-2xl shadow-lg">
        🎰
      </div>
    </div>
  );
};

const Index = () => {
  const [tab, setTab] = useState<'home' | 'reviews' | 'profile'>('home');
  const [attempts, setAttempts] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [balance, setBalance] = useState(0);
  const [won, setWon] = useState(false);
  const [resultMsg, setResultMsg] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const [feed, setFeed] = useState(NEWS.map((n, i) => ({ ...n, id: i })));
  const [chat, setChat] = useState(INITIAL_CHAT);
  const [chatInput, setChatInput] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chat]);

  useEffect(() => {
    const t = setInterval(() => {
      setFeed((f) => [
        { name: rnd(RND_NAMES), sum: rnd(RND_SUMS), city: rnd(RND_CITIES), id: Date.now() },
        ...f,
      ].slice(0, 12));
    }, 3500);
    return () => clearInterval(t);
  }, []);

  const spin = () => {
    if (spinning || attempts >= 3 || won) return;
    const next = attempts + 1;
    const isWin = next === 3;
    const targetIndex = isWin ? 5 : next === 1 ? 0 : 2;
    const seg = 360 / SECTORS.length;
    const base = 360 * 6;
    const target = base + (360 - (targetIndex * seg + seg / 2));
    setSpinning(true);
    setResultMsg('');
    setRotation((prev) => prev - (prev % 360) + target);
    setTimeout(() => {
      setSpinning(false);
      setAttempts(next);
      if (isWin) {
        setBalance(PRIZE);
        setWon(true);
        setResultMsg('🎉 Поздравляем! Вы выиграли 100 000 ₽!');
        setHistory((h) => [`Попытка ${next}: ВЫИГРЫШ 100 000 ₽ 🏆`, ...h]);
      } else {
        setResultMsg('😔 Увы, в этот раз не повезло. Попробуйте ещё!');
        setHistory((h) => [`Попытка ${next}: не повезло`, ...h]);
      }
    }, 4600);
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const myMsg = { bot: -1, text: chatInput.trim() };
    setChat((c) => [...c, myMsg]);
    setChatInput('');
    const reply = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];
    setTimeout(() => setChat((c) => [...c, reply]), 1400 + Math.random() * 1200);
  };

  return (
    <div className="mx-auto min-h-screen max-w-md bg-wb-dark pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-wb-dark/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl wb-gradient text-lg font-black">W</div>
          <div>
            <div className="text-base font-extrabold leading-tight">WB Розыгрыш</div>
            <div className="text-[11px] text-white/50">Жаркий розыгрыш 🔥</div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-wb-card px-3 py-1.5">
          <Icon name="Wallet" size={16} className="text-wb-pink" />
          <span className="text-sm font-bold">{balance.toLocaleString('ru-RU')} ₽</span>
        </div>
      </div>

      {/* Running news line */}
      <div className="overflow-hidden border-y border-white/5 bg-wb-card/60 py-2">
        <div className="flex w-max animate-marquee gap-8 whitespace-nowrap">
          {[...NEWS, ...NEWS].map((n, i) => (
            <span key={i} className="flex items-center gap-2 text-xs text-white/70">
              <span className="text-wb-pink">●</span>
              <b className="text-white">{n.name}</b> вывел <b className="text-wb-pink">{n.sum}</b> · {n.city}
            </span>
          ))}
        </div>
      </div>

      {tab === 'home' && (
        <div className="animate-fade-in space-y-5 px-4 pt-5">
          {/* Wheel block */}
          <div className="rounded-3xl bg-wb-card p-5 text-center">
            <div className="mb-1 text-xl font-extrabold">Колесо Фортуны</div>
            <p className="mb-4 text-xs text-white/50">У вас 3 попытки. Главный приз — 100 000 ₽!</p>
            <div className="flex justify-center">
              <Wheel spinning={spinning} rotation={rotation} />
            </div>

            <div className="mt-5 flex justify-center gap-2">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${attempts >= n ? 'wb-gradient' : 'bg-wb-card2 text-white/40'}`}
                >
                  {n}
                </div>
              ))}
            </div>

            {resultMsg && (
              <div className={`mt-4 animate-scale-in rounded-2xl px-4 py-3 text-sm font-semibold ${won ? 'bg-wb-pink/20 text-wb-pink' : 'bg-wb-card2 text-white/70'}`}>
                {resultMsg}
              </div>
            )}

            {!won ? (
              <button
                onClick={spin}
                disabled={spinning || attempts >= 3}
                className="mt-4 w-full rounded-2xl wb-gradient py-4 text-base font-extrabold text-white shadow-lg transition active:scale-95 disabled:opacity-40 animate-glow"
              >
                {spinning ? 'Крутится...' : attempts >= 3 ? 'Попытки закончились' : `Крутить колесо (${3 - attempts})`}
              </button>
            ) : (
              <button
                onClick={() => setShowWithdraw(true)}
                className="mt-4 w-full rounded-2xl bg-wb-pink py-4 text-base font-extrabold text-white shadow-lg transition active:scale-95"
              >
                💰 Вывести 100 000 ₽
              </button>
            )}
          </div>

          {/* Withdraw form */}
          {showWithdraw && (
            <div className="animate-scale-in rounded-3xl bg-wb-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <Icon name="Banknote" size={20} className="text-wb-pink" />
                <span className="text-lg font-extrabold">Вывод средств</span>
              </div>
              <div className="space-y-3">
                <input placeholder="Номер карты для вывода" className="w-full rounded-xl bg-wb-card2 px-4 py-3 text-sm outline-none placeholder:text-white/40" />
                <input placeholder="ФИО получателя" className="w-full rounded-xl bg-wb-card2 px-4 py-3 text-sm outline-none placeholder:text-white/40" />
                <div className="rounded-2xl border border-wb-pink/30 bg-wb-pink/10 p-4 text-sm text-white/80">
                  <b className="text-wb-pink">Внимание!</b> Для вывода <b>100 000 ₽</b> необходимо оплатить налог и комиссию платёжной системы — <b>3 500 ₽</b>. Сумма вернётся вместе с выигрышем. Для оплаты свяжитесь с вашим персональным менеджером.
                </div>
                <a
                  href={MANAGER_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl wb-gradient py-4 text-base font-extrabold text-white active:scale-95"
                >
                  <Icon name="Send" size={18} /> Написать менеджеру
                </a>
                <p className="text-center text-xs text-white/40">@Ekaterinamoneys · отвечает за 2 минуты</p>
              </div>
            </div>
          )}

          {/* News feed */}
          <div className="rounded-3xl bg-wb-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Icon name="TrendingUp" size={20} className="text-wb-pink" />
              <span className="text-lg font-extrabold">Лента выводов</span>
              <span className="ml-auto flex items-center gap-1 text-xs text-green-400"><span className="h-2 w-2 animate-pulse rounded-full bg-green-400" /> в реальном времени</span>
            </div>
            <div className="space-y-2">
              {feed.map((n, i) => (
                <div key={n.id} className={`flex items-center justify-between rounded-2xl bg-wb-card2 px-4 py-3 ${i === 0 ? 'animate-fade-in' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full wb-gradient text-sm font-bold">{n.name[0]}</div>
                    <div>
                      <div className="text-sm font-semibold">{n.name}</div>
                      <div className="text-[11px] text-white/40">{n.city} · только что</div>
                    </div>
                  </div>
                  <div className="text-sm font-extrabold text-wb-pink">+{n.sum}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Live chat */}
          <div className="rounded-3xl bg-wb-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Icon name="MessagesSquare" size={20} className="text-wb-pink" />
              <span className="text-lg font-extrabold">Живой чат</span>
              <span className="ml-auto flex items-center gap-1 text-xs text-green-400"><span className="h-2 w-2 rounded-full bg-green-400" /> 1 248 онлайн</span>
            </div>
            <div ref={chatRef} className="no-scrollbar mb-3 h-64 space-y-3 overflow-y-auto pr-1">
              {chat.map((m, i) => {
                const me = m.bot === -1;
                const bot = me ? null : BOTS[m.bot];
                return (
                  <div key={i} className={`flex gap-2 ${me ? 'flex-row-reverse' : ''}`}>
                    {!me && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-wb-card2 text-base">{bot!.avatar}</div>}
                    <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${me ? 'wb-gradient text-white' : 'bg-wb-card2'}`}>
                      {!me && <div className="mb-0.5 text-[11px] font-bold" style={{ color: bot!.color }}>{bot!.name}</div>}
                      {m.text}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                placeholder="Написать сообщение..."
                className="flex-1 rounded-xl bg-wb-card2 px-4 py-3 text-sm outline-none placeholder:text-white/40"
              />
              <button onClick={sendChat} className="flex h-11 w-11 items-center justify-center rounded-xl wb-gradient active:scale-90">
                <Icon name="Send" size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'reviews' && (
        <div className="animate-fade-in space-y-3 px-4 pt-5">
          <div className="text-xl font-extrabold">Отзывы победителей</div>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <span className="text-wb-pink">★★★★★</span> 4.9 · 2 847 отзывов
          </div>
          {REVIEWS.map((r, i) => (
            <div key={i} className="rounded-3xl bg-wb-card p-4">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-wb-card2 text-xl">{r.avatar}</div>
                <div>
                  <div className="text-sm font-bold">{r.name}</div>
                  <div className="text-xs text-yellow-400">{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</div>
                </div>
                <span className="ml-auto rounded-full bg-wb-pink/15 px-2 py-1 text-[10px] font-bold text-wb-pink">✓ Выплачено</span>
              </div>
              <p className="text-sm text-white/75">{r.text}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'profile' && (
        <div className="animate-fade-in space-y-4 px-4 pt-5">
          <div className="rounded-3xl wb-gradient p-5">
            <div className="text-sm text-white/80">Ваш баланс</div>
            <div className="text-3xl font-black">{balance.toLocaleString('ru-RU')} ₽</div>
            <div className="mt-1 text-xs text-white/70">Использовано попыток: {attempts} из 3</div>
          </div>
          {won && (
            <button onClick={() => { setTab('home'); setShowWithdraw(true); }} className="w-full rounded-2xl bg-wb-pink py-4 font-extrabold active:scale-95">
              💰 Вывести выигрыш
            </button>
          )}
          <div className="rounded-3xl bg-wb-card p-5">
            <div className="mb-3 text-lg font-extrabold">История попыток</div>
            {history.length === 0 ? (
              <p className="text-sm text-white/40">Вы ещё не крутили колесо. Перейдите на главную!</p>
            ) : (
              <div className="space-y-2">
                {history.map((h, i) => (
                  <div key={i} className="rounded-xl bg-wb-card2 px-4 py-3 text-sm">{h}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-white/10 bg-wb-card/95 backdrop-blur-md">
        <div className="flex justify-around py-2">
          {[
            { id: 'home', icon: 'Home', label: 'Розыгрыш' },
            { id: 'reviews', icon: 'Star', label: 'Отзывы' },
            { id: 'profile', icon: 'User', label: 'Кабинет' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`flex flex-col items-center gap-1 px-5 py-1 ${tab === t.id ? 'text-wb-pink' : 'text-white/40'}`}
            >
              <Icon name={t.icon} size={22} />
              <span className="text-[11px] font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;