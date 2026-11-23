import { ChangeDetectionStrategy, Component, model } from '@angular/core';

/**
 * SearchBarComponent
 * - Demonstrates Modern Angular `model()` Two-Way Signal Binding
 * - Architectural distinction:
 *   - `input()`: Read-only signal from parent to child (Unidirectional).
 *   - `output()`: Event emitter from child to parent (Unidirectional).
 *   - `model()`: Writable signal backed by an implicit input + output pair.
 *     Allows `[(value)]="parentSignal"` syntax while remaining completely reactive!
 */
@Component({
  selector: 'app-search-bar',
  standalone: true,
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchBarComponent {
  /**
   * Two-way bound signal model.
   * Can be passed from parent as `[(value)]="filterState.searchQuery"`.
   * Calling `this.value.set(...)` immediately updates both the child's view
   * and the parent's writable signal.
   */
  readonly value = model<string>('');

  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.value.set(inputElement.value);
  }

  clear(): void {
    this.value.set('');
  }
}
