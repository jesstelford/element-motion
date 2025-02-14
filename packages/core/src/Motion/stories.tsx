import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Motion from './index';
import Noop from '../../../motions/src/Noop';

interface MotionProfilerProps {
  iterations: number;
}

interface MotionProfilerState {
  start: boolean;
  profiling: boolean;
  finished: boolean;
}

class MotionProfiler extends React.Component<MotionProfilerProps, MotionProfilerState> {
  state: MotionProfilerState = MotionProfiler.getDefaultState();

  curStart: number = -1;

  curEnd: number = -1;

  results: number[] = [];

  iteration: number = 1;

  onNextIteration = () => {
    this.iteration += 1;

    this.setState(
      {
        start: false,
      },
      () => {
        if (this.iteration < this.props.iterations) {
          this.curEnd = Date.now();
          this.results.push(this.curEnd - this.curStart);
          this.curStart = Date.now();

          this.setState({
            start: true,
          });
        } else {
          this.curEnd = Date.now();
          this.results.push(this.curEnd - this.curStart);

          this.setState({
            finished: true,
          });
        }
      }
    );
  };

  start = () => {
    this.curStart = Date.now();

    this.setState(
      {
        profiling: true,
      },
      () => {
        this.setState({
          start: true,
        });
      }
    );
  };

  reset = () => {
    this.curStart = -1;
    this.curEnd = -1;
    this.results = [];
    this.iteration = 1;
    this.setState(MotionProfiler.getDefaultState(), this.start);
  };

  static getDefaultState() {
    return {
      start: false,
      profiling: false,
      finished: false,
    };
  }

  getAverage() {
    return Math.ceil(this.results.reduce((val, total) => val + total, 0) / this.results.length);
  }

  render() {
    if (this.state.finished) {
      return (
        <React.Fragment>
          {`avg: ${this.getAverage()}ms`}
          <button type="button" onClick={this.reset}>
            reset
          </button>
        </React.Fragment>
      );
    }

    if (!this.state.profiling) {
      return (
        <button type="button" onClick={this.start}>
          start
        </button>
      );
    }

    return (
      <div>
        {!this.state.start ? (
          <Motion name="profiler">
            <Noop>
              {motion => (
                <div {...motion}>
                  <span>{this.iteration}</span>
                </div>
              )}
            </Noop>
          </Motion>
        ) : (
          <div>
            <Motion name="profiler" onFinish={this.onNextIteration}>
              {motion => (
                <div {...motion}>
                  <span>{this.iteration}</span>
                </div>
              )}
            </Motion>
          </div>
        )}
      </div>
    );
  }
}

storiesOf('@element-motion/core/Motion', module)
  .add('profiler (1)', () => <MotionProfiler iterations={1} />)
  .add('profiler (10)', () => <MotionProfiler iterations={10} />)
  .add('profiler (100)', () => <MotionProfiler iterations={100} />)
  .add('profiler (1000)', () => <MotionProfiler iterations={1000} />);
