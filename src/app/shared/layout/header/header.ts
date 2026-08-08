import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Button } from '../../ui/button/button';
import { Logo } from '../../ui/logo/logo';

@Component({
  selector: 'app-header',
  imports: [Button, Logo],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {}
