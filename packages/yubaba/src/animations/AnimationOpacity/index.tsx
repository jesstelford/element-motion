import * as React from 'react';
import Collector, { CollectorActions, CollectorChildrenProps } from '../../Collector';
import { Controller } from 'react-spring';

export default class AnimatedOpacity extends React.Component<CollectorChildrenProps> {
  animations: any;

  render() {
    return (
      <Collector
        data={{
          action: CollectorActions.animation,
          payload: {
            beforeAnimate: (data, onFinish, setChildProps) => {
              this.animations = new Controller({ opacity: 0 });
              setChildProps({ style: () => this.animations.update({ opacity: 0 }) });
              onFinish();
            },
            animate: (data, onFinish, setChildProps) => {
              console.log('?????');
              setChildProps({ style: () => this.animations.update({ opacity: 1 }) });
            },
          },
        }}
      >
        {this.props.children}
      </Collector>
    );
  }
}
