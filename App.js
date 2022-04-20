import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ImageBackground } from 'react-native';
import {IndexProvider} from './SpeakContext'
import Content from './Content';
const back = require('./assets/back.gif');
export default function App() {
  return (
    <IndexProvider>
    <View style={styles.container}>
        <Content/>
    </View>
    </IndexProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
  
});
