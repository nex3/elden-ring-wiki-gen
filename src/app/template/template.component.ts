import { Component, Input, ElementRef, ViewChild } from '@angular/core';
import { CombatStats } from '../combat-stats';
import { findLastIndex } from '../utils';
import { IconLink, iconLinks } from './icon-links';
import { damageTypes } from '../damage';
import { inflictedStatusTypes } from '../status';

@Component({
  selector: 'app-template[stats]',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css' ]
})
export class TemplateComponent {

  copied = false;

  @Input() stats!: CombatStats;

  @Input() display!: 'full'|'cross-enemy'|'enemy-specific';

  @ViewChild('wrapper') private wrapper!: ElementRef<HTMLElement>;

  @ViewChild('newGamePlus') private newGamePlus!: ElementRef<HTMLElement>;

  get hasNewGameResistances(): boolean {
    return Object.values(this.stats.resistances).some(array =>
        array !== null && array.slice(1).some(value => value.length > 0));
  }

  get hasMultipleResistanceProcs(): boolean {
    return Object.values(this.stats.resistances).some(array =>
        array !== null && array.some(child => child.length > 1));
  }

  get highestNewGame(): number {
    const result = Math.max(
      ...[
        this.stats.health, this.stats.defense, this.stats.runes,
      ].map(array => findLastIndex(array, value => !!value)),
      ...Object.values(this.stats.resistances).map(array =>
          array === null
              ? 0
              : findLastIndex(array, child => child.length > 0))
    );
    return result === -1 ? 0 : result;
  }

  get enemyName(): string {
    const name = this.stats.name;
    return typeof name === 'string' ? name : name.friendlyName;
  }

  get showCrossEnemy() {
    return this.display !== 'enemy-specific';
  }

  get showEnemySpecific() {
    return this.display !== 'cross-enemy';
  }

  get inflictedDamageTypes(): string[] {
    return damageTypes.filter(type => this.stats.inflictedDamageTypes[type]);
  }

  get inflictedStatusTypes(): string[] {
    return inflictedStatusTypes
        .filter(type => this.stats.inflictedStatusTypes[type]);
  }

  isArray(value: unknown): boolean {
    return value instanceof Array;
  }

  hasNewGameValues(array?: unknown[]): boolean {
    if (!array) return false;
    return findLastIndex(array, value => !!value) > 0;
  }

  getIconLink(name: keyof typeof iconLinks): IconLink {
    return iconLinks[name];
  }

  // Work around angular/angular#42490.
  originalOrder(a: unknown, b: unknown): number {
    return 0;
  }

  async copyFormatted(): Promise<void> {
    const html = this.htmlToCopy();
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], {type: "text/html"}),
        "text/plain": new Blob([this.wrapper.nativeElement.innerText], {type: "text/plain"}),
      })
    ]);

    this.copied = true;
    setTimeout(() => this.copied = false, 2000);
  }

  async copyHtml(): Promise<void> {
    const html = this.htmlToCopy();
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/plain": new Blob([html], {type: "text/plain"}),
      })
    ]);

    this.copied = true;
    setTimeout(() => this.copied = false, 2000);
  }

  async copyNewGamePlus(): Promise<void> {
    const html = this.cleanHtml(this.newGamePlus);
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/plain": new Blob([html], {type: "text/plain"}),
      })
    ]);

    this.copied = true;
    setTimeout(() => this.copied = false, 2000);
  }

  private htmlToCopy(): string {
    return this.cleanHtml(this.wrapper);
  }

  private cleanHtml(element: ElementRef<HTMLElement>): string {
    return element.nativeElement.innerHTML
        // Details blocks should default to closed on Fextralife itself.
        .replace(/<details ([^>]+ )?open="">/g, '<details>')
        // Angular adds a bunch of comments that we don't need.
        .replace(/<!--(.|\n)*?-->/mg, '')
        // Magic Angular attributes. Fextralife's editor will strip these
        // anyway, but it makes the copy smaller and cleaner.
        .replace(/ _ng[a-z0-9-]+=""/g, '');
  }
}
