import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'spaceToPlus'
})
export class SpaceToPlusPipe implements PipeTransform {

  transform(value: string): string {
    return value.replace(' ', '+');
  }

}
