import * as React from 'react';
import { animated, Controller } from 'react-spring';
import { storiesOf } from '@storybook/react';
import * as Common from 'yubaba-common';
import AnimatedOpacity from './index';
import { WrappedBaba as Baba } from '../../Baba';

class Test extends React.Component {
  state = { show: true };

  animations = new Controller({ opacity: 0 });

  toggle = () => this.setState(state => ({ show: !state.show }));

  render() {
    this.animations.update({ opacity: this.state.show ? 1 : 0 }).start(x => console.log(x));

    return (
      <>
        <button type="button" onClick={this.toggle}>
          {this.state.show ? 'hide' : 'show'}
        </button>
        <animated.div style={this.animations}>I will fade</animated.div>
      </>
    );
  }
}

storiesOf('react-spring', module)
  .add('Default', () => (
    <Common.Toggler>
      {toggler => (
        <Baba name="animated-opacity" key={`${toggler.shown}`}>
          <AnimatedOpacity>
            {animation => (
              <div {...animation} role="button" onClick={() => toggler.toggle()}>
                hello, world!
              </div>
            )}
          </AnimatedOpacity>
        </Baba>
      )}
    </Common.Toggler>
  ))
  .add('Raw', () => <Test />);
