import Cleave from "cleave.js";
import "cleave.js/dist/addons/cleave-phone.us";
import "cleave.js/dist/addons/cleave-phone.ru";
import { ObjectDirective } from "vue";
export const cleave: ObjectDirective = {
  inserted: (el: HTMLInputElement & { cleave: Cleave }, binding) => {
    el.cleave = new Cleave(el, binding.value || {});
  },
  update: (el: HTMLInputElement & { cleave: Cleave }) => {
    const event = new Event("input", { bubbles: true });
    setTimeout(function () {
      el.value = el.cleave.properties.result;
      el.dispatchEvent(event);
    }, 100);
  },
};
