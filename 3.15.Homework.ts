// Импортируем функции, которые уже типизированы
// (их типизировать не нужно по условию задачи)
import makeOrdinal from './makeOrdinal.js';
import isFinite from './isFinite.js';
import isSafeNumber from './isSafeNumber.js';

// ШАГ 1: Типизация констант
// Все эти константы - это числа, поэтому тип: number
// Используем const вместо var (современный подход)
const TEN: number = 10;
const ONE_HUNDRED: number = 100;
const ONE_THOUSAND: number = 1000;
const ONE_MILLION: number = 1000000;
const ONE_BILLION: number = 1000000000;           //         1.000.000.000 (9)
const ONE_TRILLION: number = 1000000000000;       //     1.000.000.000.000 (12)
const ONE_QUADRILLION: number = 1000000000000000; // 1.000.000.000.000.000 (15)
const MAX: number = 9007199254740992;             // 9.007.199.254.740.992 (15)

// ШАГ 2: Типизация массивов
// Это массивы строк, поэтому тип: string[]
// readonly означает, что массив нельзя изменять (только читать)
const LESS_THAN_TWENTY: readonly string[] = [
    'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
];

const TENTHS_LESS_THAN_HUNDRED: readonly string[] = [
    'zero', 'ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
];

/**
 * Converts an integer into words.
 * If number is decimal, the decimals will be removed.
 * @example toWords(12) => 'twelve'
 * @param number - число или строка, которое нужно преобразовать
 * @param asOrdinal - опциональный параметр (устаревший), использовать toWordsOrdinal() вместо этого!
 * @returns строка с числом словами
 */
function toWords(number: number | string, asOrdinal?: boolean): string {
    let words: string;
    // parseInt возвращает number, поэтому тип num: number
    const num: number = parseInt(number.toString(), 10);

    if (!isFinite(num)) {
        throw new TypeError(
            'Not a finite number: ' + number + ' (' + typeof number + ')'
        );
    }
    if (!isSafeNumber(num)) {
        throw new RangeError(
            // ИСПРАВЛЕНИЕ 1: Экранирование апострофа
            // В строке есть апостроф в слове "it's", поэтому нужно использовать обратный слэш \'
            // Без экранирования TypeScript думает, что строка закончилась на "it"
            'Input is not a safe number, it\'s either too large or too small.'
        );
    }
    words = generateWords(num);
    // Если asOrdinal === true, преобразуем в порядковое числительное
    return asOrdinal ? makeOrdinal(words) : words;
}

/**
 * Вспомогательная функция для генерации слов из числа
 * @param number - число для преобразования
 * @param words - опциональный массив уже сгенерированных слов (для рекурсии)
 * @returns строка с числом словами
 */
function generateWords(number: number, words?: string[]): string {
    let remainder: number;
    let word: string;
    // Если words не передан, используем undefined
    // Если передан, используем его

    // Мы закончили обработку
    if (number === 0) {
        // Если words пустой или undefined, возвращаем 'zero'
        // Иначе объединяем слова и убираем запятую в конце
        return !words ? 'zero' : words.join(' ').replace(/,$/, '');
    }
    // Первый запуск функции
    if (!words) {
        words = [];
    }
    // Если число отрицательное, добавляем "minus" в начало
    if (number < 0) {
        words.push('minus');
        number = Math.abs(number);
    }

    // Обрабатываем числа меньше 20
    if (number < 20) {
        remainder = 0;
        // ИСПРАВЛЕНИЕ 2: Проверка на undefined при обращении к массиву
        // TypeScript строго проверяет типы. Когда мы обращаемся к массиву по индексу,
        // результат может быть undefined (если индекс выходит за границы массива).
        // Хотя мы знаем, что number < 20, TypeScript этого не понимает автоматически.
        // Поэтому сначала сохраняем значение в переменную, проверяем на undefined,
        // и только потом присваиваем переменной word.
        const wordFromArray = LESS_THAN_TWENTY[number];
        if (wordFromArray === undefined) {
            // Это защита от ошибок - если вдруг что-то пошло не так, мы получим понятное сообщение
            throw new Error(`Unexpected number: ${number}`);
        }
        word = wordFromArray;

    // Обрабатываем числа от 20 до 99
    } else if (number < ONE_HUNDRED) {
        remainder = number % TEN;
        // ИСПРАВЛЕНИЕ 3: Аналогичная проверка для массива десятков
        // Math.floor(number / TEN) даёт нам десятки (0-9)
        // Например: для числа 45, Math.floor(45 / 10) = 4, что соответствует "forty"
        // Но TypeScript не может гарантировать, что индекс будет валидным,
        // поэтому нужна проверка на undefined перед использованием значения.
        const tenthsWord = TENTHS_LESS_THAN_HUNDRED[Math.floor(number / TEN)];
        if (tenthsWord === undefined) {
            // Защита от неожиданных ситуаций
            throw new Error(`Unexpected number: ${number}`);
        }
        word = tenthsWord;
        // Если есть остаток (единицы), добавляем его через дефис
        if (remainder) {
            word += '-' + LESS_THAN_TWENTY[remainder];
            remainder = 0;
        }

    // Обрабатываем числа от 100 до 999 (сотни)
    } else if (number < ONE_THOUSAND) {
        remainder = number % ONE_HUNDRED;
        // Рекурсивно обрабатываем сотни и добавляем " hundred"
        word = generateWords(Math.floor(number / ONE_HUNDRED)) + ' hundred';

    // Обрабатываем числа от 1000 до 999999 (тысячи)
    } else if (number < ONE_MILLION) {
        remainder = number % ONE_THOUSAND;
        word = generateWords(Math.floor(number / ONE_THOUSAND)) + ' thousand,';

    // Обрабатываем миллионы
    } else if (number < ONE_BILLION) {
        remainder = number % ONE_MILLION;
        word = generateWords(Math.floor(number / ONE_MILLION)) + ' million,';

    // Обрабатываем миллиарды
    } else if (number < ONE_TRILLION) {
        remainder = number % ONE_BILLION;
        word = generateWords(Math.floor(number / ONE_BILLION)) + ' billion,';

    // Обрабатываем триллионы
    } else if (number < ONE_QUADRILLION) {
        remainder = number % ONE_TRILLION;
        word = generateWords(Math.floor(number / ONE_TRILLION)) + ' trillion,';

    // Обрабатываем квадриллионы (максимальное значение)
    } else if (number <= MAX) {
        remainder = number % ONE_QUADRILLION;
        word = generateWords(Math.floor(number / ONE_QUADRILLION)) +
        ' quadrillion,';
    } else {
        // На случай, если число больше MAX (хотя это не должно произойти из-за проверки isSafeNumber)
        remainder = 0;
        word = '';
    }

    // Добавляем сгенерированное слово в массив
    words.push(word);
    // Рекурсивно обрабатываем остаток
    return generateWords(remainder, words);
}

// Экспортируем функцию (современный синтаксис вместо module.exports)
export default toWords;

