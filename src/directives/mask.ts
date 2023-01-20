import { AsYouType } from "libphonenumber-js";
import { ObjectDirective } from "vue";
type Input = HTMLInputElement & { cleave: any };
function formatValue(e: InputEvent) {
  const el = e.target as Input;
  const formatter = new AsYouType(el.cleave);
  const start = el.selectionStart ?? 0;
  const currentSymbol = el.value.slice(0, start).replace(/\D/g, "").length;
  const event = new Event("input", { bubbles: true });
  requestAnimationFrame(function () {
    el.value = formatter.input(el.value);
    const newStart = [...el.value].reduce(
      (acc, cur) => {
        if (acc.d == currentSymbol) {
          return acc;
        }
        acc.i++;
        if (/\d/.test(cur)) {
          acc.d++;
        }
        return acc;
      },
      { d: 0, i: 0 }
    ).i;
    el.dispatchEvent(event);
    el.setSelectionRange(newStart, newStart);
  });
}
export const cleave: ObjectDirective = {
  inserted(el: Input, binding) {
    el.cleave = binding.value;
  },
  bind(el: Input) {
    el.addEventListener("input", function (e: Event) {
      if (!e.isTrusted) {
        return;
      }
      formatValue(e as InputEvent);
    });
  },
  update(el: HTMLInputElement & { cleave: any }) {},
};
