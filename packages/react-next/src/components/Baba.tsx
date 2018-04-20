import * as React from 'react';
import Collector, {
  SupplyData,
  SupplyRenderChildren,
  SupplyRef,
  ChildrenAsFunction,
  Data,
  CommonProps,
} from './Collector';
import { getElementSizeLocation } from '../lib/dom';
import * as childrenStore from '../lib/childrenStore';
import { InjectedProps, withBabaManagerContext } from './BabaManager';

type StartAnimation = () => Promise<any>;
type AnimationBlock = StartAnimation[];

/*
  v1 API

  EXAMPLE ONE - Single move animation.

  Pass ref all the way up to Baba, collecting configuration up.

  // This would move image1 over to image2 when this unmounts.
  <Baba name="image1-to-image2">
    <Move duration={300}>
      {(ref) => <Image innerRef={ref} />}
    </Move>
  </Baba>

  // This would move image2 over to image1 when this unmounts.
  <Baba name="image1-to-image2">
    <Move duration={150}>
      {(ref) => <Image innerRef={ref} />}
    </Move>
  </Baba>

  EXAMPLE TWO - Two animations with a wait.

  // 1. move image1 over to image2
  // 2. AT THE SAME TIME circle expand to cover viewport
  <Baba name="image1-to-image2">
    <CircleExpand duration={300} background="#3d7596">
      <Move duration={150}>
        {(ref) => <Image innerRef={ref} />}
      </Move>
    </CircleExpand>
  </Baba>

  // 1. move image1 over to image2
  // 2. WAIT until other transitions are finished, then
  // move shrink a circle from viewport to over image2
  <Baba name="image1-to-image2">
    <CircleExpand duration={300} background="#3d7596">
      <Wait>
        <Move duration={150}>
          {(ref) => <Image innerRef={ref} />}
        </Move>
      </Wait>
    </CircleExpand>
  </Baba>
*/

export interface Props extends CommonProps, InjectedProps {
  name: string;
}

interface State {
  shown: boolean;
}

class Baba extends React.PureComponent<Props, State> {
  state: State = {
    shown: false,
  };

  unmounting: boolean = false;
  element: HTMLElement | null;
  renderChildren: ChildrenAsFunction;
  data: Data[];
  hasStoredBefore: boolean = false;
  cancelClear?: () => void;

  componentDidMount() {
    if (childrenStore.has(this.props.name)) {
      // A child has already been stored, so this is probably the matching pair.
      // Lets execute!
      return this.execute();
    } else {
      // Ok nothing is there yet, show our children and store DOM data for later.
      // We'll be waiting for another <Baba /> instance to mount.
      this.setState({
        shown: true,
      });
      this.store();

      // If a BabaManager is a parent somewhere, notify them that
      // we're finished getting ready.
      this.props.context && this.props.context.onFinish();
    }

    return undefined;
  }

  componentWillUnmount() {
    this.unmounting = true;
    this.delayedClear();
  }

  componentDidUpdate() {
    // We've been updated. Let's store DOM data for later.
    this.store();
  }

  delayedClear() {
    if (this.hasStoredBefore) {
      const id = setTimeout(() => {
        childrenStore.remove(this.props.name);
      }, 50);

      return () => clearTimeout(id);
    }

    return () => {};
  }

  store() {
    if (this.unmounting) {
      return;
    }

    // If there is only a Baba target and no animations, data
    // will be undefined, which means there are no animations to store.
    if (this.data) {
      childrenStore.set(this.props.name, {
        ...getElementSizeLocation(this.element as HTMLElement),
        element: this.element as HTMLElement,
        render: this.renderChildren,
        data: this.data,
      });

      this.hasStoredBefore = true;
    }
  }

  execute() {
    const fromTarget = childrenStore.get(this.props.name);
    if (fromTarget) {
      const { data, ...target } = fromTarget;

      const blocks = fromTarget.data.reduce<AnimationBlock[]>(
        (arr, data) => {
          switch (data.action) {
            case 'animation': {
              const { animate } = data.payload;

              // Add to the last block in the array.
              arr[arr.length - 1].push(() =>
                animate({
                  caller: this,
                  fromTarget: target,
                  toTarget: {
                    render: this.renderChildren,
                    ...getElementSizeLocation(this.element as HTMLElement),
                  },
                })
              );

              return arr;
            }

            case 'wait': {
              // Found a wait action, start a new block.
              arr.push([]);
              return arr;
            }

            default: {
              return arr;
            }
          }
        },
        [[]]
      );

      // Run through all the data and execute all prepare funcs.
      // Wait for them to finish.
      const prepare = fromTarget.data.map(
        data => (data.action === 'animation' ? data.payload.prepare() : Promise.resolve())
      );

      // Trigger each blocks animations, one block at a time.
      return Promise.all(prepare).then(() => {
        return blocks
          .reduce<Promise<any>>(
            (promise, block) => promise.then(() => Promise.all(block.map(animate => animate()))),
            Promise.resolve()
          )
          .then(() => {
            // We're finished all the transitions! Show the child element.
            this.setState({
              shown: true,
            });

            // We don't need the previous children now. Now this instance is the new target!
            // Store DOM data for later so when another target is mounted, the data is there.
            this.store();

            // If a BabaManager is a parent somewhere, notify them that
            // we're finished animating.
            this.props.context && this.props.context.onFinish();
          });
      });
    }

    return undefined;
  }

  setRef: SupplyRef = ref => {
    this.element = ref;
  };

  setReactNode: SupplyRenderChildren = renderChildren => {
    this.renderChildren = renderChildren;
  };

  setData: SupplyData = data => {
    this.data = data;
  };

  render() {
    return (
      <Collector
        receiveData={this.setData}
        receiveRenderChildren={this.setReactNode}
        receiveRef={this.setRef}
        style={{
          opacity: this.state.shown ? 1 : 0,
        }}
      >
        {this.props.children}
      </Collector>
    );
  }
}

export default withBabaManagerContext(Baba);
