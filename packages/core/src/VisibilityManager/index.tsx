import * as React from 'react';
import { InlineStyles } from '../Collector';

export interface VisibilityManagerProps {
  /**
   * Children as function which passes down style,
   * add this to the elements you want to hide until all child motions have finished.
   */
  children: (props: { style: InlineStyles }) => React.ReactNode;

  /**
   * Optional name to target a specific child Motion.
   */
  name?: string;

  /**
   * Set to "true" if should be shown immediately on mount.
   * "false" if should wait for a motion first.
   * Defaults to false.
   */
  isInitiallyVisible?: boolean;
}

export interface State {
  style: InlineStyles;
}

export type Handler = (opts: { name: string }) => void;

export interface VisibilityManagerContext {
  onFinish: Handler;
  onStart: Handler;
}

export const MotionContext = React.createContext<VisibilityManagerContext | undefined>(undefined);

const VisibilityManager: React.FC<VisibilityManagerProps> = ({
  name,
  children,
}: VisibilityManagerProps) => {
  const context = React.useContext(MotionContext);
  const [style, setStyle] = React.useState<InlineStyles>(() => ({}));

  const onStart: Handler = opts => {
    if (context && context.onFinish) {
      context.onStart(opts);
    }

    if (name && opts.name !== name) {
      return;
    }

    console.log('hmm');

    if (style.visibility === 'visible') {
      setStyle({
        visibility: 'hidden',
      });
    }
  };

  const onFinish: Handler = opts => {
    if (context && context.onFinish) {
      context.onFinish(opts);
    }

    if (name && opts.name !== name) {
      return;
    }

    setStyle({
      visibility: 'visible',
    });
  };

  console.log(style);

  return (
    <MotionContext.Provider value={{ onFinish, onStart }}>
      {children({ style })}
    </MotionContext.Provider>
  );
};

export default VisibilityManager;
