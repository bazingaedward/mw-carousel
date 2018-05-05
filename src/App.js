import React, { Component } from 'react';
import logo from './logo.svg';
import ReactSwipe from './reactSwipe';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <ReactSwipe swipeOptions={{
          auto: 3000
        }}>
          <div>test</div>
          <div>hello</div>
        </ReactSwipe>
      </div>
    );
  }
}

export default App;
