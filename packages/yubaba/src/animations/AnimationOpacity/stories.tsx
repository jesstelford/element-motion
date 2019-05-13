import * as React from 'react';
import { animated, Controller } from 'react-spring';
import { storiesOf } from '@storybook/react';
import * as Common from 'yubaba-common';
import AnimatedOpacity from './index';
import { WrappedBaba as Baba } from '../../Baba';

const anim = new Controller({ opacity: 0 });

storiesOf('react-spring', module)
  .add('Default', () => (
    <Common.Toggler>
      {toggler => (
        <Baba name="animated-opacity" key={`${toggler.shown}`}>
          <AnimatedOpacity>
            {animation =>
              console.log(animation) || (
                <animated.div {...animation} onClick={() => toggler.toggle()}>
                  hello, world!
                </animated.div>
              )
            }
          </AnimatedOpacity>
        </Baba>
      )}
    </Common.Toggler>
  ))
  .add('Raw', () => (
    <Common.Toggler>
      {toggler => {
        const style = anim.update({ opacity: toggler.shown ? 1 : 0 });

        return (
          <div>
            <animated.div style={style} onClick={() => toggler.toggle()}>
              hello, world!
            </animated.div>
          </div>
        );
      }}
    </Common.Toggler>
  ));
