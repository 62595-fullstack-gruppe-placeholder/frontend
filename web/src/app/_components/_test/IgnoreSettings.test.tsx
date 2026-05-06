import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IgnoreSettingsButtons } from '../IgnoreSettings';

describe('IgnoreSettingsButtons', () => {
  const mockOnSelectedChange = vi.fn();
  const defaultExtensions = new Set(['.ts', '.js', '.py']);

  beforeEach(() => {
    mockOnSelectedChange.mockClear();
  });

  it('should render the scan settings section header', () => {
    render(
      <IgnoreSettingsButtons
        extensions={defaultExtensions}
        onSelectedChange={mockOnSelectedChange}
      />
    );

    expect(screen.getByText('Scan Settings')).toBeInTheDocument();
  });

  it('should start with settings hidden and show on click', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <IgnoreSettingsButtons
        extensions={defaultExtensions}
        onSelectedChange={mockOnSelectedChange}
      />
    );

    // Settings should be hidden initially
    let settingsContent = container.querySelector('.space-y-4');
    expect(settingsContent).not.toBeInTheDocument();

    // Click to expand
    const header = screen.getByText('Scan Settings').closest('div')?.parentElement;
    await user.click(header!);

    settingsContent = container.querySelector('.space-y-4');
    expect(settingsContent).toBeInTheDocument();
  });

  it('should toggle between expanded and collapsed state', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <IgnoreSettingsButtons
        extensions={defaultExtensions}
        onSelectedChange={mockOnSelectedChange}
      />
    );

    const header = screen.getByText('Scan Settings').closest('div')?.parentElement;

    // First click - expand
    await user.click(header!);
    let settingsContent = container.querySelector('.space-y-4');
    expect(settingsContent).toBeInTheDocument();

    // Second click - collapse
    await user.click(header!);
    settingsContent = container.querySelector('.space-y-4');
    expect(settingsContent).not.toBeInTheDocument();
  });

  it('should render all available extensions as checkboxes when expanded', async () => {
    const user = userEvent.setup();
    render(
      <IgnoreSettingsButtons
        extensions={defaultExtensions}
        onSelectedChange={mockOnSelectedChange}
      />
    );

    // Expand the settings
    const header = screen.getByText('Scan Settings').closest('div')?.parentElement;
    await user.click(header!);

    // Expand the Programming Languages category (where .ts, .js, .py are)
    const programmingCategory = screen.getByText('Programming Languages');
    await user.click(programmingCategory);

    // Extensions should be visible as labels
    expect(screen.getByLabelText('.ts')).toBeInTheDocument();
    expect(screen.getByLabelText('.js')).toBeInTheDocument();
    expect(screen.getByLabelText('.py')).toBeInTheDocument();
  });

  it('should check extensions that are in the selected set', async () => {
    const user = userEvent.setup();
    const selected = new Set(['.ts', '.py']);
    render(
      <IgnoreSettingsButtons
        extensions={selected}
        onSelectedChange={mockOnSelectedChange}
      />
    );

    // Expand to see checkboxes
    const header = screen.getByText('Scan Settings').closest('div')?.parentElement;
    await user.click(header!);

    // Expand the Programming Languages category
    const programmingCategory = screen.getByText('Programming Languages');
    await user.click(programmingCategory);

    const tsCheckbox = screen.getByLabelText('.ts');
    const jsCheckbox = screen.getByLabelText('.js');
    const pyCheckbox = screen.getByLabelText('.py');

    expect(tsCheckbox).toHaveAttribute('aria-checked', 'true');
    expect(jsCheckbox).toHaveAttribute('aria-checked', 'false');
    expect(pyCheckbox).toHaveAttribute('aria-checked', 'true');
  });

  it('should toggle a checkbox and call onSelectedChange with updated set', async () => {
    const user = userEvent.setup();
    render(
      <IgnoreSettingsButtons
        extensions={defaultExtensions}
        onSelectedChange={mockOnSelectedChange}
      />
    );

    // Expand settings
    const header = screen.getByText('Scan Settings').closest('div')?.parentElement;
    await user.click(header!);

    // Expand the Programming Languages category
    const programmingCategory = screen.getByText('Programming Languages');
    await user.click(programmingCategory);

    const tsCheckbox = screen.getByLabelText('.ts');
    await user.click(tsCheckbox);

    expect(mockOnSelectedChange).toHaveBeenCalledWith(
      expect.objectContaining({
        has: expect.any(Function),
      })
    );

    const callArg = mockOnSelectedChange.mock.calls[0][0];
    expect(callArg.has('.js')).toBe(true);
    expect(callArg.has('.py')).toBe(true);
    expect(callArg.has('.ts')).toBe(false); // ts was toggled off
  });

  it('should add an extension when unchecked checkbox is clicked', async () => {
    const user = userEvent.setup();
    const selected = new Set(['.ts']);
    render(
      <IgnoreSettingsButtons
        extensions={selected}
        onSelectedChange={mockOnSelectedChange}
      />
    );

    // Expand settings
    const header = screen.getByText('Scan Settings').closest('div')?.parentElement;
    await user.click(header!);

    // Expand the Programming Languages category
    const programmingCategory = screen.getByText('Programming Languages');
    await user.click(programmingCategory);

    const jsCheckbox = screen.getByLabelText('.js');
    await user.click(jsCheckbox);

    const callArg = mockOnSelectedChange.mock.calls[0][0];
    expect(callArg.has('.ts')).toBe(true);
    expect(callArg.has('.js')).toBe(true);
  });

  it('should select all extensions when "Select all" button is clicked', async () => {
    const user = userEvent.setup();
    const selected = new Set<string>();
    render(
      <IgnoreSettingsButtons
        extensions={selected}
        onSelectedChange={mockOnSelectedChange}
      />
    );

    // Expand settings
    const header = screen.getByText('Scan Settings').closest('div')?.parentElement;
    await user.click(header!);

    // Find the global "Select all" button (not the category ones)
    const selectAllButtons = screen.getAllByText('Select all');
    const globalSelectAllButton = selectAllButtons.find(button => 
      button.classList.contains('bg-button-main')
    );
    await user.click(globalSelectAllButton!);

    const callArg = mockOnSelectedChange.mock.calls[0][0];
    expect(callArg.size).toBeGreaterThan(0);
    expect(callArg.has('.ts')).toBe(true);
    expect(callArg.has('.js')).toBe(true);
  });

  it('should deselect all extensions when "Deselect all" button is clicked', async () => {
    const user = userEvent.setup();
    const selected = new Set(['.ts', '.js', '.py']);
    render(
      <IgnoreSettingsButtons
        extensions={selected}
        onSelectedChange={mockOnSelectedChange}
      />
    );

    // Expand settings
    const header = screen.getByText('Scan Settings').closest('div')?.parentElement;
    await user.click(header!);

    // Find the global "Deselect all" button (not the category ones)
    const deselectAllButtons = screen.getAllByText('Deselect all');
    const globalDeselectAllButton = deselectAllButtons.find(button => 
      button.classList.contains('bg-secondary')
    );
    await user.click(globalDeselectAllButton!);

    const callArg = mockOnSelectedChange.mock.calls[0][0];
    expect(callArg.size).toBe(0);
  });

  it('should update checkbox states when extensions prop changes', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <IgnoreSettingsButtons
        extensions={new Set(['.ts'])}
        onSelectedChange={mockOnSelectedChange}
      />
    );

    // Expand settings
    const header = screen.getByText('Scan Settings').closest('div')?.parentElement;
    await user.click(header!);

    // Expand the Programming Languages category
    const programmingCategory = screen.getByText('Programming Languages');
    await user.click(programmingCategory);

    let tsCheckbox = screen.getByLabelText('.ts');
    expect(tsCheckbox).toHaveAttribute('aria-checked', 'true');

    // Update to different extensions
    rerender(
      <IgnoreSettingsButtons
        extensions={new Set(['.js', '.py'])}
        onSelectedChange={mockOnSelectedChange}
      />
    );

    tsCheckbox = screen.getByLabelText('.ts');
    const jsCheckbox = screen.getByLabelText('.js');

    expect(tsCheckbox).toHaveAttribute('aria-checked', 'false');
    expect(jsCheckbox).toHaveAttribute('aria-checked', 'true');
  });

  it('should have proper button styling classes', async () => {
    const user = userEvent.setup();
    render(
      <IgnoreSettingsButtons
        extensions={defaultExtensions}
        onSelectedChange={mockOnSelectedChange}
      />
    );

    // Expand settings
    const header = screen.getByText('Scan Settings').closest('div')?.parentElement;
    await user.click(header!);

    // Find the global buttons by their specific classes
    const selectAllButtons = screen.getAllByText('Select all');
    const globalSelectAllButton = selectAllButtons.find(button => 
      button.classList.contains('bg-button-main')
    );
    
    const deselectAllButtons = screen.getAllByText('Deselect all');
    const globalDeselectAllButton = deselectAllButtons.find(button => 
      button.classList.contains('bg-secondary')
    );

    expect(globalSelectAllButton).toHaveClass('bg-button-main');
    expect(globalDeselectAllButton).toHaveClass('bg-secondary');
  });

  it('should maintain callback identity with useCallback', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <IgnoreSettingsButtons
        extensions={new Set(['.ts'])}
        onSelectedChange={mockOnSelectedChange}
      />
    );

    // Expand settings
    const header = screen.getByText('Scan Settings').closest('div')?.parentElement;
    await user.click(header!);

    // Expand the Programming Languages category
    const programmingCategory = screen.getByText('Programming Languages');
    await user.click(programmingCategory);

    const tsCheckbox1 = screen.getByLabelText('.ts');
    await user.click(tsCheckbox1);

    expect(mockOnSelectedChange).toHaveBeenCalledTimes(1);

    // Rerender with different extensions but same callback
    rerender(
      <IgnoreSettingsButtons
        extensions={new Set(['.js'])}
        onSelectedChange={mockOnSelectedChange}
      />
    );

    const tsCheckbox2 = screen.getByLabelText('.ts');
    await user.click(tsCheckbox2);

    expect(mockOnSelectedChange).toHaveBeenCalledTimes(2);
  });
});
