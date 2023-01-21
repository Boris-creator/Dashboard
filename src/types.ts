export type Employee = NewEmployee & {
  id: number;
};
export type NewEmployee = {
  name: string;
  sex: "male" | "female";
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
  direction: "down" | "up";
};
