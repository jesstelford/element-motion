import * as React from 'react';
import { easing, tween, styler } from 'popmotion';
import Collector, { CollectorActions, CollectorChildrenProps } from '../../Collector';
import { Controller } from 'react-spring';

const MoveRight = props => {
  const elementStyler = React.useRef();

  return (
    <Collector
      data={{
        action: CollectorActions.animation,
        payload: {
          beforeAnimate: (elements, onFinish, setChildProps) => {
            elementStyler.current = styler(elements.destination.element);
            onFinish();
          },
          animate: (elements, onFinish, setChildProps) => {
            tween({
              from: 0,
              to: { x: 300 },
              duration: 1000,
              ease: easing.backOut,
            }).start({
              complete: () => onFinish(),
              update: elementStyler.current.set,
            });
          },
        },
      }}
    >
      {props.children}
    </Collector>
  );
};

export default MoveRight;
