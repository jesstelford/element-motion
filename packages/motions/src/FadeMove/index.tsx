import * as React from 'react';
import Collector, {
  CollectorChildrenProps,
  MotionCallback,
  CollectorActions,
  MotionData,
} from '../../../core/src/Collector';
import { recalculateElementBoundingBoxFromScroll } from '../../../core/src/lib/dom';
import noop from '../../../core/src/lib/noop';
import { standard } from '../../../core/src/lib/curves';
import { zIndexStack } from '../../../core/src/lib/style';
import { dynamic } from '../../../core/src/lib/duration';
import { Duration } from '../types';

export interface FadeMoveProps extends CollectorChildrenProps {
  /**
   * How long the motion should take over {duration}ms.
   */
  duration: Duration;

  /**
   * zIndex to be applied to the moving element.
   */
  zIndex: number;

  /**
   * Timing function to be used in the transition.
   */
  timingFunction: string;

  /**
   * Enables scaling of the x-axis.
   * Defaults to true.
   */
  scaleX?: boolean;

  /**
   * Enables scaling of the y-axis.
   * Defaults to true.
   */
  scaleY?: boolean;
}

export default class FadeMove extends React.Component<FadeMoveProps> {
  static defaultProps = {
    duration: 'dynamic',
    timingFunction: standard(),
    zIndex: zIndexStack.fadeMove,
  };

  calculatedDuration: number = 0;

  renderMotion = (data: MotionData, options: { moveToTarget?: boolean } = {}) => {
    const { timingFunction, duration, zIndex, scaleY, scaleX } = this.props;
    // Scroll could have changed between unmount and this prepare step, let's recalculate just in case.
    const originTarget = recalculateElementBoundingBoxFromScroll(data.origin.elementBoundingBox);
    const destinationTarget = data.destination.elementBoundingBox;
    const translateToX = destinationTarget.location.left - originTarget.location.left;
    const translateToY = destinationTarget.location.top - originTarget.location.top;
    this.calculatedDuration =
      duration === 'dynamic' ? dynamic(originTarget, destinationTarget) : duration;
    const scaleToX = scaleX ? originTarget.size.width / destinationTarget.size.width : 1;
    const scaleToY = scaleY ? originTarget.size.height / destinationTarget.size.height : 1;

    return data.origin.render({
      ref: noop,
      style: {
        ...originTarget.location,
        zIndex,
        transition: `transform ${this.calculatedDuration}ms ${timingFunction}, opacity ${this
          .calculatedDuration / 2}ms ${timingFunction}`,
        position: 'absolute',
        transformOrigin: '0 0',
        transform: 'translate3d(0, 0, 0) scale3d(1, 1, 1)',
        opacity: 1,
        // Eliminate any margins so they don't affect the transition.
        margin: 0,
        height: `${originTarget.size.height}px`,
        width: `${originTarget.size.width}px`,
        ...(options.moveToTarget
          ? {
              transform: `translate3d(${translateToX}px, ${translateToY}px, 0) scale3d(${scaleToX}, ${scaleToY}, 1)`,
              opacity: 0,
            }
          : {}),
      },
    });
  };

  beforeAnimate: MotionCallback = (data, onFinish) => {
    onFinish();

    return this.renderMotion(data);
  };

  animate: MotionCallback = (data, onFinish) => {
    setTimeout(onFinish, this.calculatedDuration);
    return this.renderMotion(data, { moveToTarget: true });
  };

  render() {
    const { children } = this.props;

    return (
      <Collector
        data={{
          action: CollectorActions.motion,
          payload: {
            beforeAnimate: this.beforeAnimate,
            animate: this.animate,
          },
        }}
      >
        {children}
      </Collector>
    );
  }
}
