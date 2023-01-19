export type Fellow = NewFellow & {
  id: number;
};
export type NewFellow = {
  name: string;
  sex: 0 | 1;
  age: number;
  phone: string;
  chief?: number;
  id?: number;
};
export type Node<T> = {
  person: T;
  subordinates: Node<T>[];
};
export type Sort<T> = {
  key: keyof T;
  direction: -1 | 1;
};
