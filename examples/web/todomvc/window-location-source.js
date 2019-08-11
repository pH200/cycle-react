import { fromEvent } from 'rxjs';
import { map, startWith } from 'rxjs/operators'

function getFilterFn(route) {
  switch (route) {
    case '/active': return task => task.get('completed') === false;
    case '/completed': return task => task.get('completed') === true;
    default: return () => true; // allow anything
  }
}

export function routeSource() {
  return fromEvent(window, 'hashchange')
    .pipe(
      map(ev => ev.newURL.match(/#[^#]*$/)[0].replace('#', '')),
      startWith(window.location.hash.replace('#', '')),
      map(route => todosData => {
        return todosData.withMutations(m => {
          m.set('filter', route.replace('/', '').trim());
          m.set('filterFn', getFilterFn(route));
        });
      })
    );
}
