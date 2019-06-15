import * as React from 'react';
import { storiesOf } from '@storybook/react';
import styled from 'styled-components';
import { Toggler } from '@element-motion/dev';
import Motion from '../../../core/src/Motion';
import Reveal from './index';

const Container = styled.div`
  margin: 0.67rem 0;
  background-color: #ccc;
`;

const Header = styled.h1`
  margin: 0.67rem 0;
`;

storiesOf('@element-motion/core/Reveal', module)
  .add('ClipPath', () => (
    <Container>
      <Toggler>
        {toggler => (
          <Motion triggerSelfKey={`${toggler.shown}`}>
            <Reveal>
              {motion => (
                <div {...motion}>
                  {toggler.shown ? (
                    <>
                      <Header>Details</Header>
                      <p>Many details are revealed here.</p>
                      <button type="button" onClick={() => toggler.toggle()}>
                        Hide contents
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => toggler.toggle()}>
                      View contents
                    </button>
                  )}
                </div>
              )}
            </Reveal>
          </Motion>
        )}
      </Toggler>
    </Container>
  ))
  .add('WidthHeight', () => (
    <Container>
      <Toggler>
        {toggler => (
          <Motion triggerSelfKey={`${toggler.shown}`}>
            <Reveal useClipPath={false}>
              {motion => (
                <div {...motion}>
                  {toggler.shown ? (
                    <>
                      <Header>Details</Header>
                      <p>Many details are revealed here.</p>
                      <button type="button" onClick={() => toggler.toggle()}>
                        Hide contents
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => toggler.toggle()}>
                      View contents
                    </button>
                  )}
                </div>
              )}
            </Reveal>
          </Motion>
        )}
      </Toggler>
    </Container>
  ));
