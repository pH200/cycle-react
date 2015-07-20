/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var {React, component} = require('cycle-react/native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  TextInput,
  View
} = React;

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginTop: 5,
  },
});

function computer(interactions) {
  return interactions.get('OnInputChange')
    .map((ev) => ev.nativeEvent.text)
    .startWith('')
    .map((name) => (
      <View style={styles.container}>
        <Text style={styles.welcome}>Name:</Text>
        <TextInput
              style={{height: 40, margin: 10, borderColor: 'gray', borderWidth: 1}}
              onChange={interactions.listener('OnInputChange')} />
        <Text style={styles.instructions}>Hello {name}</Text>
      </View>
    ));
}

var hello = component('Hello', (interactions) => computer(interactions));

AppRegistry.registerComponent('hello', () => hello);
