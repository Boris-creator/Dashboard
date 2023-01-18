import messages from "./messages.json";
export type glossary = {
  [key: string]: {
    [key: string]: string;
  };
};
// В джейсоне надо конечно реализовать вложенную структуру с нормальными именами ключей. Данный вариант - для скорости разработки
export const glossary: glossary = {
  en: messages.en,
  ru: Object.fromEntries(Object.keys(messages.en).map((k) => [k, k])),
};
export const locale = navigator.language.replace(/\-.+/, "");
