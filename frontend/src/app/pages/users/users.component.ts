import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <h1 class="text-2xl font-bold mb-4">Usuários</h1>
      <p class="text-gray-500 italic">Módulo de gestão de usuários em desenvolvimento...</p>
    </div>
  `
})
export class UsersComponent { }