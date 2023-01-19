import { AsYouType } from "libphonenumber-js";
import { ObjectDirective } from "vue";
type Input = HTMLInputElement & { cleave: any };
function formatValue(e: InputEvent) {
  const el = e.target as Input;
  const formatter = new AsYouType(el.cleave);
  const start = el.selectionStart,
    end = el.selectionEnd;
  const event = new Event("input", { bubbles: true });
  requestAnimationFrame(function () {
    el.value = formatter.input(el.value);

    el.dispatchEvent(event);
    el.setSelectionRange(start, end);
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
