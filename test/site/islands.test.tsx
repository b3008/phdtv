// @vitest-environment jsdom
import { act } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { hydrateIslands } from '../../src/site/client/hydrate.tsx';
import { Island, serializeProps } from '../../src/site/islands.tsx';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function Greeting({ name, note }: { name: string; note?: string }) {
  return (
    <p>
      Hello {name}
      {note ? ` (${note})` : ''}
    </p>
  );
}

describe('Island', () => {
  it('renders the component inside a marked container followed by its props as JSON', () => {
    const html = renderToString(<Island name="DefenseSchedule" component={Greeting} props={{ name: 'Ada' }} />);
    expect(html.startsWith('<div data-island="DefenseSchedule"><p>Hello')).toBe(true);
    expect(html.endsWith('</div><script type="application/json" data-island-props="DefenseSchedule">{"name":"Ada"}</script>')).toBe(true);
  });

  it('escapes < so a closing script tag inside the props cannot end the script element', () => {
    expect(serializeProps({ note: '</script><b>' })).toBe('{"note":"\\u003c/script>\\u003cb>"}');
  });
});

describe('hydrateIslands', () => {
  it('hydrates every container from the serialised props without mismatch warnings', async () => {
    document.body.innerHTML = renderToString(
      <main>
        <Island name="DefenseSchedule" component={Greeting} props={{ name: 'Ada' }} />
        <Island name="DefenseSchedule" component={Greeting} props={{ name: 'Grace', note: 'x<y' }} />
      </main>,
    );
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    let count = 0;
    await act(async () => {
      count = hydrateIslands('DefenseSchedule', Greeting);
    });
    expect(count).toBe(2);
    expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([]);
    errors.mockRestore();
    expect(document.body.textContent).toContain('Hello Ada');
    expect(document.body.textContent).toContain('Hello Grace (x<y)');
  });

  it('throws when a container has no props script next to it', () => {
    document.body.innerHTML = '<div data-island="DefensePage"></div>';
    expect(() => hydrateIslands('DefensePage', Greeting)).toThrow('DefensePage');
  });
});
