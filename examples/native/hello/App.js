import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { useInteractions } from 'cycle-react/rxjs';
import { map } from 'rxjs/operators';

const [interactions, useCycle] = useInteractions(
  '',
  {
    onInputChange: map(ev => () => ev.nativeEvent.text)
  }
);

export default function Hello() {
  const name = useCycle();
  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Name:</Text>
      <TextInput
        style={{height: 40, width: 120, margin: 10, borderColor: 'gray', borderWidth: 1}}
        onChange={interactions('onInputChange')} />
      <Text style={styles.instructions}>Hello {name}</Text>
    </View>
  );
}

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
