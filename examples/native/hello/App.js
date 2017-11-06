/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import {component} from 'cycle-react/rxjs';
import 'rxjs/Rx';

export default component('hello', function computer(interactions) {
  return interactions.get('OnInputChange')
    .map((ev) => ev.nativeEvent.text)
    .startWith('')
    .map((name) => (
      <View style={styles.container}>
        <Text style={styles.welcome}>Name:</Text>
        <TextInput
              style={{height: 40, width: 120, margin: 10, borderColor: 'gray', borderWidth: 1}}
              onChange={interactions.listener('OnInputChange')} />
        <Text style={styles.instructions}>Hello {name}</Text>
      </View>
    ));
});

const styles = StyleSheet.create({
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
    marginBottom: 5,
  },
});
