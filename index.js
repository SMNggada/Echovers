/**
 * @format
 */

import 'react-native-get-random-values';
import { Buffer } from 'buffer';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Add global shims
global.Buffer = Buffer;
global.process = require('process/browser');

AppRegistry.registerComponent(appName, () => App);
