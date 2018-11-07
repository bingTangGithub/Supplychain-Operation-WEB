import React, { Component } from 'react';

class View extends Component {
  componentDidMount() {
    this.props.sendRequest({ color: 'red' });
    this.props.colorChange('red');
  }

  render() {
    return (
      <div className="m-@@moduleName@@">
        <div className="detail" style={{ width: '100%', height: 100 }}>detail</div>
      </div>
    );
  }
}

export default View;
