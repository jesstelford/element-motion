import * as React from 'react';
import Motion from '../../../core/src/Motion';
import Move from '../Move';
import { InlineStyles } from '../../../core/src/Collector';
import { Duration } from '../types';

export interface ReshapingContainerProps {
  /**
   * Will trigger the motion when this key changes.
   * Change this when you want the motions to trigger,
   * ideally when the children JSX has changed.
   */
  triggerKey: string;

  /**
   * Children as function.
   * Will receive an object with className, style, and ref.
   */
  children: (opts: { style: InlineStyles }) => React.ReactNode;

  /**
   * Defaults to "div".
   * Any valid HTML tag allowed.
   */
  as: string;

  /**
   * Used the same as the CSS property.
   * E.g. "3px"
   */
  borderRadius?: string;

  /**
   * Used the same as the CSS property.
   * E.g. "rgba(0, 0, 0, 0.5)"
   */
  background?: string;

  /**
   * Used the same as the CSS property.
   * E.g. "0 1px 50px rgba(32, 33, 36, 0.1)"
   */
  boxShadow?: string;

  /**
   * Padding.
   * Use only px values, otherwise same as the CSS property.
   * E.g. "10px"
   */
  padding: string;

  /**
   * Used the same as the CSS property.
   * E.g. "500px"
   */
  maxWidth?: string;

  /**
   * Used the same as the CSS property.
   * * E.g. "500px"
   */
  maxHeight?: string;

  /**
   * Used the same as the CSS property.
   * * E.g. "500px"
   */
  minWidth?: string;

  /**
   * Used the same as the CSS property.
   * * E.g. "500px"
   */
  minHeight?: string;

  /**
   * Used the same as the CSS property.
   * E.g. "20px auto"
   */
  margin?: string;

  /**
   * Takes either "dynamic" or a number in ms.
   * How long the motion should take over {duration}ms.
   * Defaults to "dynamic".
   */
  duration?: Duration;

  /**
   * Used the same as the CSS property.
   * Defaults to what the "as" prop is.
   */
  display?: string;

  /**
   * Used the same as the CSS property.
   * E.g. "relative"
   */
  position?: string;

  /**
   * Timing function to be used in the transition.
   */
  timingFunction?: string;
}

export default class ReshapingContainer extends React.PureComponent<ReshapingContainerProps> {
  static defaultProps = {
    as: 'div',
  };

  render() {
    const {
      children,
      background,
      maxWidth,
      maxHeight,
      minWidth,
      minHeight,
      boxShadow,
      margin,
      padding,
      duration,
      display,
      timingFunction,
      borderRadius,
      triggerKey,
      ...rest
    } = this.props;
    const ComponentAs = rest.as as any;

    return (
      <Motion triggerSelfKey={triggerKey}>
        <Move duration={duration} timingFunction={timingFunction}>
          {motion => (
            <ComponentAs
              style={{
                position: 'relative',
                minWidth,
                maxWidth,
                minHeight,
                maxHeight,
                margin,
                padding,
                display,
                borderRadius,
              }}
            >
              <div
                {...motion}
                aria-hidden="true"
                style={{
                  ...motion.style,
                  background,
                  boxShadow,
                  borderRadius,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              />

              {/* Position relative/zIndex needed to position this above the floating background. */}
              {children({
                style: {
                  maxHeight,
                  zIndex: 2,
                  // Using position: relative fucks out in Safari with clip-path resulting in clip-path not transitioning
                  position: 'relative',
                },
              })}
            </ComponentAs>
          )}
        </Move>
      </Motion>
    );
  }
}
