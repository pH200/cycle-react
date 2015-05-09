# Changelog

## 0.22.0

Add feature: props.get('\*') for custom elements

props.get('\*') returns the Observable of the whole properties object,
as given to the custom element in the parent vtree context.

Additionally, props equals to props.get('\*') in cycle-react. Which means you
can skip `.get('*')` and get the Observable of the properties object.
This shortcut is not available for the original Cycle.js.

## 0.21.0

The alpha.
