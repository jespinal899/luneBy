import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Sparkle } from './Sparkle';

describe('<Sparkle />', () => {
  it('renderiza un svg decorativo (aria-hidden)', () => {
    const { container } = render(<Sparkle />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('aplica la className recibida', () => {
    const { container } = render(<Sparkle className="text-gold" />);
    expect(container.querySelector('svg')).toHaveClass('text-gold');
  });
});
