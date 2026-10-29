import { flushSync } from "react-dom";

let active: ViewTransition | undefined;
let revision = 0;

/* Latest navigation wins; editing form values never triggers a page transition. */
export function changePage(
  update: () => void,
  animate: boolean,
  prepare?: Promise<unknown>,
) {
  const current = ++revision;
  active?.skipTransition();
  const commit = () => {
    if (current === revision) flushSync(update);
  };
  const preparedCommit = async () => {
    if (prepare) await prepare;
    commit();
  };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (animate && !reduced && document.startViewTransition) {
    const transition = document.startViewTransition(preparedCommit);
    active = transition;
    void transition.ready.catch(() => {});
    void transition.finished.then(() => {
      if (active === transition) active = undefined;
    });
  } else {
    const enter = () => {
      if (current !== revision) return;
      if (animate) commit();
      else update();
      if (animate && !reduced)
        document.getElementById("main")?.animate(
          [
            { opacity: 0.35, transform: "translateY(6px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 240, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
        );
    };
    if (prepare) void prepare.then(enter);
    else enter();
  }
}
