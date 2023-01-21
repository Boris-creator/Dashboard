import { AsYouType } from "libphonenumber-js";
import { ObjectDirective } from "vue";
type Input = HTMLInputElement & { mask: any };
function formatValue(e: InputEvent) {
  const el = e.target as Input;
  const formatter = new AsYouType(el.mask);
  const start = el.selectionStart ?? 0;
  const currentSymbol = el.value.slice(0, start).replace(/\D/g, "").length;
  const event = new Event("input", { bubbles: true });
  requestAnimationFrame(function () {
    el.value = formatter.input(el.value);
    const newStart = [...el.value].reduce(
      (acc, cur) => {
        if (acc.digits == currentSymbol) {
          return acc;
        }
        acc.i++;
        if (/\d/.test(cur)) {
          acc.digits++;
        }
        return acc;
      },
      { digits: 0, i: 0 }
    ).i;
    el.dispatchEvent(event);
    el.setSelectionRange(newStart, newStart);
  });
}
export const mask: ObjectDirective = {
  inserted(el: Input, binding) {
    if (!binding.value) {
      return;
    }
    el.mask = binding.value;
    el.addEventListener("input", function (e: Event) {
      if (!e.isTrusted) {
        return;
      }
      formatValue(e as InputEvent);
    });
  },
  bind(el: Input) {},
  update(el: HTMLInputElement & { mask: any }) {},
};
