import * as React from 'react';
import { css } from 'emotion';
import Collector, {
  CollectorChildrenProps,
  AnimationCallback,
  CollectorActions,
  AnimationData,
} from '../../Collector';
import { recalculateElementBoundingBoxFromScroll } from '../../lib/dom';
import noop from '../../lib/noop';
import { standard } from '../../lib/curves';
import { zIndexStack } from '../../lib/style';
import { dynamic } from '../../lib/duration';
import { Duration } from '../types';

export interface ConcealMoveProps extends CollectorChildrenProps {
  /**
   * How long the animation should take over {duration}ms.
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
}

export default class ConcealMove extends React.Component<ConcealMoveProps> {
  static defaultProps = {
    duration: 'dynamic',
    timingFunction: standard(),
    zIndex: zIndexStack.concealMove,
  };

  calculatedDuration: number = 0;

  renderAnimation = (
    data: AnimationData,
    options: { moveToTarget?: boolean; fadeOut?: boolean } = {}
  ) => {
    if (!data.origin.focalTargetElementBoundingBox) {
      throw new Error(`yubaba
<FocalTarget /> was not found, if you haven't defined one make sure to add one as a descendant of your target Baba.`);
    }

    const { duration, timingFunction, zIndex } = this.props;
    // Scroll could have changed between unmount and this prepare step.
    const originTarget = recalculateElementBoundingBoxFromScroll(data.origin.elementBoundingBox);
    this.calculatedDuration =
      duration === 'dynamic'
        ? dynamic(originTarget, data.destination.elementBoundingBox)
        : duration;

    const focalNewLeft =
      data.origin.focalTargetElementBoundingBox.location.left -
      data.origin.elementBoundingBox.location.left;
    const focalNewTop =
      data.origin.focalTargetElementBoundingBox.location.top -
      data.origin.elementBoundingBox.location.top;
    const newLeft =
      data.destination.elementBoundingBox.location.left -
      data.origin.elementBoundingBox.location.left;
    const newTop =
      data.destination.elementBoundingBox.location.top -
      data.origin.elementBoundingBox.location.top;

    return data.origin.render({
      ref: noop,
      style: {
        zIndex,
        opacity: options.fadeOut ? 0 : 1,
        transition: `transform ${this.calculatedDuration}ms ${timingFunction}, height ${
          this.calculatedDuration
        }ms ${timingFunction}, width ${this.calculatedDuration}ms ${timingFunction}, opacity ${this
          .calculatedDuration / 2}ms ${timingFunction}`,
        position: 'absolute',
        transformOrigin: '0 0',
        willChange: 'transform, height, width',
        top: originTarget.location.top,
        left: originTarget.location.left,
        height: options.moveToTarget
          ? data.destination.elementBoundingBox.size.height
          : originTarget.size.height,
        width: options.moveToTarget
          ? data.destination.elementBoundingBox.size.width
          : originTarget.size.width,
        overflow: 'hidden',
        transform: options.moveToTarget ? `translate3d(${newLeft}px, ${newTop}px, 0) ` : 'none',
      },
      className: options.moveToTarget
        ? css`
            > * {
              transition: transform ${this.calculatedDuration}ms ${timingFunction};
              transform: translate3d(-${focalNewLeft}px, -${focalNewTop}px, 0);
            }
          `
        : undefined,
    });
  };

  beforeAnimate: AnimationCallback = (data, onFinish) => {
    onFinish();
    return this.renderAnimation(data);
  };

  animate: AnimationCallback = (data, onFinish) => {
    setTimeout(onFinish, this.calculatedDuration);

    return this.renderAnimation(data, { moveToTarget: true });
  };

  afterAnimate: AnimationCallback = (data, onFinish, setChildProps) => {
    setChildProps({
      style: () => ({
        opacity: 1,
      }),
    });

    setTimeout(onFinish, 100);

    return this.renderAnimation(data, { moveToTarget: true, fadeOut: true });
  };

  render() {
    const { children } = this.props;

    return (
      <Collector
        data={{
          action: CollectorActions.animation,
          payload: {
            beforeAnimate: this.beforeAnimate,
            animate: this.animate,
            afterAnimate: this.afterAnimate,
          },
        }}
      >
        {children}
      </Collector>
    );
  }
}
