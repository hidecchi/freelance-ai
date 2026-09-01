const PASSWORD = "preview";
const STORAGE_KEY = "fa-unlocked";

export function initGate() {
  if (document.documentElement.classList.contains("is-unlocked")) {
    return;
  }

  const form = document.querySelector<HTMLFormElement>("[data-gate-form]");
  const input = document.querySelector<HTMLInputElement>("[data-gate-input]");
  input?.focus();

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input?.value ?? "";
    if (value === PASSWORD) {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // Storage can be blocked; unlocking this tab is enough.
      }
      document.documentElement.classList.add("is-unlocked");
      return;
    }
    form.classList.add("is-invalid");
    input?.select();
  });
}
